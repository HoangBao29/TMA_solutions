import os
import glob
import json
import logging
from typing import List, Optional

import torch
import pandas as pd
from flask import Flask, jsonify, request, render_template
# Enable CORS for cross-origin requests from the frontend (mobile/web during development)
try:
    from flask_cors import CORS
except Exception:
    CORS = None

from data import load_dataset
from settings import MOVIE_LENS_100k_DATASET_PATH
from tmdb_service import tmdb_service, search_and_cache_movie, MOVIE_CACHE
from cold_start_recommender import (
    PopularityRecommender,
    ContentRecommender,
    ImplicitRecommender,
    HybridRecommender
)

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.getenv("DATASET_DIR", os.path.join(BASE_DIR, "datasets", "ml-100k"))
CACHE_FILE = os.path.join(BASE_DIR, "tmdb_cache.json")
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
YEAR_BINS = 4
GENRE_COLUMNS = [
    "unknown",
    "Action",
    "Adventure",
    "Animation",
    "Children's",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Film-Noir",
    "Horror",
    "Musical",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "War",
    "Western",
]


def _latest_file(pattern: str) -> Optional[str]:
    candidates = glob.glob(os.path.join(BASE_DIR, pattern))
    if not candidates:
        return None
    return max(candidates, key=os.path.getmtime)


def _load_data_and_models():
    """Load dataset and trained embeddings for RSAttAE inference."""
    train_df, val_df, test_df, train_rating_matrix, val_rating_matrix, test_rating_matrix, users_features, movies_features = load_dataset(
        MOVIE_LENS_100k_DATASET_PATH,
        split=1,
        val_size=0.15
    )
    
    train_rating_matrix = train_rating_matrix.to(torch.float32)
    movies_features = movies_features.to(torch.float32)

    users_emb_path = _latest_file("users_embeddings_attention_autoencoder_*.pt")
    movies_emb_path = _latest_file("movies_embeddings_attention_autoencoder_*.pt")

    if not users_emb_path or not movies_emb_path:
        raise FileNotFoundError(
            "Missing trained embeddings. Run train_user_attention_autoencoder.py and "
            "train_movie_attention_autoencoder.py to generate *.pt files."
        )

    users_emb = torch.load(users_emb_path, map_location="cpu").float()
    movies_emb = torch.load(movies_emb_path, map_location="cpu").float()

    users_emb = users_emb / (users_emb.norm(dim=1, keepdim=True) + 1e-8)
    movies_emb = movies_emb / (movies_emb.norm(dim=1, keepdim=True) + 1e-8)

    movies_features_norm = movies_features / (movies_features.norm(dim=1, keepdim=True) + 1e-8)

    return {
        'train_rating_matrix': train_rating_matrix,
        'users_emb': users_emb,
        'movies_emb': movies_emb,
        'movies_features': movies_features,
        'movies_features_norm': movies_features_norm,
        'device': DEVICE
    }




def _load_movie_titles() -> List[str]:
    """Load movie titles from dataset."""
    item_path = os.path.join(DATASET_DIR, "u.item")
    if not os.path.exists(item_path):
        return []
    df = pd.read_table(
        item_path,
        header=None,
        sep="|",
        encoding="latin-1",
        names=[
            "movie_id",
            "movie_title",
            "release_date",
            "video_release_date",
            "imdb_url",
            "unknown",
            "Action",
            "Adventure",
            "Animation",
            "Children's",
            "Comedy",
            "Crime",
            "Documentary",
            "Drama",
            "Fantasy",
            "Film-Noir",
            "Horror",
            "Musical",
            "Mystery",
            "Romance",
            "Sci-Fi",
            "Thriller",
            "War",
            "Western",
        ],
    )
    titles = df["movie_title"].tolist()
    return titles


def _load_movie_data() -> dict:
    """Load detailed movie data from dataset."""
    item_path = os.path.join(DATASET_DIR, "u.item")
    if not os.path.exists(item_path):
        return {}
    
    df = pd.read_table(
        item_path,
        header=None,
        sep="|",
        encoding="latin-1",
        names=[
            "movie_id",
            "movie_title",
            "release_date",
            "video_release_date",
            "imdb_url",
            "unknown",
            "Action",
            "Adventure",
            "Animation",
            "Children's",
            "Comedy",
            "Crime",
            "Documentary",
            "Drama",
            "Fantasy",
            "Film-Noir",
            "Horror",
            "Musical",
            "Mystery",
            "Romance",
            "Sci-Fi",
            "Thriller",
            "War",
            "Western",
        ],
    )
    
    # Convert to dictionary indexed by movie_id (1-based from dataset, but we use 0-based)
    movie_data_dict = {}
    for idx, row in df.iterrows():
        genre_cols = GENRE_COLUMNS
        genres = [g for g in genre_cols if row.get(g, 0) == 1]
        
        movie_data_dict[idx] = {
            "movie_id": idx,
            "title": row["movie_title"],
            "release_date": row["release_date"],
            "imdb_url": row["imdb_url"],
            "genres": genres,
        }
    
    return movie_data_dict


def _load_tmdb_cache():
    """Load TMDB cache from file."""
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load cache: {e}")
    return {}


def _save_tmdb_cache():
    """Save TMDB cache to file."""
    try:
        with open(CACHE_FILE, 'w') as f:
            json.dump(MOVIE_CACHE, f)
    except Exception as e:
        logger.warning(f"Failed to save cache: {e}")


app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
# Apply CORS if available; this allows the React Native/web frontend to contact the Flask API
if CORS is not None:
    CORS(app)
else:
    # If Flask-Cors is not installed the server will still work for same-origin calls
    print("Warning: flask_cors not installed; cross-origin requests may fail.\nInstall with: pip install Flask-Cors")

# User ratings storage (in production, use database)
USER_RATINGS = {}  # Format: {session_id: {movie_id: rating}}
USER_PREFERENCES = {}  # Format: {session_id: {favorite_genres: [], ...}}
USER_INTERACTIONS = {}  # Format: {session_id: {clicks: [], views: []}}

print("Loading data and embeddings...")
MODELS_DATA = _load_data_and_models()
MOVIE_TITLES = _load_movie_titles()
MOVIE_DATA = _load_movie_data()

# Load TMDB cache
print("Loading TMDB cache...")
cached_data = _load_tmdb_cache()
MOVIE_CACHE.update(cached_data)
print(f"Loaded {len(cached_data)} cached TMDB entries")

# Initialize cold-start recommenders
print("Initializing cold-start recommenders...")
popularity_rec = PopularityRecommender(MOVIE_CACHE)
content_rec = ContentRecommender(
    MODELS_DATA['movies_features'], 
    GENRE_COLUMNS,
    movies_emb=MODELS_DATA['movies_emb']  # Pass embeddings for new genre logic
)
implicit_rec = ImplicitRecommender(MODELS_DATA['movies_emb'])
hybrid_rec = HybridRecommender(popularity_rec, content_rec, implicit_rec)

print("Ready to serve recommendations!")


def get_popular_movies_cold_start(session_id: str, top_k: int = 20, favorite_genres: list = None):
    """Get popular movies for cold-start users."""
    try:
        # Get user preferences if exist
        prefs = USER_PREFERENCES.get(session_id, {})
        if favorite_genres is None:
            favorite_genres = prefs.get('favorite_genres', [])
        
        # Calculate scores for each movie
        movie_scores = []
        for movie_id, movie_data in MOVIE_DATA.items():
            score = 0.0
            
            # Base score from enriched TMDB data
            cache_key = f"ml_{movie_id}"
            if cache_key in MOVIE_CACHE:
                vote_avg = MOVIE_CACHE[cache_key].get('vote_average', 5.0)
                score = vote_avg / 10.0  # Normalize to [0, 1]
            else:
                score = 0.5  # Default middle score
            
            # Bonus for matching favorite genres
            if favorite_genres:
                movie_genres = movie_data.get('genres', [])
                genre_matches = sum(1 for g in favorite_genres if g in movie_genres)
                if genre_matches > 0:
                    score += 0.3 * (genre_matches / len(favorite_genres))
            
            movie_scores.append((movie_id, score))
        
        # Sort by score and get top K
        movie_scores.sort(key=lambda x: x[1], reverse=True)
        top_movies = movie_scores[:top_k]
        
        # Format results
        recommendations = []
        for movie_id, score in top_movies:
            movie_data = MOVIE_DATA.get(movie_id, {})
            enriched = enrich_movie_with_tmdb(movie_id, movie_data, save_cache=False)
            enriched["score"] = float(score)
            recommendations.append(enriched)
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error in cold start recommendations: {e}")
        # Fallback to first N movies
        fallback = []
        for movie_id in list(MOVIE_DATA.keys())[:top_k]:
            movie_data = MOVIE_DATA[movie_id]
            enriched = enrich_movie_with_tmdb(movie_id, movie_data, save_cache=False)
            enriched["score"] = 0.5
            fallback.append(enriched)
        return fallback


def _get_method_message(method: str, favorite_genres: list, clicked_movies: list) -> str:
    """Get user-friendly message for recommendation method."""
    messages = {
        "cold_start_popular": "Phim được đánh giá cao nhất",
        "cold_start_genre": f"Gợi ý dựa trên sở thích: {', '.join(favorite_genres[:3])}",
        "cold_start_implicit": f"Gợi ý dựa trên {len(clicked_movies)} phim bạn đã xem",
        "hybrid": "Gợi ý kết hợp (AI Similarity)",
        "collaborative_filtering": "Gợi ý từ AI (RSAttE)",
        "fallback_popular": "Phim được đánh giá cao nhất",
        "fallback_hybrid": "Gợi ý kết hợp (Dự phòng)"
    }
    return messages.get(method, "Phim gợi ý cho bạn")


@app.get("/api/user/status/<session_id>")
def api_user_status(session_id: str):
    """Get user status (rating count, preferences, etc.)"""
    ratings = USER_RATINGS.get(session_id, {})
    prefs = USER_PREFERENCES.get(session_id, {})
    
    return jsonify({
        "session_id": session_id,
        "rating_count": len(ratings),
        "has_preferences": len(prefs) > 0,
        "onboarded": len(ratings) >= 5
    })


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/recommend")
def api_recommend_post():
    """Get personalized recommendations with enhanced cold-start handling."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    session_id = data.get("session_id", "default")
    top_k = data.get("top_k", 20)
    
    # Get user data
    ratings = USER_RATINGS.get(session_id, {})
    prefs = USER_PREFERENCES.get(session_id, {})
    interactions = USER_INTERACTIONS.get(session_id, {})
    
    favorite_genres = prefs.get('favorite_genres', [])
    clicked_movies = interactions.get('clicks', [])
    num_ratings = len(ratings)
    
    # Thresholds based on user request:
    # < 3: No recommendations (handled by frontend or returning empty)
    # 3-4: Limited recommendations
    # >= 5: Full recommendations
    
    if num_ratings < 3:
        return jsonify({
            "recommendations": [],
            "session_id": session_id,
            "based_on_ratings": num_ratings,
            "method": "none",
            "message": "Đánh giá ít nhất 3 phim để nhận gợi ý"
        })

    # 3-4 ratings: Limited recommended
    if num_ratings < 5:
        top_k = min(top_k, 5) # Limit to 5 movies
        logger.info(f"Cold start for session {session_id}: {num_ratings} ratings, "
                   f"{len(favorite_genres)} genres, {len(clicked_movies)} clicks")
        
        try:
            # Use adaptive hybrid recommendation
            recs, method = hybrid_rec.adaptive_recommend(
                movie_data=MOVIE_DATA,
                num_ratings=num_ratings,
                favorite_genres=favorite_genres,
                clicked_movie_ids=clicked_movies,
                top_k=top_k,
                exclude_ids=list(ratings.keys())
            )
            
            # Format results
            recommendations = []
            for movie_id, score in recs:
                movie_data = MOVIE_DATA.get(movie_id, {})
                enriched = enrich_movie_with_tmdb(movie_id, movie_data, save_cache=False)
                enriched["score"] = float(score)
                recommendations.append(enriched)
            
            return jsonify({
                "recommendations": recommendations,
                "session_id": session_id,
                "based_on_ratings": num_ratings,
                "method": method,
                "message": _get_method_message(method, favorite_genres, clicked_movies)
            })
            
        except Exception as e:
            logger.error(f"Error in cold start: {e}")
            # Fallback to simple popularity
            recommendations = get_popular_movies_cold_start(session_id, top_k=top_k)
            return jsonify({
                "recommendations": recommendations,
                "session_id": session_id,
                "method": "fallback_popular",
                "error": str(e)
            }), 200
    
    # COLLABORATIVE FILTERING: User has enough ratings (>= 3)
    try:
        movies_emb = MODELS_DATA['movies_emb']
        num_movies = movies_emb.size(0)
        
        # Create user profile from rated movies
        rated_movie_ids = list(ratings.keys())
        rated_scores = [ratings[mid] / 5.0 for mid in rated_movie_ids]
        
        # Weighted average of movie embeddings
        rated_embs = movies_emb[rated_movie_ids]
        weights = torch.tensor(rated_scores, dtype=torch.float32).unsqueeze(1)
        user_profile = (rated_embs * weights).sum(dim=0) / weights.sum()
        user_profile = user_profile / (user_profile.norm() + 1e-8)
        
        # Compute scores
        scores = torch.mv(movies_emb, user_profile)
        
        # Exclude rated movies
        mask = torch.zeros(num_movies, dtype=torch.bool)
        mask[rated_movie_ids] = True
        scores = scores.masked_fill(mask, float("-inf"))
        
        # Get top K
        top_k = max(1, min(top_k, num_movies))
        top_scores, top_indices = torch.topk(scores, k=top_k)
        
        # Format results
        recommendations = []
        for idx, score in zip(top_indices.tolist(), top_scores.tolist()):
            movie_data = MOVIE_DATA.get(idx, {})
            enriched = enrich_movie_with_tmdb(idx, movie_data)
            enriched["score"] = float(score)
            recommendations.append(enriched)
        
        return jsonify({
            "recommendations": recommendations,
            "session_id": session_id,
            "based_on_ratings": num_ratings,
            "method": "collaborative_filtering",
            "model": "RSAttAE (Attention Autoencoder)"
        })
        
    except Exception as e:
        logger.error(f"Error in collaborative filtering: {e}")
        # Fallback to hybrid
        recs, method = hybrid_rec.adaptive_recommend(
            movie_data=MOVIE_DATA,
            num_ratings=num_ratings,
            favorite_genres=favorite_genres,
            clicked_movie_ids=clicked_movies,
            top_k=top_k,
            exclude_ids=list(ratings.keys())
        )
        recommendations = []
        for movie_id, score in recs:
            movie_data = MOVIE_DATA.get(movie_id, {})
            enriched = enrich_movie_with_tmdb(movie_id, movie_data, save_cache=False)
            enriched["score"] = float(score)
            recommendations.append(enriched)
        
        return jsonify({
            "recommendations": recommendations,
            "session_id": session_id,
            "method": "fallback_hybrid",
            "error": str(e)
        }), 200


@app.get("/api/movies/similar/<int:movie_id>")
def api_similar_movies(movie_id: int):
    """Get similar movies based on embedding cosine similarity."""
    top_k = request.args.get("top_k", 10, type=int)
    
    try:
        movies_emb = MODELS_DATA['movies_emb']
        if movie_id < 0 or movie_id >= movies_emb.size(0):
            return jsonify({"error": "Movie ID out of range"}), 400
        
        query_emb = movies_emb[movie_id]
        # Since embeddings were normalized in _load_data_and_models, dot product is cosine similarity
        scores = torch.mv(movies_emb, query_emb)
        
        # Exclude self
        scores[movie_id] = float("-inf")
        
        top_k = max(1, min(top_k, movies_emb.size(0) - 1))
        top_scores, top_indices = torch.topk(scores, k=top_k)
        
        recommendations = []
        for idx, score in zip(top_indices.tolist(), top_scores.tolist()):
            movie_data = MOVIE_DATA.get(idx, {})
            enriched = enrich_movie_with_tmdb(idx, movie_data)
            enriched["score"] = float(score)
            recommendations.append(enriched)
            
        return jsonify({
            "movie_id": movie_id,
            "results": recommendations
        })
    except Exception as e:
        logger.error(f"Error in similar movies: {e}")
        return jsonify({"error": str(e)}), 500


@app.get("/api/movies/onboarding")
def api_onboarding_movies():
    """Get a diverse set of movies for onboarding rating grid."""
    limit = request.args.get("limit", 20, type=int)
    
    try:
        # Get movies that have TMDB data (posters) and are somewhat popular
        # For now, just take a diverse sample from different genres
        movies_to_show = []
        movies_per_genre = max(1, limit // len(GENRE_COLUMNS))
        
        selected_ids = set()
        
        for genre in GENRE_COLUMNS:
            if genre == "unknown": continue
            
            genre_movies = [mid for mid, data in MOVIE_DATA.items() 
                           if genre in data.get("genres", [])]
            
            # Take some movies from each genre
            import random
            sample = random.sample(genre_movies, min(len(genre_movies), movies_per_genre))
            for mid in sample:
                if mid not in selected_ids:
                    selected_ids.add(mid)
                    movie_data = MOVIE_DATA[mid]
                    enriched = enrich_movie_with_tmdb(mid, movie_data)
                    # Only add if we have a poster
                    if enriched.get("poster_path"):
                        movies_to_show.append(enriched)
                
                if len(movies_to_show) >= limit:
                    break
            if len(movies_to_show) >= limit:
                break
                
        # If not enough, fill with any movies that have posters
        if len(movies_to_show) < limit:
            remaining = [mid for mid in MOVIE_DATA.keys() if mid not in selected_ids]
            random.shuffle(remaining)
            for mid in remaining:
                movie_data = MOVIE_DATA[mid]
                enriched = enrich_movie_with_tmdb(mid, movie_data)
                if enriched.get("poster_path"):
                    movies_to_show.append(enriched)
                    selected_ids.add(mid)
                if len(movies_to_show) >= limit:
                    break
                    
        random.shuffle(movies_to_show)
        return jsonify({"movies": movies_to_show})
        
    except Exception as e:
        logger.error(f"Error in onboarding movies: {e}")
        return jsonify({"error": str(e)}), 500


@app.get("/api/recommend")
def api_recommend():
    """API endpoint for recommendations (JSON response)."""
    user_id = request.args.get("user_id", type=int)
    top_n = request.args.get("top_n", default=10, type=int)
    exclude_seen = request.args.get("exclude_seen", default=1, type=int)

    if user_id is None:
        return jsonify({"error": "user_id is required"}), 400

    train_rating_matrix = MODELS_DATA['train_rating_matrix']
    users_emb = MODELS_DATA['users_emb']
    movies_emb = MODELS_DATA['movies_emb']

    num_users = train_rating_matrix.size(0)
    num_movies = train_rating_matrix.size(1)

    if user_id < 0 or user_id >= num_users:
        return jsonify({"error": f"user_id out of range [0, {num_users-1}]"}), 400

    try:
        user_vec = users_emb[user_id]
        scores = torch.mv(movies_emb, user_vec)

        if exclude_seen:
            seen = train_rating_matrix[user_id] > 0
            scores = scores.masked_fill(seen, float("-inf"))

        top_n = max(1, min(top_n, num_movies))
        top_scores, top_indices = torch.topk(scores, k=top_n)

        results = []
        for idx, score in zip(top_indices.tolist(), top_scores.tolist()):
            item = {"movie_id": idx, "score": float(score)}
            if idx < len(MOVIE_TITLES):
                item["title"] = MOVIE_TITLES[idx]
            results.append(item)

        return jsonify({
            "user_id": user_id,
            "top_n": top_n,
            "exclude_seen": bool(exclude_seen),
            "results": results,
            "model": "RSAttAE (Information-Aware Attention Autoencoder)"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/recommend_coldstart")
def api_recommend_coldstart():
    """Cold-start recommendations using content features (genres/year)."""
    top_n = request.args.get("top_n", default=10, type=int)
    genres_raw = request.args.get("genres", default="", type=str)

    movies_features_norm = MODELS_DATA['movies_features_norm']
    num_movies = movies_features_norm.size(0)

    selected = [g.strip() for g in genres_raw.split(",") if g.strip()]
    selected_set = {g.lower() for g in selected}

    try:
        user_vec = torch.zeros(YEAR_BINS + len(GENRE_COLUMNS), dtype=torch.float32)

        # Uniform preference over year bins
        user_vec[:YEAR_BINS] = 1.0 / YEAR_BINS

        # Genre preferences
        for idx, genre in enumerate(GENRE_COLUMNS):
            if genre.lower() in selected_set:
                user_vec[YEAR_BINS + idx] = 1.0

        if user_vec.sum() == 0:
            user_vec[:YEAR_BINS] = 1.0 / YEAR_BINS

        user_vec = user_vec / (user_vec.norm() + 1e-8)
        scores = torch.mv(movies_features_norm, user_vec)

        top_n = max(1, min(top_n, num_movies))
        top_scores, top_indices = torch.topk(scores, k=top_n)

        results = []
        for idx, score in zip(top_indices.tolist(), top_scores.tolist()):
            item = {"movie_id": idx, "score": float(score)}
            if idx < len(MOVIE_TITLES):
                item["title"] = MOVIE_TITLES[idx]
            results.append(item)

        return jsonify({
            "top_n": top_n,
            "results": results,
            "model": "RSAttAE (Cold-start via Content Features)"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/recommend_from_movies")
def api_recommend_from_movies():
    """Cold-start recommendations from clicked movies (implicit feedback)."""
    top_n = request.args.get("top_n", default=10, type=int)
    movie_ids_raw = request.args.get("movie_ids", default="", type=str)
    exclude_seed = request.args.get("exclude_seed", default=1, type=int)

    movies_emb = MODELS_DATA['movies_emb']
    num_movies = movies_emb.size(0)

    try:
        movie_ids = [int(x.strip()) for x in movie_ids_raw.split(",") if x.strip()]
        if not movie_ids:
            return jsonify({"error": "movie_ids is required (comma-separated)"}), 400

        valid_ids = [mid for mid in movie_ids if 0 <= mid < num_movies]
        if not valid_ids:
            return jsonify({"error": "No valid movie_ids provided"}), 400

        seed_emb = movies_emb[valid_ids].mean(dim=0)
        seed_emb = seed_emb / (seed_emb.norm() + 1e-8)

        scores = torch.mv(movies_emb, seed_emb)

        if exclude_seed:
            mask = torch.zeros(num_movies, dtype=torch.bool)
            mask[valid_ids] = True
            scores = scores.masked_fill(mask, float("-inf"))

        top_n = max(1, min(top_n, num_movies))
        top_scores, top_indices = torch.topk(scores, k=top_n)

        results = []
        for idx, score in zip(top_indices.tolist(), top_scores.tolist()):
            item = {"movie_id": idx, "score": float(score)}
            if idx < len(MOVIE_TITLES):
                item["title"] = MOVIE_TITLES[idx]
            results.append(item)

        return jsonify({
            "top_n": top_n,
            "seed_movies": valid_ids,
            "exclude_seed": bool(exclude_seed),
            "results": results,
            "model": "RSAttAE (Cold-start via Clicked Movies)"
        })

    except ValueError:
        return jsonify({"error": "movie_ids must be integers"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/")
def index():
    """Render web interface."""
    num_users = MODELS_DATA['train_rating_matrix'].size(0)
    return render_template('index.html', num_users=num_users, genres=GENRE_COLUMNS)


@app.get("/api/tmdb/search")
def api_tmdb_search():
    """Search for a movie on TMDB."""
    query = request.args.get("query", "", type=str).strip()
    
    if not query:
        return jsonify({"error": "query is required"}), 400
    
    try:
        movie_data = tmdb_service.search_movie(query)
        if not movie_data:
            return jsonify({"results": []})
        
        # Get full details
        tmdb_id = movie_data.get("id")
        details = tmdb_service.get_movie_details(tmdb_id)
        
        if details:
            formatted = tmdb_service.format_movie_data(details, include_credits=True)
        else:
            formatted = tmdb_service.format_movie_data(movie_data)
        
        return jsonify({"results": [formatted]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/tmdb/movie/<int:tmdb_id>")
def api_tmdb_movie(tmdb_id: int):
    """Get detailed movie information from TMDB."""
    try:
        movie_data = tmdb_service.get_movie_details(tmdb_id)
        if not movie_data:
            return jsonify({"error": "Movie not found"}), 404
        
        formatted = tmdb_service.format_movie_data(movie_data, include_credits=True)
        
        # Add reviews
        reviews = tmdb_service.get_reviews(tmdb_id)
        formatted["reviews"] = reviews[:5]  # Top 5 reviews
        
        return jsonify(formatted)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/tmdb/reviews/<int:tmdb_id>")
def api_tmdb_reviews(tmdb_id: int):
    """Get reviews for a movie from TMDB."""
    try:
        reviews = tmdb_service.get_movie_reviews(tmdb_id)
        return jsonify({"reviews": reviews})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.get("/api/tmdb/trending")
def api_tmdb_trending():
    """Get trending movies from TMDB."""
    window = request.args.get("window", "week", type=str)
    
    if window not in ["day", "week"]:
        window = "week"
    
    try:
        movies = tmdb_service.get_trending_movies(window)
        results = []
        
        for movie in movies[:20]:  # Top 20
            formatted = tmdb_service.format_movie_data(movie)
            results.append(formatted)
        
        return jsonify({"results": results, "window": window})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/tmdb/popular")
def api_tmdb_popular():
    """Get popular movies from TMDB."""
    try:
        movies = tmdb_service.get_popular_movies()
        results = []
        
        for movie in movies[:20]:  # Top 20
            formatted = tmdb_service.format_movie_data(movie)
            results.append(formatted)
        
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/movie/<int:movie_id>/tmdb")
def api_movie_with_tmdb(movie_id: int):
    """Get movie from ML-100K with TMDB enrichment."""
    if movie_id < 0 or movie_id >= len(MOVIE_TITLES):
        return jsonify({"error": "Movie ID out of range"}), 400
    
    try:
        # Get local movie data
        local_data = MOVIE_DATA.get(movie_id, {})
        
        # Try to fetch TMDB data
        title = local_data.get("title", MOVIE_TITLES[movie_id])
        release_date = local_data.get("release_date", "")
        
        # Extract year from release_date if available
        year = None
        if release_date:
            try:
                year = int(release_date.split("-")[0])
            except:
                pass
        
        tmdb_movie = tmdb_service.search_movie(title, year)
        
        response_data = {
            "movie_id": movie_id,
            "title": title,
            "genres": local_data.get("genres", []),
            "imdb_url": local_data.get("imdb_url", ""),
        }
        
        if tmdb_movie:
            tmdb_id = tmdb_movie.get("id")
            details = tmdb_service.get_movie_details(tmdb_id)
            
            if details:
                formatted = tmdb_service.format_movie_data(details, include_credits=True)
                response_data["tmdb"] = formatted
        
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def enrich_movie_with_tmdb(movie_id: int, movie_data: dict, save_cache: bool = False) -> dict:
    """Enrich movie data with TMDB information (poster, overview, etc.)."""
    enriched = {
        "movie_id": movie_id,
        "title": movie_data.get("title", ""),
        "genres": movie_data.get("genres", []),
        "release_date": movie_data.get("release_date", ""),
        "imdb_url": movie_data.get("imdb_url", ""),
    }
    
    try:
        # Check if already cached
        cache_key = f"ml_{movie_id}"
        if cache_key in MOVIE_CACHE:
            tmdb_data = MOVIE_CACHE[cache_key]
            enriched["poster_path"] = tmdb_data.get("poster_path")
            enriched["overview"] = tmdb_data.get("overview")
            enriched["vote_average"] = tmdb_data.get("vote_average")
            return enriched
            
        # Parse title to remove year (format is "Title (Year)")
        import re
        title = movie_data.get("title", "")
        year = None
        
        # Try to extract year from title
        match = re.search(r'^(.+?)\s*\((\d{4})\)$', title)
        if match:
            title = match.group(1).strip()
            year = int(match.group(2))
        elif movie_data.get("release_date"):
            # Fallback to release_date
            try:
                year = int(movie_data.get("release_date").split("-")[0])
            except:
                pass
        
        # Try multiple search strategies
        tmdb_movie = None
        
        # Strategy 1: Search with title and year
        if year:
            tmdb_movie = tmdb_service.search_movie(title, year)
        
        # Strategy 2: Search without year if first attempt failed
        if not tmdb_movie:
            tmdb_movie = tmdb_service.search_movie(title, None)
        
        # Strategy 3: Simplify title (remove subtitle after comma/colon) and retry
        if not tmdb_movie and (',' in title or ':' in title or '(' in title):
            simple_title = re.split(r'[,:(]', title)[0].strip()
            if len(simple_title) > 3:  # Avoid too short titles
                tmdb_movie = tmdb_service.search_movie(simple_title, year)
                if not tmdb_movie:
                    tmdb_movie = tmdb_service.search_movie(simple_title, None)
        
        if tmdb_movie:
            poster = tmdb_movie.get("poster_path")

            # Nếu search trả về movie nhưng không có poster
            # → thử gọi thêm movie details
            if not poster and tmdb_movie.get("id"):
                try:
                    details = tmdb_service.get_movie_details(tmdb_movie["id"])
                    if details:
                        poster = details.get("poster_path")
                        tmdb_movie = details
                except:
                    pass

            # Chỉ xử lý nếu thực sự có poster
            if poster:
                enriched["poster_path"] = poster
                enriched["overview"] = tmdb_movie.get("overview")
                enriched["vote_average"] = tmdb_movie.get("vote_average")

                # Chỉ cache khi có poster
                MOVIE_CACHE[cache_key] = {
                    "poster_path": poster,
                    "overview": tmdb_movie.get("overview"),
                    "vote_average": tmdb_movie.get("vote_average"),
                }

                if save_cache and len(MOVIE_CACHE) % 10 == 0:
                    _save_tmdb_cache()
            
        return enriched

        
    except Exception as e:
        logger.warning(f"Failed to enrich movie {movie_id}: {e}")
    
    return enriched


@app.get("/api/movies")
def api_movies_list():
    """Get list of all movies with pagination and optional genre filter."""
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    genre_filter = request.args.get("genre", default="", type=str).strip()
    enrich = request.args.get("enrich", default="true", type=str).lower() == "true"
    
    # Get all movies
    movies_list = []
    for movie_id, movie_data in MOVIE_DATA.items():
        # Apply genre filter if specified
        if genre_filter:
            if genre_filter not in movie_data.get("genres", []):
                continue
        
        if enrich:
            # Enrich with TMDB data (poster, overview, etc.)
            enriched = enrich_movie_with_tmdb(movie_id, movie_data, save_cache=True)
            movies_list.append(enriched)
        else:
            movies_list.append({
                "movie_id": movie_id,
                "title": movie_data.get("title", ""),
                "genres": movie_data.get("genres", []),
                "release_date": movie_data.get("release_date", ""),
            })
    
    # Sort by movie_id
    movies_list.sort(key=lambda x: x["movie_id"])
    
    # Pagination
    total = len(movies_list)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_movies = movies_list[start_idx:end_idx]
    
    return jsonify({
        "movies": paginated_movies,
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": (total + per_page - 1) // per_page
    })


@app.get("/api/movie/<int:movie_id>/videos")
def api_movie_videos(movie_id: int):
    """Get videos/trailers for a movie."""
    if movie_id < 0 or movie_id >= len(MOVIE_TITLES):
        return jsonify({"error": "Movie ID out of range"}), 400
    
    try:
        # Get local movie data
        local_data = MOVIE_DATA.get(movie_id, {})
        title = local_data.get("title", MOVIE_TITLES[movie_id])
        release_date = local_data.get("release_date", "")
        
        # Extract year
        year = None
        if release_date:
            try:
                year = int(release_date.split("-")[0])
            except:
                pass
        
        # Search TMDB
        tmdb_movie = tmdb_service.search_movie(title, year)
        
        if not tmdb_movie:
            return jsonify({"videos": []})
        
        tmdb_id = tmdb_movie.get("id")
        videos = tmdb_service.get_movie_videos(tmdb_id)
        
        # Filter for trailers and teasers
        youtube_videos = [
            {
                "key": v.get("key"),
                "name": v.get("name"),
                "type": v.get("type"),
                "site": v.get("site"),
                "url": f"https://www.youtube.com/watch?v={v.get('key')}" if v.get("site") == "YouTube" else None
            }
            for v in videos if v.get("site") == "YouTube"
        ]
        
        return jsonify({"videos": youtube_videos})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/api/rate")
def api_rate_movie():
    """Rate a movie and get personalized recommendations."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    session_id = data.get("session_id", "default")
    movie_id = data.get("movie_id")
    rating = data.get("rating")
    
    if movie_id is None or rating is None:
        return jsonify({"error": "movie_id and rating are required"}), 400
    
    movie_id = int(movie_id)
    rating = float(rating)
    
    if movie_id < 0 or movie_id >= len(MOVIE_TITLES):
        return jsonify({"error": "Invalid movie_id"}), 400
    
    if rating < 0 or rating > 5:
        return jsonify({"error": "Rating must be between 0 and 5"}), 400
    
    # Store rating
    if session_id not in USER_RATINGS:
        USER_RATINGS[session_id] = {}
    
    USER_RATINGS[session_id][movie_id] = rating
    
    return jsonify({
        "success": True,
        "message": "Rating saved",
        "total_ratings": len(USER_RATINGS[session_id])
    })


@app.post("/api/recommend_from_ratings")
def api_recommend_from_ratings():
    """Get recommendations based on user ratings."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    session_id = data.get("session_id", "default")
    top_n = data.get("top_n", 10)
    
    # Get user ratings
    ratings = USER_RATINGS.get(session_id, {})
    
    if not ratings:
        return jsonify({"error": "No ratings found. Please rate some movies first."}), 400
    
    try:
        movies_emb = MODELS_DATA['movies_emb']
        num_movies = movies_emb.size(0)
        
        # Create user profile from rated movies
        rated_movie_ids = list(ratings.keys())
        rated_scores = [ratings[mid] / 5.0 for mid in rated_movie_ids]  # Normalize to [0, 1]
        
        # Weighted average of movie embeddings based on ratings
        rated_embs = movies_emb[rated_movie_ids]
        weights = torch.tensor(rated_scores, dtype=torch.float32).unsqueeze(1)
        user_profile = (rated_embs * weights).sum(dim=0) / weights.sum()
        user_profile = user_profile / (user_profile.norm() + 1e-8)
        
        # Compute scores
        scores = torch.mv(movies_emb, user_profile)
        
        # Exclude already rated movies
        mask = torch.zeros(num_movies, dtype=torch.bool)
        mask[rated_movie_ids] = True
        scores = scores.masked_fill(mask, float("-inf"))
        
        # Get top N
        top_n = max(1, min(top_n, num_movies))
        top_scores, top_indices = torch.topk(scores, k=top_n)
        
        results = []
        for idx, score in zip(top_indices.tolist(), top_scores.tolist()):
            item = {"movie_id": idx, "score": float(score)}
            if idx < len(MOVIE_TITLES):
                item["title"] = MOVIE_TITLES[idx]
            results.append(item)
        
        return jsonify({
            "results": results,
            "based_on_ratings": len(ratings),
            "model": "RSAttAE (Based on User Ratings)"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/ratings/<session_id>")
def api_get_ratings(session_id: str):
    """Get ratings for a specific session."""
    ratings = USER_RATINGS.get(session_id, {})
    
    # Format with movie titles
    formatted_ratings = []
    for movie_id, rating in ratings.items():
        formatted_ratings.append({
            "movie_id": movie_id,
            "rating": rating
        })
    
    return jsonify({
        "ratings": formatted_ratings,
        "total": len(ratings)
    })


@app.get("/api/user_ratings")
def api_get_user_ratings():
    """Get current user's ratings."""
    session_id = request.args.get("session_id", "default")
    ratings = USER_RATINGS.get(session_id, {})
    
    # Format with movie titles
    formatted_ratings = []
    for movie_id, rating in ratings.items():
        formatted_ratings.append({
            "movie_id": movie_id,
            "title": MOVIE_TITLES[movie_id] if movie_id < len(MOVIE_TITLES) else f"Movie {movie_id}",
            "rating": rating
        })
    
    return jsonify({
        "ratings": formatted_ratings,
        "total": len(ratings)
    })


@app.post("/api/preferences")
def api_save_preferences():
    """Save user preferences (favorite genres, etc.) for cold-start."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    session_id = data.get("session_id", "default")
    favorite_genres = data.get("favorite_genres", [])
    
    # Validate genres
    valid_genres = set(GENRE_COLUMNS)
    validated_genres = [g for g in favorite_genres if g in valid_genres]
    
    # Save preferences
    USER_PREFERENCES[session_id] = {
        "favorite_genres": validated_genres,
        "timestamp": pd.Timestamp.now().isoformat()
    }
    
    return jsonify({
        "success": True,
        "favorite_genres": validated_genres,
        "message": "Preferences saved successfully"
    })


@app.get("/api/preferences/<session_id>")
def api_get_preferences(session_id: str):
    """Get user preferences."""
    prefs = USER_PREFERENCES.get(session_id, {})
    return jsonify({
        "preferences": prefs,
        "has_preferences": len(prefs) > 0
    })


@app.post("/api/track_view")
def api_track_view():
    """Track movie view/click for implicit feedback."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    session_id = data.get("session_id", "default")
    movie_id = data.get("movie_id")
    
    if movie_id is None:
        return jsonify({"error": "movie_id is required"}), 400
    
    movie_id = int(movie_id)
    
    # Initialize interactions if not exists
    if session_id not in USER_INTERACTIONS:
        USER_INTERACTIONS[session_id] = {
            "clicks": [],
            "views": []
        }
    
    # Add to clicks list (avoid duplicates)
    if movie_id not in USER_INTERACTIONS[session_id]["clicks"]:
        USER_INTERACTIONS[session_id]["clicks"].append(movie_id)
    
    return jsonify({
        "success": True,
        "total_clicks": len(USER_INTERACTIONS[session_id]["clicks"])
    })


@app.post("/api/track_interaction")
def api_track_interaction():
    """Track general user interaction with a movie."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    session_id = data.get("session_id", "default")
    movie_id = data.get("movie_id")
    interaction_type = data.get("type", "view")  # view, click, detail_view
    
    if movie_id is None:
        return jsonify({"error": "movie_id is required"}), 400
    
    movie_id = int(movie_id)
    
    # Initialize interactions if not exists
    if session_id not in USER_INTERACTIONS:
        USER_INTERACTIONS[session_id] = {
            "clicks": [],
            "views": []
        }
    
    # Add to appropriate list
    if interaction_type in ["click", "detail_view"]:
        if movie_id not in USER_INTERACTIONS[session_id]["clicks"]:
            USER_INTERACTIONS[session_id]["clicks"].append(movie_id)
    elif interaction_type == "view":
        if movie_id not in USER_INTERACTIONS[session_id]["views"]:
            USER_INTERACTIONS[session_id]["views"].append(movie_id)
    
    return jsonify({
        "success": True,
        "total_clicks": len(USER_INTERACTIONS[session_id]["clicks"]),
        "total_views": len(USER_INTERACTIONS[session_id]["views"])
    })


@app.get("/api/interactions/<session_id>")
def api_get_interactions(session_id: str):
    """Get user interactions."""
    interactions = USER_INTERACTIONS.get(session_id, {"clicks": [], "views": []})
    return jsonify({
        "interactions": interactions,
        "total_clicks": len(interactions.get("clicks", [])),
        "total_views": len(interactions.get("views", []))
    })


@app.route("/api/cache/save", methods=["POST"])
def save_cache():
    """Manually save TMDB cache."""
    _save_tmdb_cache()
    return jsonify({
        "success": True,
        "cached_items": len(MOVIE_CACHE)
    })


@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    """Clear TMDB cache (to force re-fetch with improved search)."""
    global MOVIE_CACHE
    old_count = len(MOVIE_CACHE)
    MOVIE_CACHE.clear()
    _save_tmdb_cache()
    return jsonify({
        "success": True,
        "cleared_items": old_count
    })


@app.route("/api/cache/stats", methods=["GET"])
def cache_stats():
    """Get cache statistics."""
    return jsonify({
        "total_cached": len(MOVIE_CACHE),
        "cache_file": CACHE_FILE,
        "cache_exists": os.path.exists(CACHE_FILE)
    })


if __name__ == "__main__":
    import atexit
    
    # Save cache on exit
    atexit.register(_save_tmdb_cache)
    
    app.run(host="0.0.0.0", port=5000, debug=False)

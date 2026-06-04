"""
Cold-Start Recommendation Strategies for TKFilm

Implements multiple recommendation strategies for users with limited or no data:
1. PopularityRecommender - Based on TMDB ratings
2. ContentRecommender - Based on movie features (genres, year)
3. ImplicitRecommender - Based on viewed/clicked movies
4. HybridRecommender - Combines multiple strategies
"""

import torch
import logging
from typing import List, Dict, Optional, Tuple

logger = logging.getLogger(__name__)


class PopularityRecommender:
    """Recommend popular movies based on TMDB ratings."""
    
    def __init__(self, movie_cache: dict):
        """
        Args:
            movie_cache: TMDB cache with vote_average data
        """
        self.movie_cache = movie_cache
    
    def recommend(self, movie_data: dict, top_k: int = 20, 
                  exclude_ids: List[int] = None) -> List[Tuple[int, float]]:
        """
        Get popular movies sorted by TMDB vote_average.
        
        Args:
            movie_data: Dictionary of movie metadata
            top_k: Number of recommendations
            exclude_ids: Movie IDs to exclude
            
        Returns:
            List of (movie_id, score) tuples
        """
        exclude_ids = exclude_ids or []
        scores = []
        
        for movie_id, data in movie_data.items():
            if movie_id in exclude_ids:
                continue
                
            cache_key = f"ml_{movie_id}"
            if cache_key in self.movie_cache:
                vote_avg = self.movie_cache[cache_key].get('vote_average', 5.0)
                vote_count = self.movie_cache[cache_key].get('vote_count', 0)
                
                # Weighted score: higher vote_count = more reliable
                # Use Bayesian average to handle movies with few votes
                C = 100  # Minimum votes to consider
                m = 6.0  # Mean vote across all movies
                score = (vote_count / (vote_count + C)) * vote_avg + (C / (vote_count + C)) * m
            else:
                score = 5.0  # Default middle score
            
            scores.append((movie_id, score))
        
        # Sort by score descending
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]


class ContentRecommender:
    """Recommend movies based on content features (genres, year) and embeddings."""
    
    def __init__(self, movies_features: torch.Tensor, genre_columns: List[str], 
                 movies_emb: torch.Tensor = None):
        """
        Args:
            movies_features: Tensor of movie features (num_movies, num_features)
            genre_columns: List of genre names
            movies_emb: Optional Tensor of movie embeddings for advanced recommendations
        """
        self.movies_features = movies_features
        self.genre_columns = genre_columns
        self.movies_emb = movies_emb
        self.num_movies = movies_features.size(0)
        self.num_features = movies_features.size(1)
        
        # Normalize features for cosine similarity
        self.movies_features_norm = movies_features / (
            movies_features.norm(dim=1, keepdim=True) + 1e-8
        )
        
        if movies_emb is not None:
             self.movies_emb_norm = movies_emb / (
                movies_emb.norm(dim=1, keepdim=True) + 1e-8
            )
    
    def recommend_by_genres(self, favorite_genres: List[str], top_k: int = 20,
                           exclude_ids: List[int] = None) -> List[Tuple[int, float]]:
        """
        Recommend movies matching favorite genres using feature vectors.
        
        Args:
            favorite_genres: List of genre names
            top_k: Number of recommendations
            exclude_ids: Movie IDs to exclude
            
        Returns:
            List of (movie_id, score) tuples
        """
        exclude_ids = exclude_ids or []
        
        # Create user preference vector
        user_vec = torch.zeros(self.num_features, dtype=torch.float32)
        
        # Set year bins to uniform (no preference)
        year_bins = self.num_features - len(self.genre_columns)
        user_vec[:year_bins] = 1.0 / year_bins
        
        # Set genre preferences
        for genre in favorite_genres:
            if genre in self.genre_columns:
                idx = self.genre_columns.index(genre)
                user_vec[year_bins + idx] = 1.0
        
        # Normalize
        user_vec = user_vec / (user_vec.norm() + 1e-8)
        
        # Compute similarity scores
        scores = torch.mv(self.movies_features_norm, user_vec)
        
        # Exclude movies
        if exclude_ids:
            mask = torch.zeros(self.num_movies, dtype=torch.bool)
            mask[exclude_ids] = True
            scores = scores.masked_fill(mask, float("-inf"))
        
        # Get top K
        top_k = min(top_k, self.num_movies)
        top_scores, top_indices = torch.topk(scores, k=top_k)
        
        results = [(idx.item(), score.item()) 
                   for idx, score in zip(top_indices, top_scores)]
        return results

    def recommend_by_genres_using_embeddings(self, favorite_genres: List[str], movie_data: dict,
                                            top_k: int = 20, exclude_ids: List[int] = None) -> List[Tuple[int, float]]:
        """
        Recommend movies based on the average embedding of movies in the favorite genres.
        Verified to use trained model embeddings.
        """
        if self.movies_emb is None:
            logger.warning("No embeddings provided to ContentRecommender, falling back to feature matching.")
            return self.recommend_by_genres(favorite_genres, top_k, exclude_ids)

        exclude_ids = exclude_ids or []
        
        # 1. Identify candidate movies (movies that have the target genres)
        # We need to find "representative" movies for these genres to form a query vector.
        # Strategy: Iterate all movies, if movie has ANY of the favorite genres, add its embedding to the average.
        
        target_indices = []
        for movie_id, data in movie_data.items():
            if movie_id >= self.num_movies: continue
            
            movie_genres = data.get('genres', [])
            # Check if any favorite genre is in movie_genres
            if any(g in movie_genres for g in favorite_genres):
                target_indices.append(movie_id)
                
        if not target_indices:
             return []

        # 2. Compute Average Embedding of these genre-compliant movies
        # Limit to a sample if too many to save compute? No, simpler to just take all or top N popular.
        # Let's use all found indices.
        target_tensor = torch.tensor(target_indices, dtype=torch.long)
        genre_embeddings = self.movies_emb[target_tensor]
        
        # Compute mean
        genre_profile = genre_embeddings.mean(dim=0)
        genre_profile = genre_profile / (genre_profile.norm() + 1e-8)
        
        # 3. Compute Similarity with ALL movies
        scores = torch.mv(self.movies_emb_norm, genre_profile)
        
        # 4. Exclude and Sort
        if exclude_ids:
            mask = torch.zeros(self.num_movies, dtype=torch.bool)
            mask[exclude_ids] = True
            scores = scores.masked_fill(mask, float("-inf"))
            
        top_k = min(top_k, self.num_movies)
        top_scores, top_indices = torch.topk(scores, k=top_k)
        
        results = [(idx.item(), score.item()) 
                   for idx, score in zip(top_indices, top_scores)]
        return results

    
    def recommend_by_features(self, feature_vector: torch.Tensor, top_k: int = 20,
                             exclude_ids: List[int] = None) -> List[Tuple[int, float]]:
        """
        Recommend movies similar to a given feature vector.
        
        Args:
            feature_vector: Feature vector (num_features,)
            top_k: Number of recommendations
            exclude_ids: Movie IDs to exclude
            
        Returns:
            List of (movie_id, score) tuples
        """
        exclude_ids = exclude_ids or []
        
        # Normalize input
        feature_vector = feature_vector / (feature_vector.norm() + 1e-8)
        
        # Compute similarity
        scores = torch.mv(self.movies_features_norm, feature_vector)
        
        # Exclude movies
        if exclude_ids:
            mask = torch.zeros(self.num_movies, dtype=torch.bool)
            mask[exclude_ids] = True
            scores = scores.masked_fill(mask, float("-inf"))
        
        # Get top K
        top_k = min(top_k, self.num_movies)
        top_scores, top_indices = torch.topk(scores, k=top_k)
        
        results = [(idx.item(), score.item()) 
                   for idx, score in zip(top_indices, top_scores)]
        return results


class ImplicitRecommender:
    """Recommend movies based on implicit feedback (views, clicks)."""
    
    def __init__(self, movies_emb: torch.Tensor):
        """
        Args:
            movies_emb: Movie embeddings (num_movies, embedding_dim)
        """
        self.movies_emb = movies_emb
        self.num_movies = movies_emb.size(0)
        
        # Normalize embeddings
        self.movies_emb_norm = movies_emb / (
            movies_emb.norm(dim=1, keepdim=True) + 1e-8
        )
    
    def recommend_from_clicks(self, clicked_movie_ids: List[int], 
                             top_k: int = 20,
                             exclude_ids: List[int] = None) -> List[Tuple[int, float]]:
        """
        Recommend movies similar to clicked/viewed movies.
        
        Args:
            clicked_movie_ids: List of movie IDs user has clicked/viewed
            top_k: Number of recommendations
            exclude_ids: Movie IDs to exclude
            
        Returns:
            List of (movie_id, score) tuples
        """
        if not clicked_movie_ids:
            return []
        
        exclude_ids = exclude_ids or []
        
        # Filter valid movie IDs
        valid_ids = [mid for mid in clicked_movie_ids 
                     if 0 <= mid < self.num_movies]
        
        if not valid_ids:
            return []
        
        # Create user profile from clicked movies (average embeddings)
        clicked_embs = self.movies_emb[valid_ids]
        user_profile = clicked_embs.mean(dim=0)
        user_profile = user_profile / (user_profile.norm() + 1e-8)
        
        # Compute similarity scores
        scores = torch.mv(self.movies_emb_norm, user_profile)
        
        # Exclude clicked movies and other exclusions
        all_exclude = set(exclude_ids) | set(valid_ids)
        if all_exclude:
            mask = torch.zeros(self.num_movies, dtype=torch.bool)
            for mid in all_exclude:
                if 0 <= mid < self.num_movies:
                    mask[mid] = True
            scores = scores.masked_fill(mask, float("-inf"))
        
        # Get top K
        top_k = min(top_k, self.num_movies)
        top_scores, top_indices = torch.topk(scores, k=top_k)
        
        results = [(idx.item(), score.item()) 
                   for idx, score in zip(top_indices, top_scores)]
        return results


class HybridRecommender:
    """Combine multiple recommendation strategies."""
    
    def __init__(self, popularity_rec: PopularityRecommender,
                 content_rec: ContentRecommender,
                 implicit_rec: ImplicitRecommender):
        """
        Args:
            popularity_rec: PopularityRecommender instance
            content_rec: ContentRecommender instance
            implicit_rec: ImplicitRecommender instance
        """
        self.popularity_rec = popularity_rec
        self.content_rec = content_rec
        self.implicit_rec = implicit_rec
    
    def recommend(self, movie_data: dict, top_k: int = 20,
                  favorite_genres: List[str] = None,
                  clicked_movie_ids: List[int] = None,
                  exclude_ids: List[int] = None,
                  weights: Dict[str, float] = None) -> List[Tuple[int, float]]:
        """
        Hybrid recommendation combining multiple strategies.
        
        Args:
            movie_data: Dictionary of movie metadata
            top_k: Number of recommendations
            favorite_genres: User's favorite genres
            clicked_movie_ids: Movies user has clicked/viewed
            exclude_ids: Movie IDs to exclude
            weights: Strategy weights {'popularity': 0.3, 'content': 0.4, 'implicit': 0.3}
            
        Returns:
            List of (movie_id, score) tuples
        """
        exclude_ids = exclude_ids or []
        weights = weights or {}
        
        # Default weights
        default_weights = {
            'popularity': 0.4,
            'content': 0.3,
            'implicit': 0.3
        }
        default_weights.update(weights)
        
        # Collect recommendations from each strategy
        all_scores = {}
        
        # 1. Popularity-based
        if default_weights['popularity'] > 0:
            pop_recs = self.popularity_rec.recommend(
                movie_data, top_k=top_k*2, exclude_ids=exclude_ids
            )
            for movie_id, score in pop_recs:
                all_scores[movie_id] = all_scores.get(movie_id, 0.0) + \
                    score * default_weights['popularity']
        
        # 2. Content-based (if genres provided)
        if default_weights['content'] > 0 and favorite_genres:
            # Use embeddings method if available contextually? No, here we stick to configured method.
            # But wait, we want to maximize model usage.
            # Let's use the embedding-based one if available, it's better.
            content_recs = self.content_rec.recommend_by_genres_using_embeddings(
                favorite_genres, movie_data, top_k=top_k*2, exclude_ids=exclude_ids
            )
            for movie_id, score in content_recs:
                all_scores[movie_id] = all_scores.get(movie_id, 0.0) + \
                    score * default_weights['content']
        
        # 3. Implicit feedback (if clicks provided)
        if default_weights['implicit'] > 0 and clicked_movie_ids:
            implicit_recs = self.implicit_rec.recommend_from_clicks(
                clicked_movie_ids, top_k=top_k*2, exclude_ids=exclude_ids
            )
            for movie_id, score in implicit_recs:
                all_scores[movie_id] = all_scores.get(movie_id, 0.0) + \
                    score * default_weights['implicit']
        
        # Sort by combined score
        sorted_recs = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_recs[:top_k]
    
    def adaptive_recommend(self, movie_data: dict, 
                          num_ratings: int,
                          favorite_genres: List[str] = None,
                          clicked_movie_ids: List[int] = None,
                          top_k: int = 20,
                          exclude_ids: List[int] = None) -> Tuple[List[Tuple[int, float]], str]:
        """
        Adaptive recommendation that adjusts strategy based on available data.
        STRICTLY follows user-defined logic flow:
        1. Prefs? -> Genre Recommendation (using Embeddings)
        2. No Prefs? -> Popularity
        3. Clicks/Ratings? -> Implicit/Hybrid
        
        Args:
            movie_data: Dictionary of movie metadata
            num_ratings: Number of ratings user has provided
            favorite_genres: User's favorite genres
            clicked_movie_ids: Movies user has clicked/viewed
            top_k: Number of recommendations
            exclude_ids: Movie IDs to exclude
            
        Returns:
            Tuple of (recommendations, method_name)
        """
        has_genres = favorite_genres and len(favorite_genres) > 0
        has_clicks = clicked_movie_ids and len(clicked_movie_ids) > 0
        
        # --- Strict Logic Flow ---
        
        # Case 1: Pure Cold Start (No ratings, no clicks)
        if num_ratings == 0 and not has_clicks:
            if has_genres:
                # Step 2a: Suggest based on preferences (Using Trained Model Embeddings)
                recs = self.content_rec.recommend_by_genres_using_embeddings(
                    favorite_genres, movie_data, top_k=top_k, exclude_ids=exclude_ids
                )
                return recs, "cold_start_genre"
            else:
                # Step 2b: No preferences -> Suggest Top Rated (Popularity)
                recs = self.popularity_rec.recommend(
                    movie_data, top_k=top_k, exclude_ids=exclude_ids
                )
                return recs, "cold_start_popular"
        
        # Case 2: Has Interactions (Clicks but no ratings yet) - "Item-to-Item" logic kick-in
        if num_ratings == 0 and has_clicks:
            # Step 3b: Suggest based on history (Implicit)
            recs = self.implicit_rec.recommend_from_clicks(
                clicked_movie_ids, top_k=top_k, exclude_ids=exclude_ids
            )
            return recs, "cold_start_implicit"
        
        # Case 3: Has Ratings (Hybrid approach to leverage all signals)
        # Even if just 1 rating, we can start using hybrid
        if num_ratings > 0:
             weights = {
                'popularity': 0.1, # Reduce popularity influence as we have data
                'content': 0.3 if has_genres else 0.0,
                'implicit': 0.6 # Heavy weight on actual interactions
            }
             # Normalize weights
             total = sum(weights.values())
             if total > 0:
                 weights = {k: v/total for k, v in weights.items()}
            
             recs = self.recommend(
                 movie_data, top_k=top_k,
                 favorite_genres=favorite_genres,
                 clicked_movie_ids=clicked_movie_ids,
                 exclude_ids=exclude_ids,
                 weights=weights
             )
             return recs, "hybrid"

        # Fallback (should not be reached logically given above)
        return self.popularity_rec.recommend(movie_data, top_k=top_k, exclude_ids=exclude_ids), "fallback"

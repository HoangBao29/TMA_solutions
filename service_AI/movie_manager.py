import json
import os
from datetime import datetime
from typing import Optional, Dict, List

import requests

MOVIE_STORE = os.path.join(os.path.dirname(__file__), "movies_custom.json")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://kzcsegvlfaebwpxipqxx.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_MOVIE_TABLE = os.getenv("SUPABASE_MOVIE_TABLE", "movie")
# Columns currently present in your Supabase `movie` table (conservative list)
# Adjust this list if your table schema changes.
SUPABASE_ALLOWED_COLUMNS = [
    "movie_id",
    "movie_title",
    "release_date",
    "video_release_date",
    "IMDb_URL",
]
SUPABASE_ALLOWED_COLUMNS += [f"column{i}" for i in range(6, 25)]

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


def _is_supabase_enabled() -> bool:
    return bool(SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_KEY))


def _supabase_headers() -> Dict[str, str]:
    key = SUPABASE_SERVICE_KEY or SUPABASE_KEY
    if not key:
        raise RuntimeError("Supabase key is not configured")
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _supabase_request(method: str, path: str, params=None, json_data=None, extra_headers=None):
    if not _is_supabase_enabled():
        raise RuntimeError("Supabase configuration is not available")

    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = _supabase_headers()
    if extra_headers:
        headers.update(extra_headers)

    response = requests.request(method, url, headers=headers, params=params, json=json_data, timeout=15)
    try:
        response.raise_for_status()
    except requests.HTTPError as e:
        # Log helpful debug info before re-raising
        try:
            body = response.text
        except Exception:
            body = "<unavailable>"
        raise requests.HTTPError(f"Supabase request failed: {e}\nURL: {url}\nStatus: {response.status_code}\nBody: {body}")
    return response


def _normalize_supabase_movie_row(row: dict) -> Dict:
    if not isinstance(row, dict):
        return {}

    def get_field(*keys):
        for key in keys:
            if key in row and row[key] is not None:
                return row[key]
        return None

    movie_id = get_field("movie_id", "id")
    if movie_id is None:
        return {}

    try:
        movie_id = int(movie_id)
    except (ValueError, TypeError):
        return {}

    title = get_field("title", "movie_title", "Movie_Title") or ""
    release_date = get_field("release_date", "Release_Date") or ""
    imdb_url = get_field("imdb_url", "IMDb_URL", "IMDbUrl") or ""
    description = get_field("description", "Description") or ""
    tmdb_id = get_field("tmdb_id", "tmdbId")
    if tmdb_id is not None and tmdb_id != "":
        try:
            tmdb_id = int(tmdb_id)
        except (ValueError, TypeError):
            tmdb_id = None

    genres = get_field("genres")
    if genres is None:
        genres = []
        for idx in range(6, 25):
            for key in (f"column{idx}", f"Column{idx}", f"COLUMN{idx}"):
                if key in row:
                    value = row.get(key)
                    if value in (1, "1", True, "true", "t", "on"):
                        genres.append(GENRE_COLUMNS[idx - 6])
                        break
    elif isinstance(genres, str):
        try:
            genres = json.loads(genres)
        except Exception:
            genres = [g.strip() for g in genres.split(",") if g.strip()]

    return {
        "movie_id": str(movie_id),
        "title": title,
        "release_date": release_date,
        "imdb_url": imdb_url,
        "description": description,
        "tmdb_id": tmdb_id,
        "genres": genres,
        "is_hidden": bool(get_field("is_hidden", "Is_Hidden", "isHidden", "hidden")),
        "deleted_at": get_field("deleted_at", "Deleted_At"),
    }

class MovieManager:
    """Quản lý phim: add/update/delete/hide"""

    @staticmethod
    def load_custom_movies() -> Dict:
        """Load phim custom từ Supabase hoặc JSON file"""
        if _is_supabase_enabled():
            try:
                response = _supabase_request("GET", SUPABASE_MOVIE_TABLE, params={"select": "*", "order": "movie_id"})
                rows = response.json()
                if isinstance(rows, list) and rows:
                    normalized = {}
                    for row in rows:
                        movie = _normalize_supabase_movie_row(row)
                        if movie and movie.get("movie_id"):
                            normalized[str(movie["movie_id"])] = movie
                    if normalized:
                        return normalized
            except Exception:
                pass

        if os.path.exists(MOVIE_STORE):
            with open(MOVIE_STORE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    @staticmethod
    def save_custom_movies(movies: Dict):
        """Lưu phim custom vào JSON file"""
        with open(MOVIE_STORE, 'w', encoding='utf-8') as f:
            json.dump(movies, f, indent=2, ensure_ascii=False)

    @staticmethod
    def add_movie(title: str, release_date: str = "", genres: List[str] = None,
                  tmdb_id: Optional[int] = None, description: str = "",
                  imdb_url: str = "") -> Dict:
        """Thêm phim mới"""
        if genres is None:
            genres = []

        if _is_supabase_enabled():
            # Fetch max movie_id from Supabase
            try:
                max_resp = _supabase_request("GET", SUPABASE_MOVIE_TABLE, params={"select": "movie_id", "order": "movie_id.desc", "limit": 1})
                max_rows = max_resp.json()
                if max_rows:
                    max_id = int(max_rows[0]["movie_id"])
                else:
                    max_id = 1682
            except Exception:
                max_id = 1682
            new_id = max_id + 1

            # Only include fields that exist in the Supabase `movie` table
            payload = {
                "movie_id": new_id
            }
            if "movie_title" in SUPABASE_ALLOWED_COLUMNS:
                payload["movie_title"] = title
            if "release_date" in SUPABASE_ALLOWED_COLUMNS:
                payload["release_date"] = release_date
            if "video_release_date" in SUPABASE_ALLOWED_COLUMNS:
                payload["video_release_date"] = None
            if "IMDb_URL" in SUPABASE_ALLOWED_COLUMNS:
                payload["IMDb_URL"] = imdb_url
            # created_at is harmless if present, but only add if allowed
            if "created_at" in SUPABASE_ALLOWED_COLUMNS:
                payload["created_at"] = datetime.utcnow().isoformat()

            # Map genres to Column6 - Column24
            for idx, genre_name in enumerate(GENRE_COLUMNS):
                col_num = 6 + idx
                col_name = f"Column{col_num}"
                payload[col_name] = 1 if genre_name in genres else 0

            response = _supabase_request(
                "POST",
                SUPABASE_MOVIE_TABLE,
                json_data=[payload],
                extra_headers={"Prefer": "return=representation"}
            )
            rows = response.json()
            if rows:
                row = rows[0]
                movie_id = row.get("movie_id") or row.get("id")
                return {"movie_id": str(movie_id), **_normalize_supabase_movie_row(row)}

        custom_movies = MovieManager.load_custom_movies()
        max_id = 1682
        if custom_movies:
            existing_ids = [int(k) for k in custom_movies.keys() if str(k).isdigit()]
            if existing_ids:
                max_id = max(max_id, max(existing_ids))

        new_id = str(max_id + 1)
        custom_movies[new_id] = {
            "title": title,
            "release_date": release_date,
            "genres": genres,
            "tmdb_id": tmdb_id,
            "description": description,
            "imdb_url": imdb_url,
            "is_hidden": False,
            "created_at": datetime.utcnow().isoformat(),
        }

        MovieManager.save_custom_movies(custom_movies)
        return {"movie_id": new_id, **custom_movies[new_id]}

    @staticmethod
    def update_movie(movie_id: str, **kwargs) -> Dict:
        """Cập nhật thông tin phim"""
        allowed_fields = ["title", "release_date", "genres", "tmdb_id",
                          "description", "imdb_url", "is_hidden"]
        payload = {k: v for k, v in kwargs.items() if k in allowed_fields}

        if _is_supabase_enabled():
            if payload:
                # Map user-friendly keys to Supabase column names and only keep allowed columns
                mapped = {}
                if "title" in payload:
                    if "movie_title" in SUPABASE_ALLOWED_COLUMNS:
                        mapped["movie_title"] = payload.get("title")
                if "imdb_url" in payload:
                    if "IMDb_URL" in SUPABASE_ALLOWED_COLUMNS:
                        mapped["IMDb_URL"] = payload.get("imdb_url")
                if "release_date" in payload and "release_date" in SUPABASE_ALLOWED_COLUMNS:
                    mapped["release_date"] = payload.get("release_date")

                # Map genres to Column6 - Column24 in Supabase
                if "genres" in payload:
                    genres = payload.get("genres") or []
                    for idx, genre_name in enumerate(GENRE_COLUMNS):
                        col_num = 6 + idx
                        col_name = f"Column{col_num}"
                        mapped[col_name] = 1 if genre_name in genres else 0

                # include other allowed fields only if present and allowed
                for k in ("tmdb_id", "description", "is_hidden"):
                    # these columns are not present in current schema; skip unless allowed
                    if k in SUPABASE_ALLOWED_COLUMNS and k in payload:
                        mapped[k] = payload[k]

                if not mapped:
                    raise ValueError(f"No updatable fields for Movie {movie_id} in Supabase schema")

                if "updated_at" in SUPABASE_ALLOWED_COLUMNS:
                    mapped["updated_at"] = datetime.utcnow().isoformat()

                for id_field in ["movie_id", "id"]:
                    try:
                        response = _supabase_request(
                            "PATCH",
                            SUPABASE_MOVIE_TABLE,
                            params={f"{id_field}": f"eq.{movie_id}"},
                            json_data=mapped,
                            extra_headers={"Prefer": "return=representation"}
                        )
                        rows = response.json()
                        if rows:
                            row = rows[0]
                            movie = _normalize_supabase_movie_row(row)
                            if movie:
                                return {"movie_id": str(movie_id), **movie}
                            return {"movie_id": str(movie_id), **row}
                    except requests.HTTPError:
                        continue
            raise ValueError(f"Movie {movie_id} not found")

        custom_movies = MovieManager.load_custom_movies()
        if movie_id not in custom_movies:
            raise ValueError(f"Movie {movie_id} not found")

        for key, value in payload.items():
            custom_movies[movie_id][key] = value

        custom_movies[movie_id]["updated_at"] = datetime.utcnow().isoformat()
        MovieManager.save_custom_movies(custom_movies)
        return {"movie_id": movie_id, **custom_movies[movie_id]}

    @staticmethod
    def delete_movie(movie_id: str, soft_delete: bool = True):
        """Xóa phim (mặc định là ẩn - soft delete)"""
        if _is_supabase_enabled():
            if soft_delete:
                payload = {
                    "is_hidden": True,
                    "deleted_at": datetime.utcnow().isoformat(),
                }
                for id_field in ["movie_id", "id"]:
                    try:
                        _supabase_request(
                            "PATCH",
                            SUPABASE_MOVIE_TABLE,
                            params={f"{id_field}": f"eq.{movie_id}"},
                            json_data=payload
                        )
                        return {"success": True, "movie_id": movie_id, "action": "hidden"}
                    except requests.HTTPError:
                        continue
                raise ValueError(f"Movie {movie_id} not found")

            for id_field in ["movie_id", "id"]:
                try:
                    _supabase_request(
                        "DELETE",
                        SUPABASE_MOVIE_TABLE,
                        params={f"{id_field}": f"eq.{movie_id}"}
                    )
                    return {"success": True, "movie_id": movie_id, "action": "deleted"}
                except requests.HTTPError:
                    continue
            raise ValueError(f"Movie {movie_id} not found")

        custom_movies = MovieManager.load_custom_movies()

        if movie_id not in custom_movies:
            raise ValueError(f"Movie {movie_id} not found")

        if soft_delete:
            custom_movies[movie_id]["is_hidden"] = True
            custom_movies[movie_id]["deleted_at"] = datetime.utcnow().isoformat()
        else:
            del custom_movies[movie_id]

        MovieManager.save_custom_movies(custom_movies)
        return {"success": True, "movie_id": movie_id, "action": "hidden" if soft_delete else "deleted"}

    @staticmethod
    def get_movie(movie_id: str) -> Optional[Dict]:
        """Lấy thông tin chi tiết của 1 phim"""
        if _is_supabase_enabled():
            for id_field in ["movie_id", "id"]:
                try:
                    response = _supabase_request(
                        "GET",
                        SUPABASE_MOVIE_TABLE,
                        params={f"{id_field}": f"eq.{movie_id}", "select": "*"}
                    )
                    rows = response.json()
                    if rows:
                        row = rows[0]
                        movie = _normalize_supabase_movie_row(row)
                        if movie and not movie.get("is_hidden", False):
                            return movie
                        return None
                except requests.HTTPError:
                    continue
            return None

        custom_movies = MovieManager.load_custom_movies()
        movie = custom_movies.get(movie_id)
        if movie and not movie.get("is_hidden", False):
            return {"movie_id": movie_id, **movie}
        return None

    @staticmethod
    def list_movies(include_hidden: bool = False, genre_filter: str = None) -> List[Dict]:
        """Lấy danh sách phim"""
        if _is_supabase_enabled():
            try:
                response = _supabase_request("GET", SUPABASE_MOVIE_TABLE, params={"select": "*", "order": "movie_id"})
                rows = response.json()
                if isinstance(rows, list) and rows:
                    movies = []
                    for row in rows:
                        movie = _normalize_supabase_movie_row(row)
                        if not movie:
                            continue
                        if not include_hidden and movie.get("is_hidden", False):
                            continue
                        if genre_filter:
                            genres = movie.get("genres") or []
                            if isinstance(genres, str):
                                try:
                                    genres = json.loads(genres)
                                except Exception:
                                    genres = [g.strip() for g in genres.split(",") if g.strip()]
                            if genre_filter not in genres:
                                continue
                        movies.append(movie)
                    return sorted(movies, key=lambda x: int(x["movie_id"]))
                # Fallback to local JSON when Supabase returns an empty movie list
            except Exception:
                pass

        custom_movies = MovieManager.load_custom_movies()

        movies = []
        for mid, data in custom_movies.items():
            if not include_hidden and data.get("is_hidden"):
                continue

            if genre_filter and genre_filter not in data.get("genres", []):
                continue

            movies.append({"movie_id": mid, **data})

        return sorted(movies, key=lambda x: int(x["movie_id"]))

    @staticmethod
    def get_stats() -> Dict:
        """Thống kê phim"""
        custom_movies = MovieManager.load_custom_movies()

        total = len(custom_movies)
        hidden = sum(1 for m in custom_movies.values() if m.get("is_hidden", False))
        visible = total - hidden

        genres_count = {}
        for movie in custom_movies.values():
            for genre in movie.get("genres", []):
                genres_count[genre] = genres_count.get(genre, 0) + 1

        return {
            "total_movies": total,
            "visible_movies": visible,
            "hidden_movies": hidden,
            "genres_stats": genres_count
        }
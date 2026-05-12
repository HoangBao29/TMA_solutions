import json
import os
from typing import Optional, Dict, List

MOVIE_STORE = os.path.join(os.path.dirname(__file__), "movies_custom.json")

class MovieManager:
    """Quản lý phim: add/update/delete/hide"""

    @staticmethod
    def load_custom_movies() -> Dict:
        """Load phim custom từ JSON file"""
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

        custom_movies = MovieManager.load_custom_movies()

        # Tạo ID mới (tìm max ID hiện tại)
        max_id = 1682  # ID cuối cùng của MovieLens dataset
        if custom_movies:
            existing_ids = [int(k) for k in custom_movies.keys()]
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
            "created_at": str(pd.Timestamp.now()) if 'pd' in globals() else None
        }

        MovieManager.save_custom_movies(custom_movies)
        return {"movie_id": new_id, **custom_movies[new_id]}

    @staticmethod
    def update_movie(movie_id: str, **kwargs) -> Dict:
        """Cập nhật thông tin phim"""
        custom_movies = MovieManager.load_custom_movies()

        if movie_id not in custom_movies:
            raise ValueError(f"Movie {movie_id} not found")

        # Chỉ cho phép update các field này
        allowed_fields = ["title", "release_date", "genres", "tmdb_id",
                         "description", "imdb_url", "is_hidden"]

        for key, value in kwargs.items():
            if key in allowed_fields:
                custom_movies[movie_id][key] = value

        custom_movies[movie_id]["updated_at"] = str(pd.Timestamp.now()) if 'pd' in globals() else None

        MovieManager.save_custom_movies(custom_movies)
        return {"movie_id": movie_id, **custom_movies[movie_id]}

    @staticmethod
    def delete_movie(movie_id: str, soft_delete: bool = True):
        """Xóa phim (mặc định là ẩn - soft delete)"""
        custom_movies = MovieManager.load_custom_movies()

        if movie_id not in custom_movies:
            raise ValueError(f"Movie {movie_id} not found")

        if soft_delete:
            # Ẩn phim thay vì xóa hẳn
            custom_movies[movie_id]["is_hidden"] = True
            custom_movies[movie_id]["deleted_at"] = str(pd.Timestamp.now()) if 'pd' in globals() else None
        else:
            # Xóa hẳn (hard delete)
            del custom_movies[movie_id]

        MovieManager.save_custom_movies(custom_movies)
        return {"success": True, "movie_id": movie_id, "action": "hidden" if soft_delete else "deleted"}

    @staticmethod
    def get_movie(movie_id: str) -> Optional[Dict]:
        """Lấy thông tin chi tiết của 1 phim"""
        custom_movies = MovieManager.load_custom_movies()
        movie = custom_movies.get(movie_id)
        if movie and not movie.get("is_hidden", False):
            return {"movie_id": movie_id, **movie}
        return None

    @staticmethod
    def list_movies(include_hidden: bool = False, genre_filter: str = None) -> List[Dict]:
        """Lấy danh sách phim"""
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
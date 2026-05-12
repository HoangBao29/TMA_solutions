#!/usr/bin/env python3
"""
Script để import dữ liệu phim từ MovieLens dataset vào movies_custom.json
"""

import json
import os
from typing import Dict, List

# Đường dẫn file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOVIE_STORE = os.path.join(BASE_DIR, "movies_custom.json")
MOVIELENS_ITEM_FILE = os.path.join(BASE_DIR, "datasets", "ml-100k", "u.item")
MOVIELENS_GENRE_FILE = os.path.join(BASE_DIR, "datasets", "ml-100k", "u.genre")

def load_genres() -> List[str]:
    """Load danh sách genres từ u.genre"""
    genres = []
    with open(MOVIELENS_GENRE_FILE, 'r', encoding='latin-1') as f:
        for line in f:
            if line.strip():
                genre_name = line.split('|')[0]
                genres.append(genre_name)
    return genres

def parse_movie_line(line: str, genres: List[str]) -> Dict:
    """Parse một dòng từ u.item thành dict"""
    parts = line.strip().split('|')
    if len(parts) < 24:  # movie_id|title|date||url|19_genre_bits
        return None

    movie_id = parts[0]
    title = parts[1]
    release_date = parts[2] if parts[2] != "" else ""
    imdb_url = parts[3] if len(parts) > 3 and parts[3] != "" else ""

    # Parse genre bits (19 bits)
    genre_bits = parts[5:24] if len(parts) >= 24 else []
    movie_genres = []
    for i, bit in enumerate(genre_bits):
        if bit == '1' and i < len(genres):
            movie_genres.append(genres[i])

    return {
        "title": title,
        "release_date": release_date,
        "genres": movie_genres,
        "tmdb_id": None,  # MovieLens không có TMDB ID
        "description": "",  # MovieLens không có description
        "imdb_url": imdb_url,
        "is_hidden": False,
        "created_at": None
    }

def import_movies(limit: int = None) -> int:
    """Import phim từ MovieLens vào movies_custom.json"""
    print("Loading genres...")
    genres = load_genres()
    print(f"Found {len(genres)} genres: {genres}")

    print("Loading existing custom movies...")
    custom_movies = {}
    if os.path.exists(MOVIE_STORE):
        with open(MOVIE_STORE, 'r', encoding='utf-8') as f:
            try:
                custom_movies = json.load(f)
            except json.JSONDecodeError:
                custom_movies = {}

    print(f"Found {len(custom_movies)} existing movies")

    print("Importing movies from MovieLens...")
    imported_count = 0

    with open(MOVIELENS_ITEM_FILE, 'r', encoding='latin-1') as f:
        for line_num, line in enumerate(f, 1):
            if limit and imported_count >= limit:
                break

            movie_data = parse_movie_line(line, genres)
            if movie_data:
                movie_id = str(line_num)  # Sử dụng line number làm ID

                # Skip nếu đã tồn tại
                if movie_id in custom_movies:
                    continue

                custom_movies[movie_id] = movie_data
                imported_count += 1

                if imported_count % 100 == 0:
                    print(f"Imported {imported_count} movies...")

    print(f"Saving {len(custom_movies)} movies to {MOVIE_STORE}...")
    with open(MOVIE_STORE, 'w', encoding='utf-8') as f:
        json.dump(custom_movies, f, indent=2, ensure_ascii=False)

    print(f"Import completed! Added {imported_count} new movies.")
    return imported_count

if __name__ == "__main__":
    # Import tất cả phim (có thể giới hạn số lượng để test)
    import_movies(limit=None)  # Set limit=100 để test với ít phim
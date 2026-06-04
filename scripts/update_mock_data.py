import json
import os

GENRE_MAP = {
    "Action": "Hành động",
    "Adventure": "Phiêu lưu",
    "Animation": "Hoạt hình",
    "Children's": "Trẻ em",
    "Comedy": "Hài hước",
    "Crime": "Tội phạm",
    "Documentary": "Tài liệu",
    "Drama": "Kịch tính",
    "Fantasy": "Kỳ ảo",
    "Film-Noir": "Phim đen",
    "Horror": "Kinh dị",
    "Musical": "Âm nhạc",
    "Mystery": "Bí ẩn",
    "Romance": "Lãng mạn",
    "Sci-Fi": "Khoa học viễn tưởng",
    "Thriller": "Giật gân",
    "War": "Chiến tranh",
    "Western": "Miền Tây"
}

GENRE_COLUMNS = [
    "unknown", "Action", "Adventure", "Animation", "Children's", "Comedy", 
    "Crime", "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", 
    "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
]

def parse_u_item(path):
    movies = []
    if not os.path.exists(path):
        return movies
    
    with open(path, 'r', encoding='latin-1') as f:
        for line in f:
            parts = line.strip().split('|')
            if len(parts) < 24:
                continue
            
            movie_id = parts[0]
            title = parts[1]
            # Remove year from title "Title (Year)" -> "Title"
            import re
            clean_title = re.sub(r'\s*\(\d{4}\)$', '', title)
            
            genres = []
            for i, bit in enumerate(parts[5:24]):
                if bit == '1':
                    genre_name = GENRE_COLUMNS[i]
                    if genre_name in GENRE_MAP:
                        genres.append(GENRE_MAP[genre_name])
                    elif genre_name != "unknown":
                        genres.append(genre_name)
            
            movies.append({
                "id": movie_id,
                "title": clean_title,
                "genres": genres,
                "original_id": int(movie_id) - 1 # 0-indexed for cache
            })
    return movies

def load_cache(path):
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return {}

def main():
    u_item_path = "/home/tuantn1807/project/dacn3/tkfilm/service_AI/datasets/ml-100k/u.item"
    cache_path = "/home/tuantn1807/project/dacn3/tkfilm/service_AI/tmdb_cache.json"
    output_path = "/home/tuantn1807/project/dacn3/tkfilm/app/data/mockMovies.ts"
    
    all_movies = parse_u_item(u_item_path)
    cache = load_cache(cache_path)
    
    # Pick a good set of movies (those with posters first, up to 100)
    with_posters = []
    others = []
    
    for m in all_movies:
        cache_key = f"ml_{m['original_id']}"
        if cache_key in cache and cache[cache_key].get('poster_path'):
            m['poster'] = f"https://image.tmdb.org/t/p/w500{cache[cache_key]['poster_path']}"
            m['rating'] = cache[cache_key].get('vote_average', 5.0)
            with_posters.append(m)
        else:
            m['poster'] = "https://via.placeholder.com/500x750?text=" + m['title'].replace(' ', '+')
            m['rating'] = 5.0
            others.append(m)
    
    # Take first 100
    selected = (with_posters + others)[:100]
    
    ts_content = "import { Movie } from \"../types/movie\";\n\n"
    ts_content += "export const movies: Movie[] = [\n"
    
    for m in selected:
        ts_content += "    {\n"
        ts_content += f"        id: \"{m['id']}\",\n"
        ts_content += f"        title: \"{m['title']}\",\n"
        ts_content += f"        genres: {json.dumps(m['genres'], ensure_ascii=False)},\n"
        ts_content += f"        rating: {m['rating']},\n"
        ts_content += f"        poster: \"{m['poster']}\"\n"
        ts_content += "    },\n"
    
    ts_content = ts_content.rstrip(",\n") + "\n];\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"Updated {output_path} with {len(selected)} movies.")

if __name__ == "__main__":
    main()

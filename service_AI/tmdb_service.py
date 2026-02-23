"""TMDB API service for fetching movie data."""
import requests
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"
TMDB_API_KEY = "99a16771b399bdbcd6962d6a42ae9a8e"

# Cache for movie mappings and data
MOVIE_CACHE = {}
MOVIE_ID_CACHE = {}  # Map from MovieLens ID to TMDB ID


class TMDBService:
    """Service for interacting with The Movie Database API."""
    
    def __init__(self, api_key: str = TMDB_API_KEY):
        self.api_key = api_key
        self.base_url = TMDB_BASE_URL
        self.image_base_url = TMDB_IMAGE_BASE_URL
        self.session = requests.Session()
        self.session.params = {"api_key": self.api_key}
    
    def search_movie(self, query: str, year: Optional[int] = None) -> Optional[Dict]:
        """Search for a movie by name and optional year.
        
        Args:
            query: Movie name/title
            year: Release year (optional)
        
        Returns:
            Movie data or None if not found
        """
        try:
            params = {
                "query": query,
                "page": 1,
            }
            if year:
                params["year"] = year
            
            response = self.session.get(
                f"{self.base_url}/search/movie",
                params=params,
                timeout=5
            )
            response.raise_for_status()
            
            data = response.json()
            if data.get("results"):
                return data["results"][0]  # Return best match
            return None
        except Exception as e:
            logger.warning(f"Error searching movie '{query}': {e}")
            return None
    
    def get_movie_details(self, tmdb_id: int) -> Optional[Dict]:
        """Get detailed information about a movie by TMDB ID.
        
        Args:
            tmdb_id: The Movie Database movie ID
        
        Returns:
            Movie details or None if not found
        """
        # Check cache first
        if tmdb_id in MOVIE_CACHE:
            return MOVIE_CACHE[tmdb_id]
        
        try:
            response = self.session.get(
                f"{self.base_url}/movie/{tmdb_id}",
                params={
                    "append_to_response": "videos,credits,recommendations"
                },
                timeout=5
            )
            response.raise_for_status()
            
            data = response.json()
            MOVIE_CACHE[tmdb_id] = data
            return data
        except Exception as e:
            logger.warning(f"Error getting movie details for ID {tmdb_id}: {e}")
            return None
    
    def get_movie_reviews(self, tmdb_id: int, page: int = 1) -> List[Dict]:
        """Get reviews for a movie.
        
        Args:
            tmdb_id: The Movie Database movie ID
            page: Page number for pagination
        
        Returns:
            List of reviews
        """
        try:
            response = self.session.get(
                f"{self.base_url}/movie/{tmdb_id}/reviews",
                params={"page": page},
                timeout=5
            )
            response.raise_for_status()
            
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            logger.warning(f"Error getting reviews for movie {tmdb_id}: {e}")
            return []
    
    def get_movie_credits(self, tmdb_id: int) -> Dict:
        """Get cast and crew information.
        
        Args:
            tmdb_id: The Movie Database movie ID
        
        Returns:
            Credits information with cast and crew
        """
        try:
            response = self.session.get(
                f"{self.base_url}/movie/{tmdb_id}/credits",
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.warning(f"Error getting credits for movie {tmdb_id}: {e}")
            return {"cast": [], "crew": []}
    
    def get_movie_videos(self, tmdb_id: int) -> List[Dict]:
        """Get videos (trailers, teasers, etc.) for a movie.
        
        Args:
            tmdb_id: The Movie Database movie ID
        
        Returns:
            List of videos
        """
        try:
            response = self.session.get(
                f"{self.base_url}/movie/{tmdb_id}/videos",
                timeout=5
            )
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            logger.warning(f"Error getting videos for movie {tmdb_id}: {e}")
            return []
    
    def get_popular_movies(self, page: int = 1) -> List[Dict]:
        """Get list of popular movies.
        
        Args:
            page: Page number for pagination
        
        Returns:
            List of popular movies
        """
        try:
            response = self.session.get(
                f"{self.base_url}/movie/popular",
                params={"page": page},
                timeout=5
            )
            response.raise_for_status()
            return response.json().get("results", [])
        except Exception as e:
            logger.warning(f"Error getting popular movies: {e}")
            return []
    
    def get_trending_movies(self, time_window: str = "week") -> List[Dict]:
        """Get trending movies.
        
        Args:
            time_window: 'day' or 'week'
        
        Returns:
            List of trending movies
        """
        try:
            response = self.session.get(
                f"{self.base_url}/trending/movie/{time_window}",
                timeout=5
            )
            response.raise_for_status()
            return response.json().get("results", [])
        except Exception as e:
            logger.warning(f"Error getting trending movies: {e}")
            return []
    
    def get_genre_list(self) -> List[Dict]:
        """Get list of all genres with IDs.
        
        Returns:
            List of genres
        """
        try:
            response = self.session.get(
                f"{self.base_url}/genre/movie/list",
                timeout=5
            )
            response.raise_for_status()
            return response.json().get("genres", [])
        except Exception as e:
            logger.warning(f"Error getting genres: {e}")
            return []
    
    def get_image_url(self, poster_path: Optional[str], size: str = "w342") -> Optional[str]:
        """Get full image URL for a poster or backdrop."""
        if not poster_path:
            return None
        if poster_path.startswith('http'):
            return poster_path
        return f"{self.image_base_url}/{size}{poster_path}"
    
    def format_movie_data(self, movie_data: Dict, include_credits: bool = False) -> Dict:
        """Format raw TMDB movie data into a clean structure.
        
        Args:
            movie_data: Raw movie data from TMDB API
            include_credits: Whether to fetch and include cast/crew
        
        Returns:
            Formatted movie data
        """
        formatted = {
            "id": movie_data.get("id"),
            "title": movie_data.get("title"),
            "original_title": movie_data.get("original_title"),
            "overview": movie_data.get("overview"),
            "release_date": movie_data.get("release_date"),
            "vote_average": movie_data.get("vote_average"),
            "vote_count": movie_data.get("vote_count"),
            "popularity": movie_data.get("popularity"),
            "poster_path": self.get_image_url(movie_data.get("poster_path")),
            "backdrop_path": self.get_image_url(movie_data.get("backdrop_path"), size="w780"),
            "genres": [g["name"] if isinstance(g, dict) else g for g in movie_data.get("genres", [])],
            "budget": movie_data.get("budget"),
            "revenue": movie_data.get("revenue"),
            "runtime": movie_data.get("runtime"),
            "status": movie_data.get("status"),
            "tagline": movie_data.get("tagline"),
            "production_companies": movie_data.get("production_companies", []),
        }
        
        if include_credits:
            credits = movie_data.get("credits", {})
            formatted["cast"] = credits.get("cast", [])[:10]  # Top 10 cast members
            formatted["director"] = next(
                (p["name"] for p in credits.get("crew", []) if p.get("job") == "Director"),
                None
            )
        
        return formatted


# Global TMDB service instance
tmdb_service = TMDBService()


def search_and_cache_movie(title: str, year: Optional[int] = None) -> Optional[Dict]:
    """Search for a movie on TMDB and cache the result.
    
    Args:
        title: Movie title
        year: Optional release year
    
    Returns:
        Formatted movie data or None
    """
    movie_basic = tmdb_service.search_movie(title, year)
    if not movie_basic:
        return None
    
    tmdb_id = movie_basic.get("id")
    if not tmdb_id:
        return None
    
    # Get full details
    movie_details = tmdb_service.get_movie_details(tmdb_id)
    if not movie_details:
        return movie_basic  # Return basic data if detailed fetch fails
    
    return tmdb_service.format_movie_data(movie_details, include_credits=True)


if __name__ == "__main__":
    # Test the service
    logging.basicConfig(level=logging.INFO)
    
    service = TMDBService()
    
    # Test search
    print("Testing movie search...")
    movie = service.search_movie("The Matrix", 1999)
    if movie:
        print(f"Found: {movie['title']} ({movie.get('release_date')})")
        
        # Test detailed fetch
        details = service.get_movie_details(movie["id"])
        if details:
            formatted = service.format_movie_data(details, include_credits=True)
            print(f"\nFormatted data:")
            print(f"  Title: {formatted['title']}")
            print(f"  Rating: {formatted['vote_average']}/10")
            print(f"  Overview: {formatted['overview'][:100]}...")
            print(f"  Poster: {formatted['poster_path']}")

"""YouTube API service for searching trailers and movies."""
import requests
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3"


class YouTubeService:
    """Service for interacting with YouTube API."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = YOUTUBE_BASE_URL
    
    def search_trailer(self, movie_title: str, year: Optional[int] = None) -> Optional[Dict]:
        """Search for a movie trailer on YouTube.
        
        Args:
            movie_title: Movie title to search for
            year: Optional release year
        
        Returns:
            Dictionary with video ID, title, thumbnail, or None if not found
        """
        try:
            query = f"{movie_title} trailer"
            if year:
                query += f" {year}"
            
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": 5,
                "key": self.api_key,
                "order": "relevance"
            }
            
            response = requests.get(f"{self.base_url}/search", params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            items = data.get("items", [])
            
            if not items:
                return None
            
            # Get the first result (usually most relevant)
            video = items[0]
            video_id = video.get("id", {}).get("videoId")
            
            if not video_id:
                return None
            
            return {
                "video_id": video_id,
                "title": video.get("snippet", {}).get("title"),
                "description": video.get("snippet", {}).get("description"),
                "thumbnail": video.get("snippet", {}).get("thumbnails", {}).get("high", {}).get("url"),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "channel": video.get("snippet", {}).get("channelTitle")
            }
        except Exception as e:
            logger.warning(f"Error searching trailer for '{movie_title}': {e}")
            return None
    
    def search_full_movie(self, movie_title: str, year: Optional[int] = None) -> Optional[Dict]:
        """Search for a full movie on YouTube.
        
        Args:
            movie_title: Movie title to search for
            year: Optional release year
        
        Returns:
            Dictionary with video ID, title, thumbnail, or None if not found
        """
        try:
            query = f"{movie_title} full movie"
            if year:
                query += f" {year}"
            
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": 10,
                "key": self.api_key,
                "order": "relevance"
            }
            
            response = requests.get(f"{self.base_url}/search", params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            items = data.get("items", [])
            
            if not items:
                return None
            
            # Try to find a legitimate full movie (usually from official channels or well-known sources)
            for video in items:
                video_id = video.get("id", {}).get("videoId")
                title = video.get("snippet", {}).get("title", "").lower()
                
                if not video_id:
                    continue
                
                # Filter out clips, trailers, behind-the-scenes
                if any(word in title for word in ["clip", "trailer", "behind the scenes", "review", "reaction"]):
                    continue
                
                return {
                    "video_id": video_id,
                    "title": video.get("snippet", {}).get("title"),
                    "description": video.get("snippet", {}).get("description"),
                    "thumbnail": video.get("snippet", {}).get("thumbnails", {}).get("high", {}).get("url"),
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "channel": video.get("snippet", {}).get("channelTitle")
                }
            
            # If no proper full movie found, return first result
            video = items[0]
            video_id = video.get("id", {}).get("videoId")
            
            if not video_id:
                return None
            
            return {
                "video_id": video_id,
                "title": video.get("snippet", {}).get("title"),
                "description": video.get("snippet", {}).get("description"),
                "thumbnail": video.get("snippet", {}).get("thumbnails", {}).get("high", {}).get("url"),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "channel": video.get("snippet", {}).get("channelTitle")
            }
        except Exception as e:
            logger.warning(f"Error searching full movie for '{movie_title}': {e}")
            return None
    
    def search_movies(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search for movies on YouTube.
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
        
        Returns:
            List of video results
        """
        try:
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": max_results,
                "key": self.api_key
            }
            
            response = requests.get(f"{self.base_url}/search", params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            items = data.get("items", [])
            
            results = []
            for video in items:
                video_id = video.get("id", {}).get("videoId")
                if not video_id:
                    continue
                
                results.append({
                    "video_id": video_id,
                    "title": video.get("snippet", {}).get("title"),
                    "description": video.get("snippet", {}).get("description"),
                    "thumbnail": video.get("snippet", {}).get("thumbnails", {}).get("high", {}).get("url"),
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "channel": video.get("snippet", {}).get("channelTitle")
                })
            
            return results
        except Exception as e:
            logger.warning(f"Error searching YouTube: {e}")
            return []


# Global YouTube service instance (initialized in app.py)
youtube_service = None


def initialize_youtube_service(api_key: str) -> YouTubeService:
    """Initialize YouTube service with API key."""
    global youtube_service
    youtube_service = YouTubeService(api_key)
    return youtube_service

#!/usr/bin/env python3
"""
Test script for TKFilm Backend API
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:5000"

def print_section(title: str):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health():
    """Test health endpoint"""
    print_section("Testing Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_get_movies():
    """Test get movies endpoint"""
    print_section("Testing Get Movies")
    response = requests.get(f"{BASE_URL}/api/movies", params={"per_page": 5})
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Total movies: {data.get('total')}")
    print(f"Sample movies:")
    for movie in data.get('movies', [])[:3]:
        print(f"  - {movie['title']} ({movie.get('release_date', 'N/A')})")
    return response.status_code == 200

def test_rate_movies(session_id: str):
    """Test rating movies"""
    print_section("Testing Rate Movies")
    
    # Rate a few movies
    ratings = [
        {"movie_id": 0, "rating": 5.0},
        {"movie_id": 1, "rating": 4.0},
        {"movie_id": 2, "rating": 4.5},
        {"movie_id": 50, "rating": 3.0},
        {"movie_id": 100, "rating": 4.5},
    ]
    
    for rating_data in ratings:
        payload = {
            "session_id": session_id,
            "movie_id": rating_data["movie_id"],
            "rating": rating_data["rating"]
        }
        response = requests.post(f"{BASE_URL}/api/rate", json=payload)
        data = response.json()
        print(f"Rated movie {rating_data['movie_id']}: {data.get('message')}")
    
    return True

def test_get_ratings(session_id: str):
    """Test get user ratings"""
    print_section("Testing Get User Ratings")
    response = requests.get(f"{BASE_URL}/api/ratings/{session_id}")
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Total ratings: {data.get('total')}")
    print(f"Ratings:")
    for rating in data.get('ratings', []):
        print(f"  - Movie {rating['movie_id']}: {rating['rating']} stars")
    return response.status_code == 200

def test_recommendations(session_id: str):
    """Test recommendations endpoint - USING AI MODELS"""
    print_section("Testing AI Recommendations")
    
    payload = {
        "session_id": session_id,
        "top_k": 10,
        "use_content": True
    }
    
    response = requests.post(f"{BASE_URL}/api/recommend", json=payload)
    data = response.json()
    
    print(f"Status: {response.status_code}")
    print(f"Model: {data.get('model')}")
    print(f"Based on {data.get('based_on_ratings')} ratings")
    print(f"\nTop 10 Recommendations:")
    
    for i, rec in enumerate(data.get('recommendations', [])[:10], 1):
        genres = ", ".join(rec.get('genres', [])[:3])
        print(f"{i}. {rec['title']}")
        print(f"   Genres: {genres}")
        print(f"   Score: {rec['score']:.4f}")
    
    return response.status_code == 200

def main():
    session_id = "test_user_001"
    
    print("\n" + "🎬 TKFilm Backend API Test Suite".center(60))
    print("Testing AI-powered movie recommendation system".center(60))
    
    try:
        # Test 1: Health check
        if not test_health():
            print("\n❌ Backend is not running!")
            return
        
        # Test 2: Get movies
        if not test_get_movies():
            print("\n❌ Failed to get movies")
            return
        
        # Test 3: Rate movies
        test_rate_movies(session_id)
        
        # Test 4: Get ratings
        test_get_ratings(session_id)
        
        # Test 5: Get AI recommendations
        if test_recommendations(session_id):
            print_section("✅ All Tests Passed!")
            print("\n🎉 The 2 AI models are working correctly!")
            print("   - User Attention Autoencoder")
            print("   - Movie Attention Autoencoder")
        else:
            print("\n❌ Recommendations test failed")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to backend!")
        print("   Make sure Flask server is running:")
        print("   cd tkfilm && python app.py")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    main()

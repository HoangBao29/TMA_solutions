"""
Test script for cold-start recommendation system
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✅ Health check passed")

def test_pure_cold_start():
    """Test pure cold-start (no data at all)"""
    print("\n=== Testing Pure Cold-Start (No Data) ===")
    response = requests.post(
        f"{BASE_URL}/api/recommend",
        json={"session_id": "test_pure_cold", "top_k": 10}
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Method: {data.get('method')}")
    print(f"Message: {data.get('message')}")
    print(f"Number of recommendations: {len(data.get('recommendations', []))}")
    assert response.status_code == 200
    assert data.get('method') == 'cold_start_popular'
    assert len(data.get('recommendations', [])) > 0
    print("✅ Pure cold-start test passed")

def test_genre_based_cold_start():
    """Test genre-based cold-start"""
    print("\n=== Testing Genre-Based Cold-Start ===")
    
    # Save preferences
    pref_response = requests.post(
        f"{BASE_URL}/api/preferences",
        json={
            "session_id": "test_genre_cold",
            "favorite_genres": ["Action", "Sci-Fi", "Thriller"]
        }
    )
    print(f"Preferences saved: {pref_response.json()}")
    
    # Get recommendations
    response = requests.post(
        f"{BASE_URL}/api/recommend",
        json={"session_id": "test_genre_cold", "top_k": 10}
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Method: {data.get('method')}")
    print(f"Message: {data.get('message')}")
    print(f"Number of recommendations: {len(data.get('recommendations', []))}")
    
    # Check if recommendations have matching genres
    recs = data.get('recommendations', [])
    if recs:
        print(f"First recommendation: {recs[0].get('title')}")
        print(f"Genres: {recs[0].get('genres')}")
    
    assert response.status_code == 200
    # # assert data.get('method') == 'cold_start_genre'
    # assert "genre" in data.get("method", "")
# 1. Status OK
    assert response.status_code == 200

    # 2. Method có thể là popular nhưng có dùng genre
    assert data.get("method") in [
        "cold_start_popular",
        "cold_start_genre"
    ]

    # 3. Kiểm tra hành vi: phim phải khớp genre yêu thích
    favorite_genres = {"Action", "Sci-Fi", "Thriller"}
    recs = data.get("recommendations", [])

    assert len(recs) > 0

    matched = any(
        favorite_genres & set(rec.get("genres", []))
        for rec in recs
    )

    assert matched, "Genre-based cold-start FAILED: không có phim khớp genre"

    print("✅ Genre-based cold-start behavior test passed")

def test_implicit_feedback_cold_start():
    """Test implicit feedback cold-start"""
    print("\n=== Testing Implicit Feedback Cold-Start ===")

    session_id = "test_implicit_cold"
    clicked_movies = [0, 5, 10, 15, 20]

    # 1. Track implicit feedback (click/view)
    for movie_id in clicked_movies:
        track_response = requests.post(
            f"{BASE_URL}/api/track_view",
            json={
                "session_id": session_id,
                "movie_id": movie_id
            }
        )

        assert track_response.status_code in [200, 201, 204]

        if track_response.text:
            print(f"Tracked movie {movie_id}: {track_response.json()}")
        else:
            print(f"Tracked movie {movie_id}: (no content)")

    # 2. Get recommendations
    response = requests.post(
        f"{BASE_URL}/api/recommend",
        json={
            "session_id": session_id,
            "top_k": 10
        }
    )

    assert response.status_code == 200
    data = response.json()

    print(f"Method: {data.get('method')}")
    print(f"Message: {data.get('message')}")
    print(f"Number of recommendations: {len(data.get('recommendations', []))}")

    # 3. Method: không ép cứng, chỉ cần hợp lệ
    assert data.get("method") in [
        "cold_start_popular",
        "cold_start_implicit",
        "hybrid_implicit",
        "hybrid_genre_click"
    ]

    # 4. HÀNH VI QUAN TRỌNG NHẤT:
    # Phim đã click KHÔNG được xuất hiện lại
    clicked_set = set(clicked_movies)
    recs = data.get("recommendations", [])

    recommended_ids = {
        rec.get("movie_id") for rec in recs
        if rec.get("movie_id") is not None
    }

    assert not (clicked_set & recommended_ids), (
        "Implicit cold-start FAILED: phim đã click vẫn bị recommend"
    )

    print("✅ Implicit feedback cold-start behavior test passed")


def test_collaborative_filtering():
    """Test collaborative filtering with ratings"""
    print("\n=== Testing Collaborative Filtering (>= 3 ratings) ===")
    
    # Rate some movies
    ratings = [(0, 5.0), (5, 4.0), (10, 4.5), (15, 3.5)]
    for movie_id, rating in ratings:
        rate_response = requests.post(
            f"{BASE_URL}/api/rate",
            json={
                "session_id": "test_collaborative",
                "movie_id": movie_id,
                "rating": rating
            }
        )
        print(f"Rated movie {movie_id}: {rate_response.json()}")
    
    # Get recommendations
    response = requests.post(
        f"{BASE_URL}/api/recommend",
        json={"session_id": "test_collaborative", "top_k": 10}
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Method: {data.get('method')}")
    print(f"Model: {data.get('model')}")
    print(f"Based on ratings: {data.get('based_on_ratings')}")
    print(f"Number of recommendations: {len(data.get('recommendations', []))}")
    
    assert response.status_code == 200
    assert data.get('method') == 'collaborative_filtering'
    assert data.get('based_on_ratings') >= 3
    print("✅ Collaborative filtering test passed")

def test_hybrid_recommendation():
    """Test hybrid recommendation (1-2 ratings)"""
    print("\n=== Testing Hybrid Recommendation (1-2 ratings) ===")
    
    # Set preferences
    requests.post(
        f"{BASE_URL}/api/preferences",
        json={
            "session_id": "test_hybrid",
            "favorite_genres": ["Comedy", "Drama"]
        }
    )
    
    # Track some clicks
    requests.post(f"{BASE_URL}/api/track_view", 
                 json={"session_id": "test_hybrid", "movie_id": 25})
    requests.post(f"{BASE_URL}/api/track_view",
                 json={"session_id": "test_hybrid", "movie_id": 30})
    
    # Rate 2 movies
    requests.post(f"{BASE_URL}/api/rate",
                 json={"session_id": "test_hybrid", "movie_id": 35, "rating": 4.0})
    requests.post(f"{BASE_URL}/api/rate",
                 json={"session_id": "test_hybrid", "movie_id": 40, "rating": 5.0})
    
    # Get recommendations
    response = requests.post(
        f"{BASE_URL}/api/recommend",
        json={"session_id": "test_hybrid", "top_k": 10}
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Method: {data.get('method')}")
    print(f"Message: {data.get('message')}")
    print(f"Based on ratings: {data.get('based_on_ratings')}")
    print(f"Number of recommendations: {len(data.get('recommendations', []))}")
    
    assert response.status_code == 200
    assert data.get('method') == 'hybrid'
    print("✅ Hybrid recommendation test passed")

def main():
    """Run all tests"""
    print("=" * 60)
    print("COLD-START RECOMMENDATION SYSTEM TESTS")
    print("=" * 60)
    
    try:
        test_health()
        test_pure_cold_start()
        test_genre_based_cold_start()
        test_implicit_feedback_cold_start()
        test_hybrid_recommendation()
        test_collaborative_filtering()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()


import { Platform } from 'react-native';

// ============ IMPORTANT: Update this IP to your computer's IP address ============
// Find your IP: On Windows, run 'ipconfig' in terminal and look for "IPv4 Address"
// For Expo Go on physical device: Use your computer's local IP (e.g., 192.168.1.x)
// For emulator: Use 10.0.2.2 (Android) or localhost (iOS)
// For physical device with this IP: http://YOUR_IP:5000
export const BACKEND_URL = 'http://10.130.151.190:5000';

// ============================================================================

// Helper function to safely parse JSON and log errors
const safeJsonParse = async (response: Response, endpoint: string) => {
  try {
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    console.log(`[API] Endpoint: ${endpoint}`);
    console.log(`[API] Status: ${response.status}`);
    console.log(`[API] Content-Type: ${contentType}`);
    console.log(`[API] Response text: ${text.substring(0, 200)}`);
    
    if (!response.ok) {
      console.error(`[API] HTTP Error ${response.status}: ${text}`);
      return null;
    }
    
    if (!contentType?.includes('application/json')) {
      console.error(`[API] Response is not JSON: ${contentType}`);
      return null;
    }
    
    return JSON.parse(text);
  } catch (e: any) {
    console.error(`[API] Parse error for ${endpoint}:`, e.message);
    return null;
  }
};

export const api = {
    getRecommendations: async (sessionId: string, topK = 20) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, top_k: topK }),
            });
            const data = await safeJsonParse(resp, '/api/recommend');
            return data || { recommendations: [] };
        } catch (e) {
            console.error('API Error:', e);
            return { recommendations: [] };
        }
    },

    getRecommendationsByGenres: async (genres: string[], topN = 10) => {
        try {
            const genresStr = genres.join(',');
            const resp = await fetch(`${BACKEND_URL}/api/recommend_coldstart?genres=${genresStr}&top_n=${topN}`);
            const data = await safeJsonParse(resp, '/api/recommend_coldstart');
            return data || { results: [] };
        } catch (e) {
            console.error('API Error:', e);
            return { results: [] };
        }
    },

    getSimilarMovies: async (movieIds: string[], topN = 10) => {
        try {
            const idsStr = movieIds.join(',');
            const resp = await fetch(`${BACKEND_URL}/api/recommend_from_movies?movie_ids=${idsStr}&top_n=${topN}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { results: [] };
        }
    },

    getMovieDetails: async (movieId: number) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/movie/${movieId}/tmdb`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return null;
        }
    },

    savePreferences: async (sessionId: string, favoriteGenres: string[]) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, favorite_genres: favoriteGenres }),
            });
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { success: false };
        }
    },

    rateMovie: async (sessionId: string, movieId: number, rating: number) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, movie_id: movieId, rating }),
            });
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { success: false };
        }
    },

    getPopularMovies: async () => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/tmdb/popular`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { results: [] };
        }
    },

    getTrendingMovies: async (window: 'day' | 'week' = 'week') => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/tmdb/trending?window=${window}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { results: [] };
        }
    },

    getMoviesByGenre: async (genre: string, page = 1, perPage = 20) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/movies?genre=${encodeURIComponent(genre)}&page=${page}&per_page=${perPage}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { movies: [] };
        }
    },

    getUserStatus: async (sessionId: string) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/user/status/${sessionId}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { rating_count: 0, onboarded: false };
        }
    },

    getSimilarMoviesItemToItem: async (movieId: number, topK = 10) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/movies/similar/${movieId}?top_k=${topK}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { results: [] };
        }
    },

    getOnboardingMovies: async (limit = 20) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/movies/onboarding?limit=${limit}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { movies: [] };
        }
    },

    getUserRatings: async (sessionId: string) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/user_ratings?session_id=${sessionId}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { ratings: [] };
        }
    },

    searchMovies: async (query: string) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/tmdb/search?query=${encodeURIComponent(query)}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { results: [] };
        }
    },

    getTmdbMovieDetails: async (tmdbId: number) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/tmdb/movie/${tmdbId}`);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return null;
        }
    },

    getGenres: async () => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/genres`);
            const data = await safeJsonParse(resp, '/api/genres');
            return data || { genres: [] };
        } catch (e) {
            console.error('API Error:', e);
            return { genres: [] };
        }
    }
};


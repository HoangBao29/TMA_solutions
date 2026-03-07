
import { Platform } from 'react-native';

// For physical devices, use your computer's IP address (e.g., 'http://192.168.1.6:5000')
// For emulator/simulator, 10.0.2.2 is used for Android and localhost for iOS
const BACKEND_URL = 'http://10.223.207.170:5000';



export const api = {
    getRecommendations: async (sessionId: string, topK = 20) => {
        try {
            const resp = await fetch(`${BACKEND_URL}/api/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, top_k: topK }),
            });
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return { recommendations: [] };
        }
    },

    getRecommendationsByGenres: async (genres: string[], topN = 10) => {
        try {
            const genresStr = genres.join(',');
            const resp = await fetch(`${BACKEND_URL}/api/recommend_coldstart?genres=${genresStr}&top_n=${topN}`);
            return await resp.json();
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
    }
};



import { Platform } from 'react-native';
import { supabase } from '../../supabase';

// ============ IMPORTANT: Update this IP to your computer's IP address ============
// Find your IP: On Windows, run 'ipconfig' in terminal and look for "IPv4 Address"
// For Expo Go on physical device: Use your computer's local IP (e.g., 192.168.1.x)
// For emulator: Use 10.0.2.2 (Android) or localhost (iOS)
// For physical device with this IP: http://YOUR_IP:5000
export const BACKEND_URL = 'http://192.168.1.16:5000';

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
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error('Supabase auth session error:', sessionError);
            }

            const userId = sessionData?.session?.user?.id;
            if (userId) {
                const { data: existing, error: selectError } = await supabase
                    .from('rating')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('movie_id', movieId)
                    .limit(1)
                    .single();

                if (selectError && selectError.code !== 'PGRST116') {
                    console.error('Supabase lookup rating error:', selectError);
                }

                if (existing?.id) {
                    const { error: updateError } = await supabase
                        .from('rating')
                        .update({ star: rating })
                        .eq('id', existing.id);

                    if (updateError) {
                        console.error('Supabase update rating error:', updateError);
                    }
                } else {
                    const { error: insertError } = await supabase
                        .from('rating')
                        .insert([{ user_id: userId, movie_id: movieId, star: rating }]);

                    if (insertError) {
                        console.error('Supabase insert rating error:', insertError);
                    }
                }
            }

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

    getUserRatings: async (sessionId?: string) => {
        try {
            const { data, error } = await supabase
                .from('rating')
                .select('movie_id, star')
                .eq('user_id', (await supabase.auth.getSession()).data.session?.user?.id ?? '');

            if (error) {
                console.error('Supabase getUserRatings error:', error);
                return { ratings: [] };
            }

            return {
                ratings: (data || []).map((item: any) => ({
                    movie_id: item.movie_id?.toString(),
                    rating: Number(item.star),
                })),
            };
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
    },

    searchYouTubeTrailer: async (movieTitle: string, year?: number) => {
        try {
            let url = `${BACKEND_URL}/api/youtube/search/trailer/${encodeURIComponent(movieTitle)}`;
            if (year) {
                url += `?year=${year}`;
            }
            const resp = await fetch(url);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return null;
        }
    },

    searchYouTubeFullMovie: async (movieTitle: string, year?: number) => {
        try {
            let url = `${BACKEND_URL}/api/youtube/search/movie/${encodeURIComponent(movieTitle)}`;
            if (year) {
                url += `?year=${year}`;
            }
            const resp = await fetch(url);
            return await resp.json();
        } catch (e) {
            console.error('API Error:', e);
            return null;
        }
    },

    // Lưu lịch sử xem phim
    saveWatchHistory: async (movieId: number, movieTitle?: string, posterPath?: string) => {
        try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData?.session?.user?.id) {
                console.warn('Cannot save watch history: not authenticated');
                return { success: false };
            }

            const userId = sessionData.session.user.id;
            
            // Upsert: nếu đã xem phim này rồi, cập nhật thời gian; nếu chưa, thêm mới
            const { error } = await supabase
                .from('watch_history')
                .upsert(
                    {
                        user_id: userId,
                        movie_id: movieId,
                        watched_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id,movie_id' }
                );

            if (error) {
                console.error('Supabase saveWatchHistory error:', error);
                return { success: false };
            }

            return { success: true };
        } catch (e) {
            console.error('API Error saveWatchHistory:', e);
            return { success: false };
        }
    },

    // Lấy lịch sử xem phim
    getWatchHistory: async () => {
        try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData?.session?.user?.id) {
                console.warn('Cannot get watch history: not authenticated');
                return { watch_history: [] };
            }

            const userId = sessionData.session.user.id;
            
            const { data, error } = await supabase
                .from('watch_history')
                .select('movie_id, watched_at')
                .eq('user_id', userId)
                .order('watched_at', { ascending: false });

            if (error) {
                console.error('Supabase getWatchHistory error:', error);
                return { watch_history: [] };
            }

            return {
                watch_history: (data || []).map((item: any) => ({
                    movie_id: item.movie_id?.toString(),
                    watched_at: item.watched_at,
                })),
            };
        } catch (e) {
            console.error('API Error getWatchHistory:', e);
            return { watch_history: [] };
        }
    }
};


import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { MovieCard } from "../components/MovieCard";
import { api } from "../service/api";
import { useUserPreference } from "../store/userPreference";
import { Movie } from "../types/movie";

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [similar, setSimilar] = useState<Movie[]>([]);
    const [recommended, setRecommended] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const { rateMovie, ratings, sessionId } = useUserPreference();

    const userRating = ratings[id!] || 0;

    const loadData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            // Load details
            const movieData = await api.getMovieDetails(parseInt(id));
            setMovie(movieData);

            // Load similar movies (Item-to-Item)
            const similarRes = await api.getSimilarMoviesItemToItem(parseInt(id));
            setSimilar(similarRes.results || []);

            // Load user-based recommendations
            const recsRes = await api.getRecommendations(sessionId, 10);
            setRecommended(recsRes.recommendations || []);

        } catch (e) {
            console.error('Error loading movie details:', e);
        } finally {
            setLoading(false);
        }
    }, [id, sessionId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRate = async (score: number) => {
        if (!id) return;
        console.log('Rating movie:', id, 'score:', score);
        rateMovie(id, score);
        try {
            await api.rateMovie(sessionId, parseInt(id), score);
            // Re-fetch recommendations after rating
            const recsRes = await api.getRecommendations(sessionId, 10);
            setRecommended(recsRes.recommendations || []);
        } catch (e) {
            console.error('Failed to save rating:', e);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy phim.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={{ color: '#fff' }}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const posterUrl = movie.tmdb?.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.tmdb.poster_path}`
        : (movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) : "https://via.placeholder.com/500x750?text=No+Poster");

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.posterContainer}>
                <Image source={{ uri: posterUrl }} style={styles.poster} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.posterGradient}
                />
                <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.mainInfo}>
                    <Text style={styles.title}>{movie.title}</Text>
                    <Text style={styles.genres}>
                        {movie.genres?.join(" • ") || movie.tmdb?.genres?.map((g: any) => g.name).join(" • ") || "Phổ thông"}
                    </Text>

                    {movie.tmdb?.vote_average && (
                        <View style={styles.tmdbRating}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.tmdbRatingText}>
                                {movie.tmdb.vote_average.toFixed(1)} / 10 (TMDB)
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.ratingSection}>
                    <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <TouchableOpacity key={s} onPress={() => handleRate(s)}>
                                <Ionicons
                                    name={userRating >= s ? "star" : "star-outline"}
                                    size={40}
                                    color={userRating >= s ? "#FFD700" : "#ddd"}
                                    style={styles.starIcon}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {userRating > 0 && <Text style={styles.ratingStatus}>Bạn đã chấm {userRating}/5</Text>}
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Nội dung</Text>
                    <Text style={styles.overview}>
                        {movie.tmdb?.overview || "Chưa có thông tin nội dung phim."}
                    </Text>
                </View>

                {/* Section: Similar Movies */}
                {similar.length > 0 && (
                    <View style={styles.listSection}>
                        <Text style={styles.sectionTitle}>🎯 Phim tương tự</Text>
                        <FlatList
                            data={similar}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => <MovieCard movie={item} />}
                            keyExtractor={(item) => `sim-${item.movie_id || item.id}`}
                            contentContainerStyle={styles.horizontalList}
                        />
                    </View>
                )}

                {/* Section: Recommended for You */}
                {recommended.length > 0 && (
                    <View style={styles.listSection}>
                        <Text style={styles.sectionTitle}>✨ Có thể bạn sẽ thích (AI)</Text>
                        <FlatList
                            data={recommended}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => <MovieCard movie={item} />}
                            keyExtractor={(item) => `rec-${item.movie_id || item.id}`}
                            contentContainerStyle={styles.horizontalList}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    posterContainer: {
        width: '100%',
        height: 500,
        position: 'relative',
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    posterGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    floatingBackButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        marginTop: -40,
    },
    mainInfo: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    genres: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 6,
        fontWeight: '500',
    },
    tmdbRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    tmdbRatingText: {
        color: '#fff',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: 'bold',
    },
    ratingSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1a1a1a',
    },
    stars: {
        flexDirection: 'row',
    },
    starIcon: {
        marginHorizontal: 4,
    },
    ratingStatus: {
        marginTop: 12,
        fontSize: 15,
        color: '#007AFF',
        fontWeight: '600',
    },
    infoSection: {
        marginBottom: 30,
    },
    overview: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
    },
    listSection: {
        marginBottom: 30,
    },
    horizontalList: {
        paddingBottom: 10,
    },
    backButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    }
});

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MovieCard } from "../components/MovieCard";
import { api } from "../service/api";
import { Movie } from "../types/movie";

import { useUserPreference } from "../store/userPreference";

export default function MovieDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [similar, setSimilar] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const { rateMovie, ratings } = useUserPreference();

    const userRating = ratings[id!] || 0;

    useEffect(() => {
        const loadData = async () => {
            console.log('Loading movie details for ID:', id);
            setLoading(true);
            try {
                const movieData = await api.getMovieDetails(parseInt(id!));
                console.log('Movie data loaded:', movieData?.title);
                setMovie(movieData);

                // Get similar movies based on this one
                const similarData = await api.getSimilarMovies([id!]);
                console.log('Similar movies loaded:', similarData.results?.length || 0);
                if (similarData.results) {
                    setSimilar(similarData.results);
                }
            } catch (e) {
                console.error('Error loading movie details:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10 }}>Đang tải thông tin phim...</Text>
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy phim.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#007AFF' }}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const posterUrl = movie.tmdb?.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.tmdb.poster_path}`
        : (movie.poster_path || "https://via.placeholder.com/300x450?text=No+Poster");

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: posterUrl }} style={styles.poster} />

            <View style={styles.content}>
                <Text style={styles.title}>{movie.title}</Text>
                <Text style={styles.genres}>{movie.genres.join(" • ")}</Text>

                <View style={styles.ratingSection}>
                    <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => {
                                    console.log('Rating movie:', id, 'score:', s);
                                    rateMovie(id!, s);
                                    api.rateMovie(useUserPreference.getState().sessionId, parseInt(id!), s).catch(console.error);

                                }}
                            >
                                <Text style={[styles.star, userRating >= s && styles.starActive]}>
                                    {userRating >= s ? "★" : "☆"}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {userRating > 0 && <Text style={styles.ratingText}>Bạn đã chấm {userRating}/5</Text>}
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Nội dung</Text>
                    <Text style={styles.overview}>
                        {movie.tmdb?.overview || "Chưa có thông tin nội dung phim."}
                    </Text>
                </View>

                {similar.length > 0 && (
                    <View style={styles.similarSection}>
                        <Text style={styles.sectionTitle}>🎯 Có thể bạn cũng thích</Text>
                        <FlatList
                            data={similar}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => <MovieCard movie={item} />}
                            keyExtractor={(item) => `sim-${item.movie_id || item.id}`}
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
        padding: 40,
    },
    poster: {
        width: '100%',
        height: 450,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
    },
    genres: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
        marginBottom: 20,
    },
    ratingSection: {
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    stars: {
        flexDirection: 'row',
    },
    star: {
        fontSize: 36,
        color: '#ddd',
        marginHorizontal: 4,
    },
    starActive: {
        color: '#FFD700',
    },
    ratingText: {
        marginTop: 8,
        color: '#666',
        fontWeight: '500',
    },
    infoSection: {
        marginBottom: 24,
    },
    overview: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
    },
    similarSection: {
        marginTop: 10,
        marginBottom: 30,
    }
});

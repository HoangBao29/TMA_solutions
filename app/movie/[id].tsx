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
    View,
    Linking,
    Alert
} from "react-native";
import { MovieCard } from "../components/MovieCard";
import { api } from "../service/api";
import { useUserPreference } from "../store/userPreference";
import { Movie } from "../types/movie";

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
    const { id, isTmdb } = useLocalSearchParams<{ id: string, isTmdb?: string }>();
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
            let movieData: Movie | null = null;
            if (isTmdb === 'true') {
                movieData = await api.getTmdbMovieDetails(parseInt(id));
            } else {
                movieData = await api.getMovieDetails(parseInt(id));
            }
           // movieData = await api.getTmdbMovieDetails(parseInt(id));
            setMovie(movieData);

            if (movieData) {
                // Load similar movies
                if (isTmdb === 'true' && movieData.tmdb?.recommendations?.results) {
                    setSimilar(movieData.tmdb.recommendations.results.slice(0, 10));
                } else {
                    const similarRes = await api.getSimilarMoviesItemToItem(parseInt(id));
                    setSimilar(similarRes.results || []);
                }
            }

            // Load user-based recommendations
            const recsRes = await api.getRecommendations(sessionId, 10);
            setRecommended(recsRes.recommendations || []);

        } catch (e) {
            console.error('Error loading movie details:', e);
        } finally {
            setLoading(false);
        }
    }, [id, sessionId, isTmdb]);

    const loadUserRating = useCallback(async () => {
        if (!id || ratings[id] !== undefined) return;

        try {
            const data = await api.getUserRatings();
            const ratingItem = data.ratings?.find((item: any) => String(item.movie_id) === id);
            if (ratingItem) {
                rateMovie(id, Number(ratingItem.rating));
            }
        } catch (e) {
            console.error('Failed to load user rating for movie:', e);
        }
    }, [id, ratings, rateMovie]);

    useEffect(() => {
        loadData();
        loadUserRating();
    }, [loadData, loadUserRating]);

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

    const handleWatchMovie = async () => {
        if (!movie?.title) {
            Alert.alert("Lỗi", "Không thể lấy tên phim.");
            return;
        }

        try {
            // Lưu lịch sử xem phim
            const movieId = parseInt(id!);
            await api.saveWatchHistory(movieId, movie.title, movie.poster_path || movie.tmdb?.poster_path);
            // First try TMDB videos if available
            const videos = movie?.tmdb?.videos;
            if (videos && videos.length > 0) {
                const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
                const video = trailer || videos.find((v: any) => v.site === 'YouTube');
                
                if (video) {
                    const url = `https://www.youtube.com/watch?v=${video.key}`;
                    Linking.openURL(url).catch(() => {
                        Alert.alert("Lỗi", "Không thể mở video.");
                    });
                    return;
                }
            }

            // If no TMDB video, search YouTube
            Alert.alert("Đang tải...", "Đang tìm trailer trên YouTube...");
            const result = await api.searchYouTubeTrailer(movie.title, movie.tmdb?.release_date ? new Date(movie.tmdb.release_date).getFullYear() : undefined);
            
            if (result && result.url) {
                Linking.openURL(result.url).catch(() => {
                    Alert.alert("Lỗi", "Không thể mở YouTube.");
                });
            } else {
                Alert.alert("Không tìm thấy", "Không tìm thấy trailer cho phim này.");
            }
        } catch (e) {
            console.error('Error searching trailer:', e);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi tìm trailer.");
        }
    };

    const handleWatchFullMovie = async () => {
        if (!movie?.title) {
            Alert.alert("Lỗi", "Không thể lấy tên phim.");
            return;
        }

        try {
            // Lưu lịch sử xem phim
            const movieId = parseInt(id!);
            await api.saveWatchHistory(movieId, movie.title, movie.poster_path || movie.tmdb?.poster_path);
            
            // First check watch providers from TMDB
            const providers = movie?.tmdb?.watch_providers;
            
            if (providers && Object.keys(providers).length > 0) {
                const region = providers.region || "US";
                const flatrate = providers.flatrate;
                const rent = providers.rent;
                const buy = providers.buy;
                const link = providers.link;

                if (flatrate || rent || buy) {
                    let options = ["Hủy"];
                    let providerInfo = `Xem phim ${movie.title}:\n\n`;

                    if (flatrate) {
                        providerInfo += `📺 Streaming:\n`;
                        flatrate.forEach((p: any) => {
                            providerInfo += `  • ${p.provider_name}\n`;
                        });
                        options.push("Streaming");
                    }

                    if (rent) {
                        providerInfo += `\n🎬 Thuê:\n`;
                        rent.forEach((p: any) => {
                            providerInfo += `  • ${p.provider_name}\n`;
                        });
                        options.push("Thuê");
                    }

                    if (buy) {
                        providerInfo += `\n🎁 Mua:\n`;
                        buy.forEach((p: any) => {
                            providerInfo += `  • ${p.provider_name}\n`;
                        });
                        options.push("Mua");
                    }

                    Alert.alert(
                        "Nơi xem phim",
                        providerInfo + `\n(Khu vực: ${region})`,
                        options.map((option) => ({
                            text: option,
                            onPress: () => {
                                if (option === "Hủy") return;
                                
                                if (link) {
                                    Linking.openURL(link).catch(() => {
                                        Alert.alert("Lỗi", "Không thể mở liên kết.");
                                    });
                                } else {
                                    let provider = "";
                                    if (option === "Streaming" && flatrate && flatrate.length > 0) {
                                        provider = flatrate[0].provider_name;
                                    } else if (option === "Thuê" && rent && rent.length > 0) {
                                        provider = rent[0].provider_name;
                                    } else if (option === "Mua" && buy && buy.length > 0) {
                                        provider = buy[0].provider_name;
                                    }

                                    if (provider.toLowerCase().includes("netflix")) {
                                        Linking.openURL("https://www.netflix.com").catch(() => {
                                            Alert.alert("Lỗi", "Không thể mở Netflix.");
                                        });
                                    } else if (provider.toLowerCase().includes("disney")) {
                                        Linking.openURL("https://www.disneyplus.com").catch(() => {
                                            Alert.alert("Lỗi", "Không thể mở Disney+.");
                                        });
                                    } else {
                                        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movie.title + " " + provider)}`;
                                        Linking.openURL(searchUrl).catch(() => {
                                            Alert.alert("Lỗi", "Không thể mở Google.");
                                        });
                                    }
                                }
                            }
                        }))
                    );
                    return;
                }
            }

            // If no watch providers, search YouTube for full movie
            Alert.alert("Đang tải...", "Đang tìm phim trên YouTube...");
            const result = await api.searchYouTubeFullMovie(movie.title, movie.tmdb?.release_date ? new Date(movie.tmdb.release_date).getFullYear() : undefined);
            
            if (result && result.url) {
                Linking.openURL(result.url).catch(() => {
                    Alert.alert("Lỗi", "Không thể mở YouTube.");
                });
            } else {
                Alert.alert(
                    "Không tìm thấy",
                    "Không tìm thấy phim trên các nền tảng. Tìm trên Google?",
                    [
                        {
                            text: "Hủy",
                            onPress: () => {},
                            style: "cancel"
                        },
                        {
                            text: "Tìm trên Google",
                            onPress: () => {
                                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movie.title + " watch online")}`;
                                Linking.openURL(searchUrl).catch(() => {
                                    Alert.alert("Lỗi", "Không thể mở Google.");
                                });
                            }
                        }
                    ]
                );
            }
        } catch (e) {
            console.error('Error searching full movie:', e);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi tìm phim.");
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

    const getPosterUrl = () => {
        const path = movie.poster_path || movie.tmdb?.poster_path;
        if (!path) return "https://via.placeholder.com/500x750?text=No+Poster";
        if (path.startsWith('http')) return path;
        return `https://image.tmdb.org/t/p/w500${path}`;
    };

    const renderGenres = () => {
        const genres = movie.genres || movie.tmdb?.genres;
        if (!genres || !Array.isArray(genres)) return "Phổ thông";
        return genres.map((g: any) => typeof g === 'string' ? g : g.name).join(" • ");
    };

    const posterUrl = getPosterUrl();

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
                    <Text style={styles.genres}>{renderGenres()}</Text>
                    {(movie.vote_average !== undefined || movie.tmdb?.vote_average !== undefined) && (
                        <View style={styles.tmdbRating}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.tmdbRatingText}>
                                {(movie.vote_average || movie.tmdb?.vote_average || 0).toFixed(1)} / 10 (TMDB)
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
                    {userRating > 0 ? (
                        <Text style={styles.ratingStatus}>Bạn đã chấm {userRating}/5</Text>
                    ) : null}
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Nội dung</Text>
                    <Text style={styles.overview}>
                        {movie.tmdb?.overview || movie.overview || "Chưa có thông tin nội dung phim."}
                    </Text>
                </View>

                {/* Watch Movie Button */}
                <View style={styles.watchSection}>
                    <View style={styles.watchButtonsContainer}>
                        <TouchableOpacity style={styles.watchButton} onPress={handleWatchMovie}>
                            <Ionicons name="play-circle" size={24} color="#fff" />
                            <Text style={styles.watchButtonText}>Xem Trailer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.watchFullButton} onPress={handleWatchFullMovie}>
                            <Ionicons name="film" size={24} color="#fff" />
                            <Text style={styles.watchButtonText}>Xem Phim</Text>
                        </TouchableOpacity>
                    </View>
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
    watchSection: {
        marginBottom: 30,
        alignItems: 'center',
    },
    watchButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    watchButton: {
        backgroundColor: '#FF0000', // YouTube red
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        flex: 1,
        marginHorizontal: 5,
    },
    watchFullButton: {
        backgroundColor: '#007AFF', // Blue for full movie
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        flex: 1,
        marginHorizontal: 5,
    },
    watchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
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

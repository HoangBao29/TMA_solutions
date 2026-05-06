import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { api } from './service/api';
import { useUserPreference } from './store/userPreference';
import { Movie } from './types/movie';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

export default function OnboardingScreen() {
    const router = useRouter();
    const sessionId = useUserPreference((state) => state.sessionId);
    const { rateMovie, ratings, setOnboarded } = useUserPreference();

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    const ratingCount = Object.keys(ratings).length;
    const progress = Math.min(ratingCount / 5, 1);

    useEffect(() => {
        const fetchOnboardingMovies = async () => {
            try {
                const data = await api.getOnboardingMovies(24);
                if (data.movies) {
                    setMovies(data.movies);
                }
            } catch (error) {
                console.error('Failed to fetch onboarding movies:', error);
            } finally {
                setLoading(false);
            }
        };

        const loadRatings = async () => {
            try {
                const data = await api.getUserRatings(sessionId);
                data.ratings.forEach((r: any) => rateMovie(r.movie_id.toString(), r.rating));
            } catch (error) {
                console.error('Failed to load ratings:', error);
            }
        };

        loadRatings();
        fetchOnboardingMovies();
    }, []);

    const handleRate = async (movieId: string | number, score: number) => {
        const id = movieId.toString();
        rateMovie(id, score);
        try {
            await api.rateMovie(sessionId, parseInt(id), score);
        } catch (error) {
            console.error('Failed to save rating:', error);
        }
    };

    const handleContinue = () => {
        if (ratingCount >= 5) {
            setOnboarded(true);
            router.replace('/(tabs)');
        }
    };

    const renderMovieItem = ({ item }: { item: Movie }) => {
        const id = (item.movie_id ?? item.id).toString();
        const currentRating = ratings[id] || 0;

        const posterUrl = item.poster_path
            ? (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w300${item.poster_path}`)
            : 'https://via.placeholder.com/300x450?text=No+Poster';

        return (
            <View style={styles.movieCard}>
                <Image source={{ uri: posterUrl }} style={styles.poster} />
                <View style={styles.cardOverlay}>
                    <Text numberOfLines={1} style={styles.movieTitle}>{item.title}</Text>
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => handleRate(id, star)}
                                hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                            >
                                <Ionicons
                                    name={currentRating >= star ? "star" : "star-outline"}
                                    size={16}
                                    color={currentRating >= star ? "#FFD700" : "#fff"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                {currentRating > 0 && (
                    <View style={styles.ratedBadge}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Chào mừng bạn! 👋</Text>
                <Text style={styles.subtitle}>Đánh giá ít nhất 5 phim để nhận gợi ý chính xác nhất từ AI.</Text>

                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressText}>Tiến độ: {ratingCount}/5 phim</Text>
                        <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                </View>
            </View>

            <FlatList
                data={movies}
                renderItem={renderMovieItem}
                keyExtractor={(item) => (item.movie_id ?? item.id).toString()}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, ratingCount < 5 && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={ratingCount < 5}
                >
                    <LinearGradient
                        colors={ratingCount >= 5 ? ['#007AFF', '#0055FF'] : ['#ccc', '#bbb']}
                        style={styles.gradient}
                    >
                        <Text style={styles.continueText}>
                            {ratingCount >= 5 ? 'Tiếp tục vào Trang chủ' : `Đánh giá thêm ${Math.max(0, 5 - ratingCount)} phim`}
                        </Text>
                        {ratingCount >= 5 && <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 10 }} />}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginTop: 8,
        lineHeight: 20,
    },
    progressSection: {
        marginTop: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    percentText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#007AFF',
    },
    listContent: {
        padding: 12,
    },
    movieCard: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.5,
        margin: 6,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#ddd',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
    },
    movieTitle: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ratedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    continueButton: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.8,
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

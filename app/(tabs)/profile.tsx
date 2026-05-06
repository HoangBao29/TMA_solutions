import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../service/api';
import { supabase } from '../../supabase';
import { useUserPreference } from '../store/userPreference';

export default function ProfileScreen() {
    const router = useRouter();
    const { sessionId, resetSession } = useUserPreference();
    const [ratedMovies, setRatedMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRatings = async () => {
        setLoading(true);
        try {
            const data = await api.getUserRatings(sessionId);
            setRatedMovies(data.ratings || []);
        } catch (error) {
            console.error('Failed to load user ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRatings();
    }, [sessionId]);

    const handleReset = () => {
        resetSession();
        // Redirect to splash or onboarding
    };

    const handleLogout = async () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    onPress: async () => {
                        await supabase.auth.signOut();
                        router.replace('/log-in' as any);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>U</Text>
                </View>
                <Text style={styles.username}>Người dùng ẩn danh</Text>
                <Text style={styles.sessionId}>ID: {sessionId.substring(0, 8)}...</Text>

                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetText}>Xóa dữ liệu & Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Phim đã đánh giá ({ratedMovies.length})</Text>
                    <TouchableOpacity onPress={loadRatings}>
                        <Ionicons name="refresh" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={ratedMovies}
                        keyExtractor={(item) => item.movie_id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.ratingItem}>
                                <View style={styles.movieInfo}>
                                    <Text style={styles.movieTitle}>{item.title}</Text>
                                    <View style={styles.stars}>
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Ionicons
                                                key={s}
                                                name={item.rating >= s ? "star" : "star-outline"}
                                                size={16}
                                                color="#FFD700"
                                            />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.ratingValue}>{item.rating}/5</Text>
                            </View>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Bạn chưa đánh giá phim nào.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    sessionId: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    resetButton: {
        marginTop: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ff4d4d',
    },
    resetText: {
        color: '#ff4d4d',
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    logoutText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    listContent: {
        paddingHorizontal: 20,
    },
    ratingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    movieInfo: {
        flex: 1,
    },
    movieTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    stars: {
        flexDirection: 'row',
    },
    ratingValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginLeft: 15,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { MovieCard } from '../components/MovieCard';
import { api } from '../service/api';
import { Movie } from '../types/movie';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        Keyboard.dismiss();
        try {
            const data = await api.searchMovies(query);
            setResults(data.results || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm phim theo tên..."
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Tìm</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => (item.movie_id || item.id).toString()}
                    renderItem={({ item }) => <MovieCard movie={item} />}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        query.length > 0 ? (
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>Không tìm thấy phim nào khớp với "{query}"</Text>
                            </View>
                        ) : (
                            <View style={styles.center}>
                                <Ionicons name="film-outline" size={60} color="#eee" />
                                <Text style={styles.placeholderText}>Nhập tên phim để bắt đầu tìm kiếm</Text>
                            </View>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 45,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    searchButton: {
        marginLeft: 15,
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    listContent: {
        padding: 10,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    placeholderText: {
        color: '#ccc',
        fontSize: 16,
        marginTop: 10,
    }
});

import { useRouter } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Movie } from "../types/movie";


const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

export function MovieCard({ movie }: { movie: Movie }) {
    const router = useRouter();

    // const posterUrl = movie.poster
    // ? movie.poster
    // : "https://via.placeholder.com/150x225?text=No+Poster"; abcdef
    const posterUrl = movie.poster_path
        ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
        : "https://via.placeholder.com/150x225?text=No+Poster";

    const handlePress = () => {
        const movieId = movie.movie_id || movie.id;
        const isTmdb = movie.movie_id === undefined;
        console.log('MovieCard pressed, pushing to:', `/movie/${movieId}?isTmdb=${isTmdb}`);
        router.push(`/movie/${movieId}?isTmdb=${isTmdb}`);
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.card} activeOpacity={0.8}>
            <Image
                source={{ uri: posterUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {movie.title}
                </Text>
                <Text style={styles.genres} numberOfLines={1}>
                    {movie.genres.slice(0, 2).join(", ")}
                </Text>
                {movie.score !== undefined && (
                    <Text style={styles.score}>Match: {(movie.score * 100).toFixed(0)}%</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: CARD_WIDTH * 1.5,
    },
    info: {
        padding: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    genres: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    score: {
        fontSize: 10,
        color: '#007AFF',
        fontWeight: 'bold',
        marginTop: 4,
    }
});

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
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

export default function HomeScreen() {
  const { sessionId, ratings } = useUserPreference();
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recMessage, setRecMessage] = useState("");

  const ratingCount = Object.keys(ratings).length;

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      // Load sections in parallel
      const promises: Promise<any>[] = [
        api.getPopularMovies(),
        api.getTrendingMovies('week')
      ];

      // Only fetch recommendations if user has enough ratings
      if (ratingCount >= 3) {
        promises.push(api.getRecommendations(sessionId, 20));
      }

      const results = await Promise.all(promises);

      setPopular(results[0].results || []);
      setTrending(results[1].results || []);

      if (ratingCount >= 3 && results[2]) {
        setRecommended(results[2].recommendations || []);
        setRecMessage(results[2].message || "Dành riêng cho bạn");
      } else {
        setRecommended([]);
      }
    } catch (e) {
      console.error("Failed to load home data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId, ratingCount]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const renderSectionHeader = (title: string, icon: string, color: string) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Ionicons name={icon as any} size={22} color={color} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity>
        <Text style={styles.seeAllText}>Xem tất cả</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyRecommended = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#f0f4ff', '#fff']}
        style={styles.emptyGradient}
      >
        <Ionicons name="sparkles-outline" size={40} color="#007AFF" />
        <Text style={styles.emptyTitle}>AI cần thêm dữ liệu</Text>
        <Text style={styles.emptyText}>Đánh giá thêm {Math.max(0, 5 - ratingCount)} phim nữa để kích hoạt gợi ý thông minh từ RSAttAE.</Text>
        <TouchableOpacity style={styles.rateButton}>
          <Text style={styles.rateButtonText}>Khám phá phim để đánh giá</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang chuẩn bị kho phim cho bạn...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient colors={['#007AFF', '#00C6FF']} style={styles.heroHeader}>
        <View style={styles.heroContent}>
          <Text style={styles.welcomeText}>Xin chào! 👋</Text>
          <Text style={styles.heroTitle}>Hôm nay bạn muốn xem gì?</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Section 1: Recommended */}
        {ratingCount >= 3 ? (
          <View style={styles.section}>
            {renderSectionHeader(recMessage || "Gợi ý cho bạn", "sparkles", "#FFD700")}
            <FlatList
              data={recommended}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <MovieCard movie={item} />}
              keyExtractor={(item) => `rec-${item.movie_id || item.id}`}
              contentContainerStyle={styles.horizontalList}
              ListEmptyComponent={<ActivityIndicator color="#007AFF" style={{ marginLeft: 20 }} />}
            />
            {ratingCount < 5 && (
              <View style={styles.tipBox}>
                <Ionicons name="information-circle" size={16} color="#007AFF" />
                <Text style={styles.tipText}>Gợi ý sẽ chính xác hơn khi bạn đạt 5 đánh giá.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {renderSectionHeader("Gợi ý từ AI", "sparkles", "#ddd")}
            {renderEmptyRecommended()}
          </View>
        )}

        {/* Section 2: Popular */}
        <View style={styles.section}>
          {renderSectionHeader("Phim Phổ Biến", "flame", "#FF4500")}
          <FlatList
            data={popular}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <MovieCard movie={item} />}
            keyExtractor={(item) => `pop-${item.movie_id || item.id}`}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Section 3: Trending */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          {renderSectionHeader("Phim Thịnh Hành", "trending-up", "#4CAF50")}
          <FlatList
            data={trending}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <MovieCard movie={item} />}
            keyExtractor={(item) => `trend-${item.movie_id || item.id}`}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  heroHeader: {
    height: 180,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroContent: {
    marginBottom: 10,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  content: {
    marginTop: -10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#1a1a1a",
  },
  seeAllText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 10,
  },
  emptyContainer: {
    paddingHorizontal: 20,
  },
  emptyGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eef2ff',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  rateButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  }
});

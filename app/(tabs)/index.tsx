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
import GenrePicker, { GenreItem } from "../components/GenrePicker";
import { MovieCard } from "../components/MovieCard";
import { api } from "../service/api";
import { supabase } from "../../supabase";
import { useUserPreference } from "../store/userPreference";
import { Movie } from "../types/movie";
import { testSupabaseConnection } from "../debug/supabaseDebug";

const DEFAULT_GENRES: GenreItem[] = [
  { genre: "Action", describe: "Phim hành động" },
  { genre: "Adventure", describe: "Phim phiêu lưu" },
  { genre: "Animation", describe: "Phim hoạt hình" },
  { genre: "Children's", describe: "Phim thiếu nhi" },
  { genre: "Comedy", describe: "Phim hài" },
  { genre: "Crime", describe: "Phim tội phạm" },
  { genre: "Documentary", describe: "Phim tài liệu" },
  { genre: "Drama", describe: "Phim tâm lý" },
  { genre: "Fantasy", describe: "Phim kỳ ảo" },
  { genre: "Horror", describe: "Phim kinh dị" },
  { genre: "Romance", describe: "Phim tình cảm" },
  { genre: "Sci-Fi", describe: "Phim khoa học viễn tưởng" },
  { genre: "Thriller", describe: "Phim giật gân" },
  { genre: "War", describe: "Phim chiến tranh" },
  { genre: "Western", describe: "Phim miền tây" },
];

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { sessionId, ratings } = useUserPreference();
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [availableGenres, setAvailableGenres] = useState<GenreItem[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [loadingGenreMovies, setLoadingGenreMovies] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [genreError, setGenreError] = useState<string | null>(null);
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
    
    // Run diagnostic test on first load
    console.log("[HOME SCREEN] Component mounted, running Supabase diagnostic...");
    testSupabaseConnection().catch(e => console.error("[HOME SCREEN] Diagnostic failed:", e));
  }, [loadData]);

  useEffect(() => {
    const loadGenres = async () => {
      setLoadingGenres(true);
      setGenreError(null);

      try {
        console.log('[DEBUG] Starting to load genres from Supabase...');

        const { data, error } = await supabase
          .from('genre')
          .select('genre, describe')
          .order('id', { ascending: true });

        console.log('[DEBUG] Supabase response:', { data, error });

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('No genres found in Supabase genre table');
        }

        setAvailableGenres((data as any[]).map((item) => ({ genre: item.genre, describe: item.describe })));
        return;
      } catch (supabaseError) {
        console.warn('[WARN] Supabase genre load failed, falling back to API:', supabaseError);

        try {
          const response = await api.getGenres();
          if (response.genres && response.genres.length > 0) {
            setAvailableGenres(response.genres as GenreItem[]);
          } else {
            console.warn('[WARN] API genres empty, using default.');
            setAvailableGenres(DEFAULT_GENRES);
            setGenreError('Không tìm thấy thể loại từ Supabase/API, dùng danh sách mặc định.');
          }
        } catch (apiError) {
          console.error('[ERROR] Fallback API genres load failed:', apiError);
          setAvailableGenres(DEFAULT_GENRES);
          setGenreError('Không thể tải thể loại từ Supabase và API. Dùng danh sách mặc định.');
        }
      } finally {
        setLoadingGenres(false);
      }
    };

    loadGenres();
  }, []);

  useEffect(() => {
    const loadGenreMovies = async () => {
      if (selectedGenres.length === 0) {
        setGenreMovies([]);
        return;
      }

      setLoadingGenreMovies(true);
      try {
        const results = await Promise.all(
          selectedGenres.map((genre) => api.getMoviesByGenre(genre, 1, 20))
        );

        const movies = results.flatMap((item) => item.movies || []);

        // remove duplicates by movie_id or id
        const uniqueMovies: Record<string, Movie> = {};
        movies.forEach((m) => {
          const key = (m as any).movie_id?.toString() || m.id?.toString() || JSON.stringify(m);
          if (!uniqueMovies[key]) {
            uniqueMovies[key] = m;
          }
        });

        setGenreMovies(Object.values(uniqueMovies));
      } catch (e) {
        console.error('Failed to load genre movies:', e);
        setGenreMovies([]);
      } finally {
        setLoadingGenreMovies(false);
      }
    };

    loadGenreMovies();
  }, [selectedGenres]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const renderSectionHeader = (
    title: string,
    icon: string,
    color: string,
    actionLabel?: string,
    onActionPress?: () => void
  ) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Ionicons name={icon as any} size={22} color={color} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {actionLabel && onActionPress ? (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.seeAllText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
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
        {/* Section 0: Genre filter */}
        <View style={styles.section}>
          {renderSectionHeader(
            "Thể loại",
            "albums",
            "#8E44AD",
            showGenrePicker ? "Ẩn" : "Chọn",
            () => setShowGenrePicker((value) => !value)
          )}

          {showGenrePicker && (
            <>
              {loadingGenres ? (
                <ActivityIndicator style={{ margin: 12 }} color="#8E44AD" />
              ) : (
                <>
                  {genreError ? <Text style={styles.infoText}>{genreError}</Text> : null}
                  <GenrePicker genres={availableGenres} selectedGenres={selectedGenres} onChange={setSelectedGenres} />
                </>
              )}

              {selectedGenres.length === 0 ? (
                <Text style={styles.infoText}>Chọn 1 hoặc nhiều thể loại để xem phim phù hợp.</Text>
              ) : loadingGenreMovies ? (
                <ActivityIndicator style={{ margin: 12 }} color="#8E44AD" />
              ) : genreMovies.length === 0 ? (
                <Text style={styles.infoText}>Không tìm thấy phim cho thể loại đã chọn.</Text>
              ) : (
                <FlatList
                  data={genreMovies}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => <MovieCard movie={item} />}
                  keyExtractor={(item) => `genre-${item.movie_id || item.id}`}
                  contentContainerStyle={styles.horizontalList}
                />
              )}
            </>
          )}
        </View>

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
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    paddingHorizontal: 20,
    marginTop: 8,
  }
});

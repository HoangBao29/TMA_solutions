import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import AdBanner from "../components/AdBanner";
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

export default function HomeScreen() {
  const { sessionId } = useUserPreference();
  const [ratingCount, setRatingCount] = useState(0);
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
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

  const loadData = useCallback(async (isRefresh = false, currentRatingCount = 0) => {
    if (!isRefresh) setLoading(true);
    try {
      // Load sections in parallel
      const promises: Promise<any>[] = [
        api.getPopularMovies(),
      ];

      // Only fetch recommendations if user has enough ratings (require >=5)
      if (currentRatingCount >= 5) {
        promises.push(api.getRecommendations(sessionId, 20));
      }

      const results = await Promise.all(promises);

      setPopular(results[0].results || []);

      if (currentRatingCount >= 5 && results[1]) {
        setRecommended(results[1].recommendations || []);
        setRecMessage(results[1].message || "Dành riêng cho bạn");
      } else {
        setRecommended([]);
      }
    } catch (e) {
      console.error("Failed to load home data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    const bootstrap = async () => {
        // Wait for Supabase client session to be available (auth init)
        const waitForSession = async (tries = 6, delayMs = 250) => {
          for (let i = 0; i < tries; i++) {
            const { data } = await supabase.auth.getSession();
            if (data?.session) return true;
            await new Promise((r) => setTimeout(r, delayMs));
          }
          return false;
        };

        try {
          await waitForSession();
          // Directly fetch persisted ratings to get authoritative count
          const data = await api.getUserRatings(sessionId);
          const count = (data.ratings || []).length;
          setRatingCount(count);
          loadData(false, count);
        } catch (error) {
          console.error('Failed to load persisted user ratings:', error);
          // Fallback: try status endpoint
          try {
            const status = await api.getUserStatus(sessionId);
            const count = typeof status.rating_count === 'number' ? status.rating_count : 0;
            setRatingCount(count);
            loadData(false, count);
          } catch (e) {
            console.error('Fallback status load failed:', e);
            setRatingCount(0);
            loadData(false, 0);
          }
        }
    };

    bootstrap();
    
    // Run diagnostic test on first load
    console.log("[HOME SCREEN] Component mounted, running Supabase diagnostic...");
    testSupabaseConnection().catch(e => console.error("[HOME SCREEN] Diagnostic failed:", e));
  }, [loadData, sessionId]);

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
      // debounce requests to avoid hammering network when user toggles genres quickly
      setLoadingGenreMovies(true);
      try {
        const limitPerGenre = 12;
        const maxGenresToFetch = 3;
        const toFetch = selectedGenres.slice(0, maxGenresToFetch);

        const results = await Promise.all(
          toFetch.map((genre) => api.getMoviesByGenre(genre, 1, limitPerGenre))
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

    const handler = setTimeout(() => loadGenreMovies(), 250);
    return () => clearTimeout(handler);
  }, [selectedGenres]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true, ratingCount);
  };

  const refreshRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.getRecommendations(sessionId, 20);
      if (res && res.recommendations) {
        setRecommended(res.recommendations || []);
        setRecMessage(res.message || "Dành riêng cho bạn");
      }
    } catch (e) {
      console.error('Failed to refresh recommendations:', e);
    } finally {
      setLoading(false);
    }
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
        <TouchableOpacity onPress={onActionPress} style={styles.sectionAction} activeOpacity={0.8}>
          <Text style={styles.seeAllText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderEmptyRecommended = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#18243a', '#0b1220']}
        style={styles.emptyGradient}
      >
        <Ionicons name="sparkles-outline" size={40} color="#F59E0B" />
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
        <ActivityIndicator size="large" color="#F59E0B" />
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
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.heroHeader}>
        <View style={styles.heroContent}>
          <Text style={styles.welcomeText}>Chào bạn!</Text>
          <Text style={styles.heroTitle}>Khám phá các bộ phim hay nào</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshRecommendations}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#B45309" />
            <Text style={styles.refreshButtonText}>Cập nhật gợi ý</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Section 0: Genre filter */}
        <View style={styles.section}>
          {renderSectionHeader(
            "Thể loại",
            "albums",
            "#F59E0B",
            showGenrePicker ? "Ẩn" : "Chọn",
            () => setShowGenrePicker((value) => !value)
          )}

          {showGenrePicker && (
            <>
              {loadingGenres ? (
                <ActivityIndicator style={{ margin: 12 }} color="#F59E0B" />
              ) : (
                <>
                  {genreError ? <Text style={styles.infoText}>{genreError}</Text> : null}
                  <GenrePicker genres={availableGenres} selectedGenres={selectedGenres} onChange={setSelectedGenres} />
                </>
              )}

              {selectedGenres.length === 0 ? (
                <Text style={styles.infoText}>Chọn 1 hoặc nhiều thể loại để xem phim phù hợp.</Text>
              ) : loadingGenreMovies ? (
                <ActivityIndicator style={{ margin: 12 }} color="#F59E0B" />
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
        {ratingCount >= 5 ? (
          <View style={styles.section}>
            {renderSectionHeader(recMessage || "Gợi ý cho bạn", "sparkles", "#F59E0B", "Làm mới", refreshRecommendations)}
            <FlatList
              data={recommended}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <MovieCard movie={item} />}
              keyExtractor={(item) => `rec-${item.movie_id || item.id}`}
              contentContainerStyle={styles.horizontalList}
              ListEmptyComponent={<ActivityIndicator color="#F59E0B" style={{ marginLeft: 20 }} />}
            />
            {ratingCount < 5 && (
              <View style={styles.tipBox}>
                <Ionicons name="information-circle" size={16} color="#F59E0B" />
                <Text style={styles.tipText}>Gợi ý sẽ chính xác hơn khi bạn đạt 5 đánh giá.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {renderSectionHeader("Gợi ý từ AI", "sparkles", "#CBD5E1")}
            {renderEmptyRecommended()}
          </View>
        )}

        <AdBanner />

        {/* Section 2: Popular */}
        <View style={styles.section}>
          {renderSectionHeader("Phim có lượt sao nhiều nhất", "flame", "#F97316")}
          <FlatList
            data={popular}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <MovieCard movie={item} />}
            keyExtractor={(item) => `pop-${item.movie_id || item.id}`}
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
    backgroundColor: "#0B1220",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1220",
  },
  loadingText: {
    marginTop: 12,
    color: "#94A3B8",
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
    color: 'rgba(248,250,252,0.9)',
    fontSize: 18,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  refreshButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    marginLeft: 8,
    color: '#92400E',
    fontWeight: '600',
  },
  content: {
    marginTop: -10,
    backgroundColor: '#0B1220',
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
  sectionAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FEF3C7',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#F8FAFC",
  },
  seeAllText: {
    color: "#92400E",
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
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  rateButton: {
    marginTop: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rateButtonText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#FCD34D',
    marginLeft: 6,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 20,
    marginTop: 8,
  }
});

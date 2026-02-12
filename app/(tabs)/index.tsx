import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GenrePicker from "../components/GenrePicker";
import { MovieCard } from "../components/MovieCard";
import { api } from "../service/api";
import { Movie } from "../types/movie";

import { useUserPreference } from "../store/userPreference";

export default function HomeScreen() {
  // const { onboarded, favoriteGenres, setGenres, setOnboarded, sessionId } = useUserPreference();
  const onboarded = useUserPreference(s => s.onboarded);
  const favoriteGenres = useUserPreference(s => s.favoriteGenres);
  const setGenres = useUserPreference(s => s.setGenres);
  const setOnboarded = useUserPreference(s => s.setOnboarded);
  const sessionId = useUserPreference(s => s.sessionId);

  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationMethod, setRecommendationMethod] = useState("");

  const loadHomeData = async () => {
    console.log('Loading home data for session:', sessionId);
    setLoading(true);
    try {
      const recData = await api.getRecommendations(sessionId);
      console.log('Recommendations loaded:', recData.recommendations?.length || 0);
      if (recData.recommendations) {
        setRecommendations(recData.recommendations);
        setRecommendationMethod(recData.message || recData.method || "");
      }

      const popData = await api.getPopularMovies();
      console.log('Popular movies loaded:', popData.results?.length || 0);
      if (popData.results) {
        setPopular(popData.results);
      }
    } catch (e) {
      console.error('Error loading home data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (onboarded) {
      loadHomeData();
    }
  }, [onboarded]);

  const handleFinishOnboarding = async () => {
    console.log('Finish onboarding button pressed. Favorite genres:', favoriteGenres);
    if (favoriteGenres.length > 0) {
      try {
        await api.savePreferences(sessionId, favoriteGenres);
        setOnboarded(true);
      } catch (e) {
        console.error('Failed to save preferences:', e);
        // Still let them in, but it might not be personalized
        setOnboarded(true);
      }
    } else {
      alert("Vui lòng chọn ít nhất một thể loại!");
    }
  };


  if (!onboarded) {
    return (
      <SafeAreaView style={styles.onboardingContainer}>
        <ScrollView contentContainerStyle={styles.onboardingContent}>
          <Text style={styles.title}>🎬 Chào mừng bạn!</Text>
          <Text style={styles.subtitle}>Bạn thích thể loại phim nào nhất?</Text>
          <GenrePicker selectedGenres={favoriteGenres} onChange={setGenres} />
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleFinishOnboarding}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>Bắt đầu ngay</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleText}>TK Film</Text>
        <TouchableOpacity
          onPress={() => {
            console.log('Resetting session');
            useUserPreference.getState().resetSession();
          }}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10 }}>Đang cá nhân hóa trải nghiệm...</Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {recommendations.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>✨ Gợi ý cho bạn</Text>
                  {recommendationMethod ? (
                    <Text style={styles.methodInfo}>{recommendationMethod}</Text>
                  ) : null}
                  <FlatList
                    data={recommendations}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => <MovieCard movie={item} />}
                    keyExtractor={(item) => `rec-${item.movie_id || item.id}`}
                  />
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Phim phổ biến</Text>
                <FlatList
                  data={popular}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => <MovieCard movie={item} />}
                  keyExtractor={(item) => `pop-${item.id || item.movie_id}`}
                />
              </View>
            </>
          }
          refreshing={loading}
          onRefresh={loadHomeData}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  onboardingContent: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  mainButton: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 50,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 4,
    color: '#333',
  },
  methodInfo: {
    fontSize: 12,
    color: '#888',
    marginLeft: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  }
});
// import { Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Hello Expo</Text>
//     </View>
//   );
// }

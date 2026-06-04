import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View, Text, TouchableOpacity, FlatList, Alert, ScrollView, TextInput, Modal, Pressable, KeyboardAvoidingView } from 'react-native';
import { supabase } from '../supabase';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACKEND_URL } from './service/api';
import adminStyles from './styles/admin.styles';
import { Ionicons } from '@expo/vector-icons';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'movies' | 'genres' | 'profiles'>('menu');

  // Movie management state
  const [movies, setMovies] = useState<any[]>([]);
  const [movieModalVisible, setMovieModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    release_date: '',
    genres: [] as string[],
    description: '',
    tmdb_id: '',
    imdb_url: ''
  });

  // Genre management state
  const [genres, setGenres] = useState<any[]>([]);
  const [genreModalVisible, setGenreModalVisible] = useState(false);
  const [editingGenre, setEditingGenre] = useState<any>(null);
  const [genreForm, setGenreForm] = useState({
    genre: '',
    describe: ''
  });

  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Search/filter state
  const [searchMovie, setSearchMovie] = useState('');
  const [searchGenre, setSearchGenre] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [showGenrePicker, setShowGenrePicker] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    loadGenres();
  }, []);

  useEffect(() => {
    if (activeTab === 'movies') {
      loadMovies();
    } else if (activeTab === 'genres') {
      loadGenres();
    } else if (activeTab === 'profiles') {
      loadProfiles();
    }
  }, [activeTab]);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/log-in');
      return;
    }

    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      Alert.alert('Truy cập bị từ chối', 'Bạn không có quyền truy cập trang admin.');
      router.replace('/');
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  // Movie management functions
  const loadMovies = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/movies?include_hidden=true`);
      console.log('[Admin] Load movies status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('[Admin] Error response:', text);
        Alert.alert('Lỗi', `HTTP ${response.status}: Không thể tải danh sách phim`);
        return;
      }

      const data = await response.json();
      setMovies(data.movies || []);
    } catch (error) {
      console.error('[Admin] Load movies error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phim');
    }
  };

  const saveMovie = async () => {
    try {
      const movieData = {
        ...movieForm,
        tmdb_id: movieForm.tmdb_id ? parseInt(movieForm.tmdb_id) : null,
        genres: movieForm.genres.filter(g => g.trim() !== '')
      };

      let response;
      if (editingMovie) {
        // Update
        response = await fetch(`${BACKEND_URL}/api/admin/movie/${editingMovie.movie_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movieData)
        });
      } else {
        // Add new
        response = await fetch(`${BACKEND_URL}/api/admin/movie`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movieData)
        });
      }

      console.log('[Admin] Save movie status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('[Admin] Error response:', text);
        Alert.alert('Lỗi', `HTTP ${response.status}: Lỗi khi lưu phim`);
        return;
      }

      const result = await response.json();
      Alert.alert('Thành công', editingMovie ? 'Đã cập nhật phim' : 'Đã thêm phim mới');
      setMovieModalVisible(false);
      resetMovieForm();
      loadMovies();
    } catch (error) {
      console.error('[Admin] Save movie error:', error);
      Alert.alert('Lỗi', 'Không thể lưu phim');
    }
  };

  const deleteMovie = async (movie: any) => {
    const isHidden = movie.is_hidden;
    const actionText = isHidden ? 'Hiện' : 'Ẩn';
    const actionMessage = isHidden ? 'Bạn có muốn hiện phim này?' : 'Bạn có muốn ẩn phim này?';

    Alert.alert(
      'Xác nhận',
      `"${movie.title}" - ${actionMessage}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: actionText,
          style: isHidden ? 'default' : 'destructive',
          onPress: async () => {
            try {
              let response;
              if (isHidden) {
                // Hiện phim: sử dụng PUT để cập nhật is_hidden = false
                response = await fetch(`${BACKEND_URL}/api/admin/movie/${movie.movie_id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ is_hidden: false })
                });
              } else {
                // Ẩn phim: sử dụng DELETE
                response = await fetch(`${BACKEND_URL}/api/admin/movie/${movie.movie_id}`, {
                  method: 'DELETE'
                });
              }

              console.log('[Admin] Toggle movie visibility status:', response.status);

              if (!response.ok) {
                const text = await response.text();
                console.error('[Admin] Error response:', text);
                Alert.alert('Lỗi', `HTTP ${response.status}: Không thể thay đổi trạng thái phim`);
                return;
              }

              Alert.alert('Thành công', isHidden ? 'Đã hiện phim' : 'Đã ẩn phim');
              loadMovies();
            } catch (error) {
              console.error('[Admin] Toggle visibility error:', error);
              Alert.alert('Lỗi', 'Lỗi kết nối');
            }
          }
        }
      ]
    );
  };

  const deleteGenre = async (genre: any) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có muốn xoá thể loại "${genre.genre}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('genre')
                .delete()
                .eq('genre', genre.genre);

              if (error) {
                throw error;
              }

              Alert.alert('Thành công', 'Đã xoá thể loại');
              setSelectedGenre(null);
              loadGenres();
            } catch (error: any) {
              console.error(error);
              Alert.alert('Lỗi', error.message || 'Không thể xoá thể loại');
            }
          }
        }
      ]
    );
  };

  const loadGenres = async () => {
    try {
      const { data, error } = await supabase
        .from('genre')
        .select('genre, describe')
        .order('genre', { ascending: true });

      if (error) {
        console.error('[Admin] Load genres error:', error);
        throw error;
      }

      console.log('[Admin] Genres loaded:', data?.length);
      setGenres(data || []);
      // Lưu danh sách genre có sẵn để dùng cho picker
      setAvailableGenres((data || []).map(g => g.genre));
    } catch (error: any) {
      console.error('[Admin] Supabase error:', error);
      Alert.alert('Lỗi', `Không thể tải danh sách thể loại: ${error.message}`);
    }
  };

  const saveGenre = async () => {
    try {
      if (!genreForm.genre.trim()) {
        Alert.alert('Lỗi', 'Tên thể loại không được để trống');
        return;
      }

      let response;
      if (editingGenre) {
        response = await supabase
          .from('genre')
          .update({ describe: genreForm.describe })
          .eq('genre', editingGenre.genre);
      } else {
        response = await supabase
          .from('genre')
          .insert([{ genre: genreForm.genre.trim(), describe: genreForm.describe.trim() }]);
      }

      if (response.error) {
        console.error('[Admin] Save genre error:', response.error);
        throw response.error;
      }

      Alert.alert('Thành công', editingGenre ? 'Đã cập nhật thể loại' : 'Đã thêm thể loại mới');
      setGenreModalVisible(false);
      resetGenreForm();
      setSelectedGenre(null);
      loadGenres();
    } catch (error: any) {
      console.error('[Admin] Supabase error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu thể loại');
    }
  };

  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      release_date: '',
      genres: [],
      description: '',
      tmdb_id: '',
      imdb_url: ''
    });
    setEditingMovie(null);
  };

  const resetGenreForm = () => {
    setGenreForm({
      genre: '',
      describe: ''
    });
    setEditingGenre(null);
  };

  const openGenreModal = (genre?: any) => {
    if (genre) {
      setEditingGenre(genre);
      setGenreForm({
        genre: genre.genre || '',
        describe: genre.describe || ''
      });
    } else {
      resetGenreForm();
    }
    setGenreModalVisible(true);
  };

  const openMovieModal = (movie?: any) => {
    if (movie) {
      setEditingMovie(movie);
      setMovieForm({
        title: movie.title || '',
        release_date: movie.release_date || '',
        genres: movie.genres || [],
        description: movie.description || '',
        tmdb_id: movie.tmdb_id?.toString() || '',
        imdb_url: movie.imdb_url || ''
      });
    } else {
      resetMovieForm();
    }
    setMovieModalVisible(true);
  };

  if (loading) {
    return (
      <View style={adminStyles.center}>
        <Text>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  const adminFunctions = [
    { id: 'movies', title: 'Quản lý Phim', description: 'Thêm, sửa, cập nhật, ẩn phim' },
    { id: 'genres', title: 'Quản lý Thể Loại', description: 'Thêm, sửa, xoá thể loại và mô tả' },
    { id: 'profiles', title: 'Quản lý Người Dùng', description: 'Xem danh sách profile và khoá tài khoản' },
  ];

  const handleFunctionPress = (id: string) => {
    setActiveTab(id as any);
    if (id === 'movies') {
      loadMovies();
    }
    if (id === 'genres') {
      loadGenres();
    }
    if (id === 'profiles') {
      loadProfiles();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[Admin] Logout error:', error);
    } finally {
      router.replace('/log-in');
    }
  };

  const loadProfiles = async () => {
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profile')
        .select('id, email, gender, phone, banned')
        .neq('role', 'admin')  // Không hiện admin
        .order('email', { ascending: true });

      if (error) {
        throw error;
      }
      setProfiles(data || []);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('[Admin] Load profiles error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách người dùng');
    } finally {
      setProfileLoading(false);
    }
  };

  const toggleUserBan = async (user: any) => {
    const newBannedStatus = !user.banned;
    const actionText = newBannedStatus ? 'khoá' : 'mở khoá';

    Alert.alert(
      'Xác nhận',
      `Bạn có muốn ${actionText} tài khoản "${user.email || user.id}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: newBannedStatus ? 'Khoá' : 'Mở khoá',
          style: newBannedStatus ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('profile')
                .update({ banned: newBannedStatus })
                .eq('id', user.id);

              if (error) {
                throw error;
              }

              Alert.alert('Thành công', `Đã ${actionText} tài khoản`);
              loadProfiles();
            } catch (error: any) {
              console.error('[Admin] Toggle ban error:', error);
              Alert.alert('Lỗi', error.message || `Không thể ${actionText} tài khoản`);
            }
          }
        }
      ]
    );
  };

  const renderMenu = () => (
    <FlatList
      style={adminStyles.container}
      data={adminFunctions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={adminStyles.functionCard} onPress={() => handleFunctionPress(item.id)}>
          <Text style={adminStyles.functionTitle}>{item.title}</Text>
          <Text style={adminStyles.functionDescription}>{item.description}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={adminStyles.listContainer}
      ListHeaderComponent={
        <>
          <Text style={adminStyles.title}>Trang Quản Trị Admin</Text>
          <Text style={adminStyles.subtitle}>Chào mừng, {user?.email}</Text>
        </>
      }
      ListFooterComponent={
        <TouchableOpacity style={adminStyles.logoutButton} onPress={handleLogout}>
          <Text style={adminStyles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      }
    />
  );

  const renderMovies = () => {
    const filteredMovies = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchMovie.toLowerCase()) ||
      movie.genres?.some((g: string) => g.toLowerCase().includes(searchMovie.toLowerCase()))
    );

    return (
      <FlatList
        style={adminStyles.container}
        data={filteredMovies}
        keyExtractor={(item) => item.movie_id.toString()}
        renderItem={({ item }) => (
          <View style={adminStyles.movieCard}>
            <View style={adminStyles.movieInfo}>
              <Text style={adminStyles.movieTitle}>{item.title}</Text>
              <Text style={adminStyles.movieMeta}>
                ID: {item.movie_id} | {item.release_date} | Thể loại: {item.genres?.join(', ') || 'N/A'}
              </Text>
              {item.is_hidden && <Text style={adminStyles.hiddenText}>ĐÃ ẨN</Text>}
            </View>
            <View style={adminStyles.movieActions}>
              <TouchableOpacity style={adminStyles.editButton} onPress={() => openMovieModal(item)}>
                <Text style={adminStyles.editText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[adminStyles.deleteButton, item.is_hidden && adminStyles.unbanButton]}
                onPress={() => deleteMovie(item)}
              >
                <Text style={adminStyles.deleteText}>{item.is_hidden ? 'Hiện' : 'Ẩn'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={adminStyles.listContainer}
        ListHeaderComponent={
          <View>
            <View style={adminStyles.header}>
              <TouchableOpacity style={adminStyles.backButton} onPress={() => setActiveTab('menu')}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={adminStyles.headerTitle} numberOfLines={1}>Quản lý Phim</Text>
              <TouchableOpacity style={adminStyles.addButton} onPress={() => openMovieModal()}>
                <Text style={adminStyles.addText}>+ Thêm phim</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={adminStyles.searchInput}
              placeholder="🔍 Tìm kiếm phim..."
              value={searchMovie}
              onChangeText={setSearchMovie}
              placeholderTextColor="#999"
            />
          </View>
        }
      />
    );
  };

  const renderMovieModal = () => (
    <Modal visible={movieModalVisible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            style={adminStyles.modalContainer}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
        <View style={adminStyles.modalHeader}>
          <TouchableOpacity onPress={() => setMovieModalVisible(false)}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={adminStyles.modalTitle}>{editingMovie ? 'Sửa phim' : 'Thêm phim mới'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <TextInput
          style={adminStyles.input}
          placeholder="Tên phim"
          value={movieForm.title}
          onChangeText={(text) => setMovieForm({ ...movieForm, title: text })}
        />

        <TextInput
          style={adminStyles.input}
          placeholder="Ngày phát hành (VD: 01-Jan-2023)"
          value={movieForm.release_date}
          onChangeText={(text) => setMovieForm({ ...movieForm, release_date: text })}
        />

        <Text style={adminStyles.genreLabel}>Chọn thể loại:</Text>
        <View style={adminStyles.genrePickerContainer}>
          {availableGenres.length > 0 ? (
            <FlatList
              data={availableGenres}
              scrollEnabled={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    adminStyles.genreTag,
                    movieForm.genres.includes(item) && adminStyles.genreTagSelected
                  ]}
                  onPress={() => {
                    if (movieForm.genres.includes(item)) {
                      setMovieForm({
                        ...movieForm,
                        genres: movieForm.genres.filter(g => g !== item)
                      });
                    } else {
                      setMovieForm({
                        ...movieForm,
                        genres: [...movieForm.genres, item]
                      });
                    }
                  }}
                >
                  <Text
                    style={[
                      adminStyles.genreTagText,
                      movieForm.genres.includes(item) && adminStyles.genreTagTextSelected
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              numColumns={2}
            />
          ) : (
            <Text style={adminStyles.noGenreText}>Không có thể loại nào</Text>
          )}
        </View>

        <TextInput
          style={[adminStyles.input, adminStyles.textArea]}
          placeholder="Mô tả phim"
          value={movieForm.description}
          onChangeText={(text) => setMovieForm({ ...movieForm, description: text })}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={adminStyles.input}
          placeholder="TMDB ID (tùy chọn)"
          value={movieForm.tmdb_id}
          onChangeText={(text) => setMovieForm({ ...movieForm, tmdb_id: text })}
          keyboardType="numeric"
        />

        <TextInput
          style={adminStyles.input}
          placeholder="IMDb URL (tùy chọn)"
          value={movieForm.imdb_url}
          onChangeText={(text) => setMovieForm({ ...movieForm, imdb_url: text })}
        />

        <View style={adminStyles.modalButtons}>
          <TouchableOpacity style={adminStyles.cancelButton} onPress={() => setMovieModalVisible(false)}>
            <Text style={adminStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.saveButton} onPress={saveMovie}>
            <Text style={adminStyles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  const renderGenres = () => {
    const filteredGenres = genres.filter(genre =>
      genre.genre.toLowerCase().includes(searchGenre.toLowerCase()) ||
      (genre.describe && genre.describe.toLowerCase().includes(searchGenre.toLowerCase()))
    );

    return (
      <FlatList
        style={adminStyles.container}
        data={filteredGenres}
        keyExtractor={(item) => item.genre}
        renderItem={({ item }) => {
          const isSelected = selectedGenre === item.genre;
          return (
            <TouchableOpacity
              style={[adminStyles.genreCard, isSelected && adminStyles.selectedGenreCard]}
              onPress={() => setSelectedGenre(isSelected ? null : item.genre)}
            >
              <View style={adminStyles.movieInfo}>
                <Text style={adminStyles.movieTitle}>{item.genre}</Text>
                <Text style={adminStyles.movieMeta}>{item.describe || 'Không có mô tả'}</Text>
              </View>
              {isSelected && (
                <View style={adminStyles.genreActions}>
                  <TouchableOpacity style={adminStyles.editButton} onPress={() => openGenreModal(item)}>
                    <Text style={adminStyles.editText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={adminStyles.deleteButton} onPress={() => deleteGenre(item)}>
                    <Text style={adminStyles.deleteText}>Xoá</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={adminStyles.listContainer}
        ListHeaderComponent={
          <View>
            <View style={adminStyles.header}>
              <TouchableOpacity style={adminStyles.backButton} onPress={() => setActiveTab('menu')}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={adminStyles.headerTitle} numberOfLines={1}>Quản lý Thể Loại</Text>
              <TouchableOpacity style={adminStyles.addButton} onPress={() => {
                setSelectedGenre(null);
                openGenreModal();
              }}>
                <Text style={adminStyles.addText}>+ Thêm thể loại</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={adminStyles.searchInput}
              placeholder="🔍 Tìm kiếm thể loại..."
              value={searchGenre}
              onChangeText={setSearchGenre}
              placeholderTextColor="#999"
            />
          </View>
        }
      />
    );
  };

  const renderGenreModal = () => (
    <Modal visible={genreModalVisible} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            style={adminStyles.modalContainer}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
        <View style={adminStyles.modalHeader}>
          <TouchableOpacity onPress={() => setGenreModalVisible(false)}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={adminStyles.modalTitle}>{editingGenre ? 'Sửa thể loại' : 'Thêm thể loại mới'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <TextInput
          style={adminStyles.input}
          placeholder="Tên thể loại"
          value={genreForm.genre}
          onChangeText={(text) => setGenreForm({ ...genreForm, genre: text })}
          editable={!editingGenre}
        />

        <TextInput
          style={[adminStyles.input, adminStyles.textArea]}
          placeholder="Mô tả thể loại"
          value={genreForm.describe}
          onChangeText={(text) => setGenreForm({ ...genreForm, describe: text })}
          multiline
          numberOfLines={4}
        />

        <View style={adminStyles.modalButtons}>
          <TouchableOpacity style={adminStyles.cancelButton} onPress={() => setGenreModalVisible(false)}>
            <Text style={adminStyles.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={adminStyles.saveButton} onPress={saveGenre}>
            <Text style={adminStyles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  const renderProfiles = () => {
    const filteredProfiles = profiles.filter(profile =>
      profile.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
      profile.id?.toLowerCase().includes(searchUser.toLowerCase())
    );

    return (
      <View style={adminStyles.container}>
        <View style={adminStyles.header}>
          <TouchableOpacity style={adminStyles.backButton} onPress={() => setActiveTab('menu')}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={adminStyles.headerTitle} numberOfLines={1}>Quản lý Người Dùng</Text>
          <TouchableOpacity style={adminStyles.addButton} onPress={loadProfiles}>
            <Text style={adminStyles.addText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={adminStyles.searchInput}
          placeholder="🔍 Tìm kiếm người dùng..."
          value={searchUser}
          onChangeText={setSearchUser}
          placeholderTextColor="#999"
        />
        {profileLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredProfiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedUser === item.id;
              return (
                <Pressable
                  style={[adminStyles.profileCard, isSelected && adminStyles.selectedGenreCard]}
                  onPress={() => setSelectedUser(isSelected ? null : item.id)}
                >
                  <View style={adminStyles.movieInfo}>
                    <Text style={adminStyles.movieTitle}>{item.email || item.id}</Text>
                    <Text style={adminStyles.movieMeta}>
                      Trạng thái: {item.banned ? 'Bị khoá' : 'Bình thường'}
                    </Text>
                    {isSelected && (
                      <>
                        <Text style={adminStyles.profileDetailText}>Email: {item.email || 'Không có'}</Text>
                        <Text style={adminStyles.profileDetailText}>Trạng thái: {item.banned ? 'Bị khoá' : 'Bình thường'}</Text>
                        <Text style={adminStyles.profileDetailText}>Giới tính: {item.gender || 'Chưa có'}</Text>
                        <Text style={adminStyles.profileDetailText}>Phone: {item.phone || 'Chưa có'}</Text>
                      </>
                    )}
                  </View>
                  {isSelected && (
                    <TouchableOpacity
                      style={[adminStyles.banButton, item.banned && adminStyles.unbanButton]}
                      onPress={() => toggleUserBan(item)}
                    >
                      <Text style={adminStyles.banText}>
                        {item.banned ? 'Mở' : 'Khóa'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </Pressable>
              );
            }}
            contentContainerStyle={adminStyles.listContainer}
            ListEmptyComponent={() => (
              <View style={adminStyles.center}>
                <Text>Không có người dùng nào hoặc chưa tải dữ liệu.</Text>
              </View>
            )}
          />
        )}
      </View>
    );
  };

  return (
    <View style={adminStyles.container}>
      {activeTab === 'menu' && renderMenu()}
      {activeTab === 'movies' && renderMovies()}
      {activeTab === 'genres' && renderGenres()}
      {activeTab === 'profiles' && renderProfiles()}
      {renderMovieModal()}
      {renderGenreModal()}
    </View>
  );
}
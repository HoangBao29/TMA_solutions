import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { router } from 'expo-router';

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Lỗi đăng nhập', error.message);
      setLoading(false);
      return;
    }

    // Nếu chưa có profile (ví dụ lần đầu login), tạo mới
    if (data?.user?.id) {
      const { data: existing, error: selectError } = await supabase
        .from('profile')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existing) {
        // Kiểm tra xem có thông tin pending profile data trong AsyncStorage không
        try {
          const pendingData = await AsyncStorage.getItem('pendingProfileData');
          let profileData: any = { id: data.user.id, email, is_locked: false };

          if (pendingData) {
            const parsed = JSON.parse(pendingData);
            // Kiểm tra xem userId có matching không
            if (parsed.userId === data.user.id) {
              profileData = {
                id: data.user.id,
                name: parsed.name,
                phone: parsed.phone,
                gender: parsed.gender,
                job: parsed.job,
                email: parsed.email,
                role: parsed.role ?? 'user',
                banned: parsed.banned ?? false,
                is_locked: parsed.is_locked ?? false,
              };
            }
          }

          const { error: profileError } = await supabase
            .from('profile')
            .insert([profileData]);

          if (profileError) {
            console.error('Lỗi tạo hồ sơ:', profileError);
          } else if (pendingData) {
            // Xóa pending data sau khi tạo profile thành công
            await AsyncStorage.removeItem('pendingProfileData');
          }
        } catch (err) {
          console.error('Lỗi khi xử lý profile:', err);
        }
      }
    }

    let destination: string = '/(tabs)';

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('role, banned, is_locked')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Lỗi lấy role profile:', profileError);
        Alert.alert('Lỗi', 'Không thể kiểm tra thông tin tài khoản');
        setLoading(false);
        return;
      }

      // Kiểm tra tài khoản có bị khoá không
      if (profile?.banned) {
        Alert.alert('Tài khoản bị khoá', 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ quản trị viên.');
        setLoading(false);
        return;
      }

      if (profile?.role === 'admin') {
        destination = '/admin';
      } else if (profile?.is_locked === false) {
        destination = '/onboarding';
      } else {
        destination = '/(tabs)';
      }
    } catch (err) {
      console.error('Lỗi kiểm tra role:', err);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi kiểm tra tài khoản');
      setLoading(false);
      return;
    }

    Alert.alert('Thành công', 'Đăng nhập thành công');
    router.replace(destination as any);
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', padding: 20 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Ionicons name="log-in" size={80} color="#fff" />
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 10 }}>
            Đăng nhập
          </Text>
          <Text style={{ fontSize: 16, color: '#e0e0e0', textAlign: 'center', marginTop: 5 }}>
            Chào mừng trở lại với TK Film
          </Text>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="mail" size={24} color="#666" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#ddd'
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
            <Ionicons name="lock-closed" size={24} color="#666" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#ddd'
              }}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleLogIn}
            disabled={loading}
            style={{ marginBottom: 15 }}
          >
            <LinearGradient
              colors={loading ? ['#ccc', '#bbb'] : ['#2196F3', '#1976D2']}
              style={{
                paddingVertical: 15,
                borderRadius: 25,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/sign-up')}
          style={{ alignItems: 'center', marginTop: 20 }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>
            Chưa có tài khoản? <Text style={{ fontWeight: 'bold' }}>Đăng ký</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
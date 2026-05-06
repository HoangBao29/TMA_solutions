import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { router } from 'expo-router';

export default function SignUp() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (!name.trim() || !phone.trim() || !gender.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin (tên, số điện thoại, giới tính).');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Lỗi đăng ký', error.message);
      setLoading(false);
      return;
    }

    // Lưu ý: nếu Supabase yêu cầu xác thực email, signUp sẽ trả về user nhưng không có session.
    // Khi không có session, RLS sẽ chặn việc insert vào bảng profile.
    if (data?.session && data.user?.id) {
      const { error: profileError } = await supabase
        .from('profile')
        .insert([{ id: data.user.id, name, phone, gender, email, role: 'user', banned: false }]);

      if (profileError) {
        console.error('Lỗi tạo hồ sơ:', profileError);
        Alert.alert('Lỗi', 'Không thể tạo hồ sơ người dùng. Vui lòng thử lại sau.');
        setLoading(false);
        return;
      }

      Alert.alert('Thành công', 'Đăng ký thành công!');
      router.replace('/onboarding');
      setLoading(false);
      return;
    }

    // Nếu không có session (cần xác nhận email), lưu thông tin vào AsyncStorage
    // để tạo profile khi user login lần đầu tiên
    if (data?.user?.id) {
      try {
        await AsyncStorage.setItem(
          'pendingProfileData',
          JSON.stringify({ userId: data.user.id, name, phone, gender, email, role: 'user', banned: false })
        );
      } catch (err) {
        console.error('Lỗi lưu thông tin:', err);
      }
    }

    // Nếu không có session (cần xác nhận email), chỉ nhắc người dùng kiểm tra email
    Alert.alert('Thành công', 'Vui lòng kiểm tra email để xác nhận tài khoản và đăng nhập.');
    router.replace('/log-in');
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
          <Ionicons name="person-add" size={80} color="#fff" />
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 10 }}>
            Đăng ký
          </Text>
          <Text style={{ fontSize: 16, color: '#e0e0e0', textAlign: 'center', marginTop: 5 }}>
            Tạo tài khoản để bắt đầu trải nghiệm
          </Text>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="person" size={24} color="#666" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Họ & tên"
              value={name}
              onChangeText={setName}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#ddd'
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="call" size={24} color="#666" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#ddd'
              }}
              keyboardType="phone-pad"
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: '#666', marginBottom: 6, fontSize: 14 }}>Giới tính</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#fff',
              }}
            >
              <Picker
                selectedValue={gender}
                onValueChange={(value) => setGender(value)}
                style={{ height: 50 }}
              >
                <Picker.Item label="Chọn giới tính" value="" />
                <Picker.Item label="Nam" value="male" />
                <Picker.Item label="Nữ" value="female" />
                <Picker.Item label="Khác" value="other" />
              </Picker>
            </View>
          </View>

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

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
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

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
            <Ionicons name="lock-closed" size={24} color="#666" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
            onPress={handleSignUp}
            disabled={loading}
            style={{ marginBottom: 15 }}
          >
            <LinearGradient
              colors={loading ? ['#ccc', '#bbb'] : ['#4CAF50', '#45a049']}
              style={{
                paddingVertical: 15,
                borderRadius: 25,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/log-in')}
          style={{ alignItems: 'center', marginTop: 20 }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>
            Đã có tài khoản? <Text style={{ fontWeight: 'bold' }}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
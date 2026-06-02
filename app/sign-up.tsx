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
  const [job, setJob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (!name.trim() || !phone.trim() || !gender.trim() || !job.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin (tên, số điện thoại, giới tính, nghề nghiệp).');
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
        .insert([{ id: data.user.id, name, phone, gender, job, email, role: 'user', banned: false, is_locked: false }]);

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
          JSON.stringify({ userId: data.user.id, name, phone, gender, job, email, role: 'user', banned: false, is_locked: false })
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
      colors={['#000000', '#1a0d0d', '#08080a']}
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

        <View style={{ backgroundColor: 'rgba(30, 30, 30, 0.85)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="person" size={24} color="#aaa" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Họ & tên"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#444',
                color: '#fff'
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="call" size={24} color="#aaa" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Số điện thoại"
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#444',
                color: '#fff'
              }}
              keyboardType="phone-pad"
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: '#aaa', marginBottom: 6, fontSize: 14 }}>Giới tính</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#444',
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#222',
              }}
            >
              <Picker
                selectedValue={gender}
                onValueChange={(value) => setGender(value)}
                style={{ height: 50, color: '#fff' }}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Chọn giới tính" value="" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Nam" value="male" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Nữ" value="female" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Khác" value="other" style={{ backgroundColor: '#222', color: '#fff' }} />
              </Picker>
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ color: '#aaa', marginBottom: 6, fontSize: 14 }}>Nghề nghiệp</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#444',
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: '#222',
              }}
            >
              <Picker
                selectedValue={job}
                onValueChange={(value) => setJob(value)}
                style={{ height: 50, color: '#fff' }}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Chọn nghề nghiệp" value="" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Quản trị viên (administrator)" value="administrator" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Nghệ sĩ (artist)" value="artist" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Bác sĩ (doctor)" value="doctor" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Giáo viên (educator)" value="educator" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Kỹ sư (engineer)" value="engineer" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Giải trí (entertainment)" value="entertainment" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Giám đốc điều hành (executive)" value="executive" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Chăm sóc sức khỏe (healthcare)" value="healthcare" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Nội trợ (homemaker)" value="homemaker" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Luật sư (lawyer)" value="lawyer" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Thủ thư (librarian)" value="librarian" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Marketing (marketing)" value="marketing" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Không có (none)" value="none" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Khác (other)" value="other" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Lập trình viên (programmer)" value="programmer" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Nghỉ hưu (retired)" value="retired" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Nhân viên bán hàng (salesman)" value="salesman" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Nhà khoa học (scientist)" value="scientist" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Sinh viên (student)" value="student" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Kỹ thuật viên (technician)" value="technician" style={{ backgroundColor: '#222', color: '#fff' }} />
                <Picker.Item label="Nhà văn (writer)" value="writer" style={{ backgroundColor: '#222', color: '#fff' }} />
              </Picker>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="mail" size={24} color="#aaa" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#444',
                color: '#fff'
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <Ionicons name="lock-closed" size={24} color="#aaa" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Mật khẩu"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#444',
                color: '#fff'
              }}
              secureTextEntry
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
            <Ionicons name="lock-closed" size={24} color="#aaa" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#444',
                color: '#fff'
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
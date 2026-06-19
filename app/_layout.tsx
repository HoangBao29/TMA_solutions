import { useEffect } from 'react';
import { Stack } from "expo-router";
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';

LogBox.ignoreAllLogs();

export default function RootLayout() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob initialization complete:', adapterStatuses);
      })
      .catch(error => {
        console.error('AdMob initialization error:', error);
      });
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="movie/[id]" options={{ headerShown: false, title: 'Chi tiết phim' }} />
          <Stack.Screen name="sign-up" options={{ headerShown: true, title: 'Đăng ký', headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }} />
          <Stack.Screen name="log-in" options={{ headerShown: true, title: 'Đăng nhập', headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }} />
          <Stack.Screen name="admin" options={{ headerShown: true, title: 'Admin', headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

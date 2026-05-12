import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="movie/[id]" options={{ headerShown: true, title: 'Chi tiết phim' }} />
        <Stack.Screen name="sign-up" options={{ headerShown: true, title: 'Đăng ký' }} />
        <Stack.Screen name="log-in" options={{ headerShown: true, title: 'Đăng nhập' }} />
        <Stack.Screen name="admin" options={{ headerShown: true, title: 'Admin' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../supabase';

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Kiểm tra session Supabase trước
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.replace('/log-in' as any);
                    return;
                }

                // Giả lập delay một chút cho đẹp splash
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Luôn đi onboarding sau đăng nhập
                router.replace('/onboarding');
            } catch (error) {
                console.error('Splash check failed:', error);
                // Fallback mặc định
                router.replace('/log-in' as any);
            }
        };

        checkStatus();
    }, []);

    return (
        <LinearGradient
            colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
            style={styles.container}
        >
            <View style={styles.logoContainer}>
                <View style={styles.iconCircle}>
                    <Text style={styles.logoIcon}>🎬</Text>
                </View>
                <Text style={styles.title}>TK FILM</Text>
                <Text style={styles.subtitle}>Gợi ý phim thông minh</Text>
            </View>

            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Đang kiểm tra trạng thái...</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 80,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    logoIcon: {
        fontSize: 50,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
        fontWeight: '500',
    },
    loaderContainer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 15,
        fontSize: 14,
        opacity: 0.8,
    }
});

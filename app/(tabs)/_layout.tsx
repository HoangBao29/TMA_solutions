import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF', headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Gợi ý',
                    tabBarIcon: ({ color }) => <Ionicons name="sparkles" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}

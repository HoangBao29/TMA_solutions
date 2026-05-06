import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            headerShown: false,
            tabBarStyle: {
                borderTopWidth: 1,
                borderTopColor: '#eee',
                height: 60,
                paddingBottom: 10,
            }
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Khám phá',
                    tabBarIcon: ({ color }) => <Ionicons name="compass" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Tìm kiếm',
                    tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Cá nhân',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}

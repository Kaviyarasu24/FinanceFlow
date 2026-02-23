import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeLayout() {
    const { user, loading } = useAuth();
    const insets = useSafeAreaInsets();

    // Show loading indicator while checking auth state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Redirect to sign-in if not authenticated
    if (!user) {
        return <Redirect href="/sign-in" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.text.light,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        bottom: 0,
                        paddingBottom: insets.bottom,
                        height: 64 + insets.bottom,
                    },
                ],
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Transactions',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: '',
                    tabBarIcon: ({ color }) => (
                        <View style={styles.addButton}>
                            <Ionicons name="add" size={28} color={Colors.white} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
                    ),
                }}
            />
            {/* Hidden screens - accessible only through Profile */}
            <Tabs.Screen
                name="personal-info"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="app-settings"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="privacy-security"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="custom-categories"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="help-center"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
    },
    tabBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 0,
        height: 64,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 6,
        borderTopWidth: 0,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

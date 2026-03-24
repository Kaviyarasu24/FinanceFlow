import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut, user } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!error && data) {
            setProfile(data);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Refresh profile when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [fetchProfile])
    );

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/sign-in');
                        } catch {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Profile Info */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>

                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={34} color={Colors.white} />
                        </View>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile?.full_name || user?.email?.split('@')[0] || 'User'}</Text>
                        <Text style={styles.profileEmail}>{profile?.email || user?.email || 'No email'}</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(home)/personal-info')}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(home)/personal-info')}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="person-outline" size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.menuItemText}>Personal Info</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                    </TouchableOpacity>

                    <View style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
                            </View>
                            <Text style={styles.menuItemText}>Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PREFERENCES</Text>

                    <View style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
                                <Ionicons name="moon-outline" size={20} color={Colors.text.secondary} />
                            </View>
                            <Text style={styles.menuItemText}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(home)/app-settings')}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#E0E7FF' }]}>
                                <Ionicons name="settings-outline" size={20} color="#6366F1" />
                            </View>
                            <Text style={styles.menuItemText}>App Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(home)/custom-categories')}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#F3E8FF' }]}>
                                <Ionicons name="pricetags-outline" size={20} color="#A855F7" />
                            </View>
                            <Text style={styles.menuItemText}>Custom Categories</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUPPORT</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(home)/privacy-security')}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#EF4444" />
                            </View>
                            <Text style={styles.menuItemText}>Privacy & Security</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(home)/help-center')}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="help-circle-outline" size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.menuItemText}>Help Center</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.appVersion}>FinanceFlow v1.0.0</Text>

                {/* Bottom spacing for tab bar */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: 12,
    },
    profileCard: {
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 10,
    },
    avatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 10,
    },
    profileName: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 12,
        color: Colors.white,
        opacity: 0.9,
    },
    editButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 16,
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 12,
        marginBottom: 6,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    menuIcon: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 12,
        marginTop: 4,
        marginBottom: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
    },
    appVersion: {
        fontSize: 12,
        color: Colors.text.light,
        textAlign: 'center',
        marginBottom: 10,
    },
    bottomSpacing: {
        height: 140,
    },
});

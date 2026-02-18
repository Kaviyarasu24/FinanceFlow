import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    // Refresh profile when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchProfile();
        }, [user])
    );

    const fetchProfile = async () => {
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
    };

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
                        } catch (error) {
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
                            <Ionicons name="person" size={40} color={Colors.white} />
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
                            value={darkModeEnabled}
                            onValueChange={setDarkModeEnabled}
                            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                            thumbColor={Colors.white}
                        />
                    </View>

                    <View style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="finger-print-outline" size={20} color="#22C55E" />
                            </View>
                            <Text style={styles.menuItemText}>Biometric Login</Text>
                        </View>
                        <Switch
                            value={biometricEnabled}
                            onValueChange={setBiometricEnabled}
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

                    <TouchableOpacity style={styles.menuItem}>
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: 20,
    },
    profileCard: {
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.white,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: Colors.white,
        opacity: 0.9,
    },
    editButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#EF4444',
    },
    appVersion: {
        fontSize: 13,
        color: Colors.text.light,
        textAlign: 'center',
        marginBottom: 16,
    },
    bottomSpacing: {
        height: 140,
    },
});

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PersonalInfoScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!error && data) {
            setFullName(data.full_name || '');
            setEmail(data.email || user.email || '');
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        if (newPassword || confirmPassword) {
            if (!newPassword || !confirmPassword) {
                Alert.alert('Error', 'Please enter and confirm your new password');
                return;
            }
            if (newPassword !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
        }

        setSaving(true);

        try {
            // Update profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(
                    {
                        id: user.id,
                        full_name: fullName.trim(),
                        email: user.email || email,
                    },
                    { onConflict: 'id' }
                )
                .select();

            if (profileError) {
                Alert.alert('Error', `Failed to update profile: ${profileError.message}`);
                setSaving(false);
                return;
            }

            // Update password if provided
            if (newPassword) {
                const { error: passwordError } = await supabase.auth.updateUser({
                    password: newPassword,
                });

                if (passwordError) {
                    Alert.alert('Error', `Failed to update password: ${passwordError.message}`);
                    setSaving(false);
                    return;
                }
            }

            setSaving(false);

            // Navigate back immediately - profile screen will auto-refresh
            router.replace('/(home)/profile');
        } catch (error) {
            console.error('Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
            setSaving(false);
        }
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(home)/profile')}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Info</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROFILE</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={Colors.text.secondary} />
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter your name"
                                placeholderTextColor={Colors.text.light}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, styles.inputContainerDisabled]}>
                            <Ionicons name="mail-outline" size={20} color={Colors.text.secondary} />
                            <TextInput
                                style={[styles.input, styles.inputDisabled]}
                                value={email || user?.email || ''}
                                placeholder="Enter your email"
                                placeholderTextColor={Colors.text.light}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={false}
                            />
                            <Ionicons name="lock-closed" size={16} color={Colors.text.light} />
                        </View>
                        <Text style={styles.helperText}>Email cannot be changed</Text>
                    </View>
                </View>

                {/* Change Password Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CHANGE PASSWORD</Text>
                    <Text style={styles.sectionSubtitle}>Leave blank to keep current password</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} />
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password"
                                placeholderTextColor={Colors.text.light}
                                secureTextEntry={!showNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                <Ionicons
                                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={Colors.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} />
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor={Colors.text.light}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={Colors.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <Text style={styles.errorText}>Passwords do not match</Text>
                        )}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
    },
    placeholder: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: Colors.text.light,
        marginBottom: 10,
    },
    inputGroup: {
        marginBottom: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 46,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: Colors.text.primary,
    },
    inputContainerDisabled: {
        backgroundColor: Colors.background.primary,
        opacity: 0.7,
    },
    inputDisabled: {
        color: Colors.text.secondary,
    },
    helperText: {
        fontSize: 11,
        color: Colors.text.light,
        marginTop: 4,
    },
    errorText: {
        fontSize: 11,
        color: '#EF4444',
        marginTop: 6,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 6,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.white,
    },
    bottomSpacing: {
        height: 100,
    },
});

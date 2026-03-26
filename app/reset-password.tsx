import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { session, loading: authLoading, updatePassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const passwordError = useMemo(() => {
        if (!password) return '';
        if (password.length < 6) return 'Password must be at least 6 characters';
        return '';
    }, [password]);

    const confirmPasswordError = useMemo(() => {
        if (!confirmPassword) return '';
        if (confirmPassword !== password) return 'Passwords do not match';
        return '';
    }, [confirmPassword, password]);

    const canSubmit =
        !!password &&
        !!confirmPassword &&
        !passwordError &&
        !confirmPasswordError &&
        !submitting;

    const handleUpdatePassword = async () => {
        if (!canSubmit) {
            return;
        }

        setSubmitting(true);
        const { error } = await updatePassword(password);
        setSubmitting(false);

        if (error) {
            Alert.alert(
                'Unable to reset password',
                error.message || 'Please request a new password reset link and try again.'
            );
            return;
        }

        Alert.alert('Password updated', 'Your password has been reset successfully.', [
            {
                text: 'Go to Sign In',
                onPress: () => router.replace('/sign-in'),
            },
        ]);
    };

    if (authLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.infoText}>Preparing secure reset session...</Text>
            </View>
        );
    }

    if (!session) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={54} color={Colors.error} />
                <Text style={styles.errorTitle}>Reset link is invalid or expired</Text>
                <Text style={styles.infoText}>
                    Request a new password reset email and open the latest link from your mobile device.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/forgot-password')}>
                    <Text style={styles.primaryButtonText}>Request New Link</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Set a New Password</Text>
                <Text style={styles.subtitle}>Choose a secure password for your account.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            placeholderTextColor={Colors.text.light}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={Colors.text.secondary}
                            />
                        </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : null]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            placeholderTextColor={Colors.text.light}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={Colors.text.secondary}
                            />
                        </TouchableOpacity>
                    </View>
                    {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                </View>

                <TouchableOpacity
                    style={[styles.primaryButton, !canSubmit ? styles.disabledButton : null]}
                    onPress={handleUpdatePassword}
                    disabled={!canSubmit}
                >
                    {submitting ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.primaryButtonText}>Update Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: Colors.white,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: 10,
    },
    errorTitle: {
        marginTop: 12,
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
    },
    infoText: {
        marginTop: 10,
        marginBottom: 20,
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        height: 38,
        paddingHorizontal: 8,
        backgroundColor: Colors.background.primary,
        gap: 4,
    },
    input: {
        flex: 1,
        color: Colors.text.primary,
        fontSize: 13,
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 6,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        height: 38,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
});

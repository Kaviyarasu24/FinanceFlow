import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (text && !validateEmail(text)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = () => {
        if (!email) {
            setEmailError('Email is required');
            return;
        }

        if (emailError) {
            return;
        }

        // TODO: Implement password reset logic
        console.log('Password reset requested for:', email);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark-circle" size={80} color={Colors.primary} />
                    </View>
                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successMessage}>
                        We've sent password reset instructions to {email}
                    </Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Header */}
                <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed-outline" size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you instructions to reset your password
                    </Text>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                        <Ionicons name="mail-outline" size={20} color={Colors.text.secondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={Colors.text.light}
                            value={email}
                            onChangeText={handleEmailChange}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, (!email || emailError) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!email || !!emailError}
                >
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                </TouchableOpacity>

                {/* Back to Sign In */}
                <TouchableOpacity style={styles.signInLink} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                    <Text style={styles.signInLinkText}>Back to Sign In</Text>
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
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },
    backIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: `${Colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 12,
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 2,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.text.primary,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: Colors.text.light,
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
    },
    signInLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    signInLinkText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary,
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    successIcon: {
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 15,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    backButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
    },
});

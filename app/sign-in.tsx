import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

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

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (text && text.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    };

    const handleSignIn = () => {
        if (!email || !password) {
            if (!email) setEmailError('Email is required');
            if (!password) setPasswordError('Password is required');
            return;
        }

        if (emailError || passwordError) {
            return;
        }

        // TODO: Implement sign-in logic
        console.log('Sign in:', { email, password, rememberMe });
        // Navigate to home screen
        router.replace('/(home)');
    };

    const isFormValid = email && password && !emailError && !passwordError;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="cash-outline" size={40} color={Colors.primary} />
                        </View>
                    </View>
                    <Text style={styles.appName}>FinanceFlow</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue managing your finances</Text>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                            <Ionicons name="mail-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
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

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={Colors.text.light}
                                value={password}
                                onChangeText={handlePasswordChange}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={Colors.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                    </View>

                    {/* Remember Me & Forgot Password */}
                    <View style={styles.optionsRow}>
                        <TouchableOpacity
                            style={styles.rememberMeContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                {rememberMe && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                            </View>
                            <Text style={styles.rememberMeText}>Remember me</Text>
                        </TouchableOpacity>

                        <Link href="/forgot-password" asChild>
                            <TouchableOpacity>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        style={[styles.signInButton, !isFormValid && styles.signInButtonDisabled]}
                        onPress={handleSignIn}
                        disabled={!isFormValid}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <Link href="/sign-up" asChild>
                            <TouchableOpacity>
                                <Text style={styles.signUpLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 24,
    },
    logoContainer: {
        marginBottom: 12,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: 0.5,
    },
    card: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 14,
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
        height: 50,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.text.primary,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
    },
    rememberMeText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
    signInButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    signInButtonDisabled: {
        backgroundColor: Colors.text.light,
        opacity: 0.6,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: 0.5,
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        fontSize: 12,
        color: Colors.text.light,
        marginHorizontal: 16,
        fontWeight: '500',
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 8,
    },
    socialButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    signUpLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '700',
    },
});

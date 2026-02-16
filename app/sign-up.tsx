import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignUpScreen() {
    const router = useRouter();
    const { signUp, user, loading: authLoading } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user) {
            router.replace('/(home)');
        }
    }, [user, authLoading]);

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getPasswordStrength = (password: string) => {
        if (password.length < 6) return 'weak';
        if (password.length < 10) return 'medium';
        return 'strong';
    };

    const handleNameChange = (text: string) => {
        setFullName(text);
        if (text && text.trim().length < 2) {
            setNameError('Name must be at least 2 characters');
        } else {
            setNameError('');
        }
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

        // Check confirm password match
        if (confirmPassword && text !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else if (confirmPassword) {
            setConfirmPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        if (text && text !== password) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleSignUp = async () => {
        // Validate all fields
        let hasError = false;

        if (!fullName.trim()) {
            setNameError('Full name is required');
            hasError = true;
        }

        if (!email) {
            setEmailError('Email is required');
            hasError = true;
        }

        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            hasError = true;
        }

        if (hasError || nameError || emailError || passwordError || confirmPasswordError) {
            return;
        }

        setLoading(true);
        const { error } = await signUp(email, password, fullName);
        setLoading(false);

        if (error) {
            Alert.alert('Sign Up Error', error.message || 'Failed to create account');
        } else {
            Alert.alert(
                'Success!',
                'Account created successfully. Please check your email to verify your account.',
                [{ text: 'OK', onPress: () => router.replace('/(home)') }]
            );
        }
    };

    const passwordStrength = password ? getPasswordStrength(password) : null;
    const isFormValid = fullName.trim() && email && password && confirmPassword &&
        !nameError && !emailError && !passwordError && !confirmPasswordError &&
        agreeToTerms;

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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Start your journey to financial freedom</Text>

                    {/* Full Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={[styles.inputContainer, nameError ? styles.inputError : null]}>
                            <Ionicons name="person-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor={Colors.text.light}
                                value={fullName}
                                onChangeText={handleNameChange}
                                autoCapitalize="words"
                            />
                        </View>
                        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                    </View>

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
                                placeholder="Create a password"
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
                        {passwordError ? (
                            <Text style={styles.errorText}>{passwordError}</Text>
                        ) : passwordStrength ? (
                            <View style={styles.passwordStrengthContainer}>
                                <View style={styles.passwordStrengthBars}>
                                    <View style={[styles.strengthBar, passwordStrength === 'weak' && styles.strengthBarWeak, passwordStrength !== 'weak' && styles.strengthBarActive]} />
                                    <View style={[styles.strengthBar, passwordStrength === 'medium' && styles.strengthBarMedium, passwordStrength === 'strong' && styles.strengthBarActive]} />
                                    <View style={[styles.strengthBar, passwordStrength === 'strong' && styles.strengthBarStrong]} />
                                </View>
                                <Text style={[styles.strengthText, passwordStrength === 'weak' && styles.strengthTextWeak, passwordStrength === 'medium' && styles.strengthTextMedium, passwordStrength === 'strong' && styles.strengthTextStrong]}>
                                    {passwordStrength === 'weak' ? 'Weak' : passwordStrength === 'medium' ? 'Medium' : 'Strong'}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : null]}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                placeholderTextColor={Colors.text.light}
                                value={confirmPassword}
                                onChangeText={handleConfirmPasswordChange}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={Colors.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>
                        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                    </View>

                    {/* Terms and Conditions */}
                    <TouchableOpacity
                        style={styles.termsContainer}
                        onPress={() => setAgreeToTerms(!agreeToTerms)}
                    >
                        <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                            {agreeToTerms && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                        </View>
                        <Text style={styles.termsText}>
                            I agree to the{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text>
                            {' '}and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Create Account Button */}
                    <TouchableOpacity
                        style={[styles.createAccountButton, (!isFormValid || loading) && styles.buttonDisabled]}
                        onPress={handleSignUp}
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.createAccountButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>Already have an account? </Text>
                        <Link href="/sign-in" asChild>
                            <TouchableOpacity>
                                <Text style={styles.signInLink}>Sign In</Text>
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
        paddingTop: 20,
        paddingBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 12,
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
        height: 48,
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
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
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
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
    },
    termsText: {
        flex: 1,
        fontSize: 13,
        color: Colors.text.secondary,
        lineHeight: 20,
    },
    termsLink: {
        color: Colors.primary,
        fontWeight: '600',
    },
    createAccountButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 2,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    passwordStrengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    passwordStrengthBars: {
        flexDirection: 'row',
        gap: 4,
        flex: 1,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.border,
    },
    strengthBarActive: {
        backgroundColor: '#22C55E',
    },
    strengthBarWeak: {
        backgroundColor: '#EF4444',
    },
    strengthBarMedium: {
        backgroundColor: '#F59E0B',
    },
    strengthBarStrong: {
        backgroundColor: '#22C55E',
    },
    strengthText: {
        fontSize: 12,
        fontWeight: '600',
    },
    strengthTextWeak: {
        color: '#EF4444',
    },
    strengthTextMedium: {
        color: '#F59E0B',
    },
    strengthTextStrong: {
        color: '#22C55E',
    },
    createAccountButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
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
        marginBottom: 14,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        height: 46,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 8,
    },
    socialButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    signInLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '700',
    },
});

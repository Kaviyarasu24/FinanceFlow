import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { resetPassword, verifyResetOtpAndUpdatePassword, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleSendOtp = async () => {
        if (!email) {
            setEmailError('Email is required');
            return;
        }

        if (emailError) {
            return;
        }

        setLoading(true);
        const { error } = await resetPassword(email);
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message || 'Failed to send verification code');
        } else {
            setIsOtpStep(true);
            Alert.alert('Code sent', 'Enter the OTP from your email and set a new password.');
        }
    };

    const handleOtpChange = (text: string) => {
        const sanitized = text.replace(/\D/g, '').slice(0, 8);
        setOtp(sanitized);
        if (sanitized.length > 0 && sanitized.length < 8) {
            setOtpError('OTP must be 8 digits');
        } else {
            setOtpError('');
        }
    };

    const handleNewPasswordChange = (text: string) => {
        setNewPassword(text);
        if (text && text.length < 6) {
            setNewPasswordError('Password must be at least 6 characters');
        } else {
            setNewPasswordError('');
        }

        if (confirmPassword && text !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else if (confirmPassword) {
            setConfirmPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        if (text && text !== newPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleVerifyAndReset = async () => {
        let hasError = false;

        if (!otp) {
            setOtpError('OTP is required');
            hasError = true;
        } else if (otp.length !== 8) {
            setOtpError('OTP must be 8 digits');
            hasError = true;
        }

        if (!newPassword) {
            setNewPasswordError('New password is required');
            hasError = true;
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            hasError = true;
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            hasError = true;
        }

        if (hasError || otpError || newPasswordError || confirmPasswordError) {
            return;
        }

        setLoading(true);
        const { error } = await verifyResetOtpAndUpdatePassword(email, otp, newPassword);
        setLoading(false);

        if (error) {
            Alert.alert(
                'Reset failed',
                error.message || 'Invalid or expired OTP. Please request a new code.'
            );
            return;
        }

        Alert.alert('Success', 'Password updated successfully.', [
            {
                text: 'Go to Sign In',
                onPress: () => router.replace('/sign-in'),
            },
        ]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed-outline" size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        {isOtpStep
                            ? `Enter the 6-digit OTP sent to ${email} and set your new password`
                            : 'Enter your email address and we will send a 6-digit OTP'}
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
                            editable={!isOtpStep}
                        />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                {isOtpStep ? (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>OTP Code</Text>
                            <View style={[styles.inputContainer, otpError ? styles.inputError : null]}>
                                <Ionicons name="key-outline" size={20} color={Colors.text.secondary} />
                                <TextInput
                                    style={[styles.input, styles.otpInput]}
                                    placeholder="Enter 8-digit OTP"
                                    placeholderTextColor={Colors.text.light}
                                    value={otp}
                                    onChangeText={handleOtpChange}
                                    keyboardType="number-pad"
                                    maxLength={8}
                                />
                            </View>
                            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={[styles.inputContainer, newPasswordError ? styles.inputError : null]}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    placeholderTextColor={Colors.text.light}
                                    value={newPassword}
                                    onChangeText={handleNewPasswordChange}
                                    autoCapitalize="none"
                                    secureTextEntry={!showNewPassword}
                                />
                                <TouchableOpacity onPress={() => setShowNewPassword((prev) => !prev)}>
                                    <Ionicons
                                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={Colors.text.secondary}
                                    />
                                </TouchableOpacity>
                            </View>
                            {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : null]}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={Colors.text.light}
                                    value={confirmPassword}
                                    onChangeText={handleConfirmPasswordChange}
                                    autoCapitalize="none"
                                    secureTextEntry={!showConfirmPassword}
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
                    </>
                ) : null}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (
                            isOtpStep
                                ? !otp || !newPassword || !confirmPassword || !!otpError || !!newPasswordError || !!confirmPasswordError || loading || authLoading
                                : !email || !!emailError || loading || authLoading
                        ) && styles.submitButtonDisabled,
                    ]}
                    onPress={isOtpStep ? handleVerifyAndReset : handleSendOtp}
                    disabled={
                        isOtpStep
                            ? !otp || !newPassword || !confirmPassword || !!otpError || !!newPasswordError || !!confirmPasswordError || loading || authLoading
                            : !email || !!emailError || loading || authLoading
                    }
                >
                    {loading || authLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isOtpStep ? 'Verify OTP & Update Password' : 'Send OTP'}
                        </Text>
                    )}
                </TouchableOpacity>

                {isOtpStep ? (
                    <TouchableOpacity style={styles.resendLink} onPress={handleSendOtp} disabled={loading}>
                        <Text style={styles.resendLinkText}>Resend OTP</Text>
                    </TouchableOpacity>
                ) : null}

                {/* Back to Sign In */}
                <TouchableOpacity style={styles.signInLink} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                    <Text style={styles.signInLinkText}>Back to Sign In</Text>
                </TouchableOpacity>
            </ScrollView>
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
        padding: 24,
        paddingTop: 24,
        paddingBottom: 24,
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
        marginBottom: 24,
    },
    iconContainer: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: `${Colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 8,
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
    otpInput: {
        letterSpacing: 4,
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
    resendLink: {
        marginTop: -8,
        marginBottom: 20,
        alignItems: 'center',
    },
    resendLinkText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
});

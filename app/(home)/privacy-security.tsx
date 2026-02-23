import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PrivacySecurityScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(home)/profile')}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Privacy Policy */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Privacy Policy</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.contentText}>
                            At FinanceFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
                        </Text>
                        <Text style={styles.contentSubheading}>Information We Collect</Text>
                        <Text style={styles.contentText}>
                            • Personal information (name, email, phone number){'\n'}
                            • Financial transaction data{'\n'}
                            • Device and usage information{'\n'}
                            • Location data (with your permission)
                        </Text>
                        <Text style={styles.contentSubheading}>How We Use Your Information</Text>
                        <Text style={styles.contentText}>
                            • To provide and improve our services{'\n'}
                            • To personalize your experience{'\n'}
                            • To send important notifications{'\n'}
                            • To ensure security and prevent fraud
                        </Text>
                        <Text style={styles.contentSubheading}>Data Protection</Text>
                        <Text style={styles.contentText}>
                            We use industry-standard encryption and security measures to protect your data. Your financial information is never shared with third parties without your explicit consent.
                        </Text>
                    </View>
                </View>

                {/* Terms of Service */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text" size={24} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Terms of Service</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.contentText}>
                            By using FinanceFlow, you agree to the following terms and conditions:
                        </Text>
                        <Text style={styles.contentSubheading}>User Responsibilities</Text>
                        <Text style={styles.contentText}>
                            • Maintain the confidentiality of your account{'\n'}
                            • Provide accurate and complete information{'\n'}
                            • Use the app for lawful purposes only{'\n'}
                            • Notify us of any unauthorized access
                        </Text>
                        <Text style={styles.contentSubheading}>Service Availability</Text>
                        <Text style={styles.contentText}>
                            We strive to provide uninterrupted service but cannot guarantee 100% uptime. We reserve the right to modify or discontinue features with notice.
                        </Text>
                        <Text style={styles.contentSubheading}>Limitation of Liability</Text>
                        <Text style={styles.contentText}>
                            FinanceFlow is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the app.
                        </Text>
                    </View>
                </View>

                {/* Security Settings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="lock-closed" size={24} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Security Settings</Text>
                    </View>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="key-outline" size={20} color={Colors.text.secondary} />
                                <Text style={styles.menuItemText}>Change Password</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="finger-print-outline" size={20} color={Colors.text.secondary} />
                                <Text style={styles.menuItemText}>Two-Factor Authentication</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="phone-portrait-outline" size={20} color={Colors.text.secondary} />
                                <Text style={styles.menuItemText}>Trusted Devices</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="time-outline" size={20} color={Colors.text.secondary} />
                                <Text style={styles.menuItemText}>Login History</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <Text style={styles.contactText}>
                        Questions about privacy or security?{'\n'}
                        Contact us at privacy@financeflow.com
                    </Text>
                </View>

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
    },
    contentSubheading: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    contentText: {
        fontSize: 14,
        color: Colors.text.secondary,
        lineHeight: 22,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    contactText: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomSpacing: {
        height: 100,
    },
});

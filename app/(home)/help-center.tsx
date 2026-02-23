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

const FAQS = [
    {
        question: 'How do I add a transaction?',
        answer: 'Go to the Add tab, enter the amount, choose a category, and save your transaction.',
    },
    {
        question: 'How do I edit or delete a transaction?',
        answer: 'Open the Transactions list and tap a transaction to view or update it.',
    },
    {
        question: 'Why is my balance different?',
        answer: 'Check recent transactions and confirm the transaction type (income or expense).',
    },
    {
        question: 'How do I change my currency?',
        answer: 'Go to App Settings and select your preferred currency.',
    },
];

export default function HelpCenterScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(home)/profile')}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Help</Text>
                    <View style={styles.card}>
                        {FAQS.map((item) => (
                            <View key={item.question} style={styles.faqItem}>
                                <Text style={styles.faqQuestion}>{item.question}</Text>
                                <Text style={styles.faqAnswer}>{item.answer}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Support</Text>
                    <View style={styles.card}>
                        <View style={styles.contactRow}>
                            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                            <Text style={styles.contactText}>support@financeflow.com</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Ionicons name="call-outline" size={20} color={Colors.primary} />
                            <Text style={styles.contactText}>+1 800 555 0135</Text>
                        </View>
                        <Text style={styles.contactHint}>We reply within 24 hours.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tips</Text>
                    <View style={styles.card}>
                        <Text style={styles.tipText}>Use categories to keep your analytics accurate.</Text>
                        <Text style={styles.tipText}>Add notes to transactions for better tracking.</Text>
                        <Text style={styles.tipText}>Review analytics monthly to spot spending patterns.</Text>
                    </View>
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
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text.secondary,
        marginBottom: 12,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    faqItem: {
        gap: 6,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    faqAnswer: {
        fontSize: 13,
        color: Colors.text.secondary,
        lineHeight: 18,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    contactText: {
        fontSize: 14,
        color: Colors.text.primary,
        fontWeight: '600',
    },
    contactHint: {
        marginTop: 8,
        fontSize: 12,
        color: Colors.text.secondary,
    },
    tipText: {
        fontSize: 13,
        color: Colors.text.secondary,
        lineHeight: 18,
    },
    bottomSpacing: {
        height: 140,
    },
});

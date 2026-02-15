import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

export default function AppSettingsScreen() {
    const router = useRouter();
    const [selectedCurrency, setSelectedCurrency] = useState('USD');

    const handleCurrencySelect = (code: string) => {
        setSelectedCurrency(code);
        // TODO: Save to AsyncStorage
        Alert.alert('Currency Updated', `Currency changed to ${code}`);
    };

    const selectedCurrencyData = CURRENCIES.find((c) => c.code === selectedCurrency);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>App Settings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Currency Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CURRENCY</Text>
                    <Text style={styles.sectionSubtitle}>
                        Select your preferred currency for displaying amounts
                    </Text>

                    {/* Current Selection */}
                    <View style={styles.currentSelectionCard}>
                        <View style={styles.currentSelectionLeft}>
                            <View style={styles.currencyIconContainer}>
                                <Text style={styles.currencySymbol}>{selectedCurrencyData?.symbol}</Text>
                            </View>
                            <View>
                                <Text style={styles.currentCurrencyName}>{selectedCurrencyData?.name}</Text>
                                <Text style={styles.currentCurrencyCode}>{selectedCurrencyData?.code}</Text>
                            </View>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    </View>

                    {/* Currency List */}
                    <View style={styles.card}>
                        {CURRENCIES.map((currency, index) => (
                            <TouchableOpacity
                                key={currency.code}
                                style={[
                                    styles.currencyItem,
                                    index === CURRENCIES.length - 1 && styles.currencyItemLast,
                                ]}
                                onPress={() => handleCurrencySelect(currency.code)}
                            >
                                <View style={styles.currencyItemLeft}>
                                    <View style={styles.currencyIconSmall}>
                                        <Text style={styles.currencySymbolSmall}>{currency.symbol}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.currencyName}>{currency.name}</Text>
                                        <Text style={styles.currencyCode}>{currency.code}</Text>
                                    </View>
                                </View>
                                {selectedCurrency === currency.code && (
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preview Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PREVIEW</Text>
                    <View style={styles.previewCard}>
                        <Text style={styles.previewLabel}>Sample Amount</Text>
                        <Text style={styles.previewAmount}>
                            {selectedCurrencyData?.symbol}1,234.56
                        </Text>
                        <Text style={styles.previewDescription}>
                            This is how amounts will be displayed throughout the app
                        </Text>
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
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: Colors.text.light,
        marginBottom: 16,
    },
    currentSelectionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: `${Colors.primary}15`,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    currentSelectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    currencyIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.white,
    },
    currentCurrencyName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    currentCurrencyCode: {
        fontSize: 13,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 8,
    },
    currencyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    currencyItemLast: {
        borderBottomWidth: 0,
    },
    currencyItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    currencyIconSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencySymbolSmall: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    currencyName: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    currencyCode: {
        fontSize: 12,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    previewCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    previewLabel: {
        fontSize: 13,
        color: Colors.text.secondary,
        marginBottom: 8,
    },
    previewAmount: {
        fontSize: 36,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 8,
    },
    previewDescription: {
        fontSize: 12,
        color: Colors.text.light,
        textAlign: 'center',
    },
    bottomSpacing: {
        height: 40,
    },
});

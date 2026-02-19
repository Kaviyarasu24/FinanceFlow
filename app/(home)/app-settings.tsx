import { Colors } from '@/constants/Colors';
import { useSettings } from '@/hooks/useSettings';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function AppSettingsScreen() {
    const router = useRouter();
    const { settings, loading, updateSettings } = useSettings();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setSelectedCurrency(settings.currency_code || 'USD');
            setNotificationsEnabled(settings.notifications_enabled ?? true);
        }
    }, [settings]);

    const handleSave = async () => {
        console.log('Starting save...', { selectedCurrency, notificationsEnabled });
        setSaving(true);
        const selectedCurrencyObj = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

        console.log('Currency object:', selectedCurrencyObj);

        const settingsData = {
            currency_code: selectedCurrency,
            currency_symbol: selectedCurrencyObj.symbol,
            notifications_enabled: notificationsEnabled,
        };

        console.log('Saving settings:', settingsData);

        const { error } = await updateSettings(settingsData);

        console.log('Save result:', { error });

        setSaving(false);

        if (error) {
            console.error('Save error:', error);
            Alert.alert('Error', `Failed to save settings: ${error}`);
        } else {
            console.log('Settings saved successfully');
            router.back();
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

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
                {/* General Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>GENERAL</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="cash-outline" size={20} color={Colors.text.secondary} />
                            <Text style={styles.settingLabel}>Currency</Text>
                        </View>
                        <View style={styles.settingRight}>
                            <Text style={styles.settingValue}>{currentCurrency.symbol} {currentCurrency.code}</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                        </View>
                    </TouchableOpacity>

                    {showCurrencyPicker && (
                        <View style={styles.currencyPicker}>
                            {CURRENCIES.map((currency) => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={styles.currencyOption}
                                    onPress={() => {
                                        setSelectedCurrency(currency.code);
                                        setShowCurrencyPicker(false);
                                    }}
                                >
                                    <Text style={styles.currencyName}>
                                        {currency.symbol} {currency.name}
                                    </Text>
                                    {selectedCurrency === currency.code && (
                                        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="notifications-outline" size={20} color={Colors.text.secondary} />
                            <View>
                                <Text style={styles.settingLabel}>Push Notifications</Text>
                                <Text style={styles.settingDescription}>Receive transaction alerts</Text>
                            </View>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: Colors.text.light, true: Colors.primary }}
                            thumbColor={Colors.white}
                        />
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
                        <Text style={styles.saveButtonText}>Save Settings</Text>
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
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    settingDescription: {
        fontSize: 13,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 15,
        color: Colors.text.secondary,
    },
    currencyPicker: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 8,
        marginTop: -8,
        marginBottom: 12,
    },
    currencyOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    currencyName: {
        fontSize: 15,
        color: Colors.text.primary,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 8,
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
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
    },
    bottomSpacing: {
        height: 100,
    },
});

import { CalendarDatePicker } from '@/components/ui/calendar-date-picker';
import { Dropdown } from '@/components/ui/dropdown';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type TransactionType = 'expense' | 'income';

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
}

export default function AddTransactionScreen() {
    const { user } = useAuth();
    const { categories, loading: categoriesLoading } = useCategories();
    const { addTransaction, updateTransaction, fetchTransactions } = useTransactions();
    const { getCurrencySymbol } = useCurrency();
    const tabBarHeight = useBottomTabBarHeight();
    const params = useLocalSearchParams<{
        transactionId?: string | string[];
        type?: string | string[];
        amount?: string | string[];
        categoryId?: string | string[];
        date?: string | string[];
        notes?: string | string[];
    }>();

    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [date, setDate] = useState(new Date());
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const getParamValue = (value?: string | string[]) =>
        Array.isArray(value) ? value[0] : value;

    const transactionId = getParamValue(params.transactionId);
    const paramType = getParamValue(params.type);
    const paramAmount = getParamValue(params.amount);
    const paramCategoryId = getParamValue(params.categoryId);
    const paramDate = getParamValue(params.date);
    const paramNotes = getParamValue(params.notes);
    const isEditMode = !!transactionId;

    useEffect(() => {
        if (!isEditMode) return;

        if (paramType === 'income' || paramType === 'expense') {
            setType(paramType);
        }

        if (paramAmount) {
            setAmount(paramAmount);
        }

        if (paramDate) {
            const parsedDate = new Date(paramDate);
            if (!Number.isNaN(parsedDate.getTime())) {
                setDate(parsedDate);
            }
        }

        setNotes(paramNotes || '');
    }, [isEditMode, paramAmount, paramDate, paramNotes, paramType]);

    // Set initial category when categories load
    useEffect(() => {
        if (categories.length > 0 && !selectedCategory) {
            if (isEditMode && paramCategoryId) {
                const matchingCategory = categories.find((c) => c.id === paramCategoryId);
                if (matchingCategory) {
                    setSelectedCategory(matchingCategory);
                    return;
                }
            }

            const initialCategories = categories.filter(c => c.type === type);
            if (initialCategories.length > 0) {
                setSelectedCategory(initialCategories[0]);
            }
        }
    }, [categories, isEditMode, paramCategoryId, selectedCategory, type]);

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        const filteredCategories = categories.filter(c => c.type === newType);
        if (filteredCategories.length > 0) {
            setSelectedCategory(filteredCategories[0]);
        }
    };

    const handleAmountChange = (text: string) => {
        // Only allow numbers and one decimal point (max 2 decimal places)
        const numericRegex = /^\d*\.?\d{0,2}$/;
        if (text === '' || numericRegex.test(text)) {
            setAmount(text);
        }
    };

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in to add transactions');
            return;
        }

        setSaving(true);
        const payload = {
            user_id: user.id,
            type,
            amount: parseFloat(amount),
            category_id: selectedCategory.id,
            date: date.toISOString().split('T')[0],
            notes: notes || null,
        };

        const { error } = isEditMode && transactionId
            ? await updateTransaction(transactionId, payload)
            : await addTransaction(payload);

        if (error) {
            setSaving(false);
            Alert.alert('Error', error);
        } else {
            // Refresh transactions list to ensure data is up-to-date
            await fetchTransactions();
            setSaving(false);
            
            // Reset form
            setAmount('');
            setNotes('');
            setDate(new Date());
            // Navigate to transactions list after save/update
            router.push('/(home)/transactions');
        }
    };

    const currentCategories = categories.filter(c => c.type === type);

    if (categoriesLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Transaction' : 'Add Transaction'}</Text>
                <Text style={styles.headerSubtitle}>
                    {isEditMode ? 'Update your transaction details' : 'Track your income and expenses'}
                </Text>
            </View>

            <View style={[styles.content, { paddingBottom: tabBarHeight + 8 }]}>
                {/* Type Toggle */}
                <View style={styles.typeToggleContainer}>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'expense' && styles.typeButtonExpenseActive]}
                        onPress={() => handleTypeChange('expense')}
                    >
                        <Ionicons
                            name="arrow-down-circle-outline"
                            size={18}
                            color={type === 'expense' ? Colors.white : '#EF4444'}
                        />
                        <Text
                            style={[
                                styles.typeButtonText,
                                type === 'expense' && styles.typeButtonTextActive,
                            ]}
                        >
                            Expense
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.typeButton, type === 'income' && styles.typeButtonIncomeActive]}
                        onPress={() => handleTypeChange('income')}
                    >
                        <Ionicons
                            name="arrow-up-circle-outline"
                            size={18}
                            color={type === 'income' ? Colors.white : '#22C55E'}
                        />
                        <Text
                            style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}
                        >
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.card}>
                    <Text style={styles.label}>Amount</Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            placeholderTextColor={Colors.text.light}
                            value={amount}
                            onChangeText={handleAmountChange}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* Category Picker */}
                <View style={styles.card}>
                    <Dropdown
                        label="Category"
                        placeholder="Select a category"
                        options={currentCategories.map((cat) => ({
                            id: cat.id,
                            label: cat.name,
                            icon: cat.icon,
                            color: cat.color,
                        }))}
                        selectedValue={selectedCategory?.id || null}
                        onSelect={(option) => {
                            const category = currentCategories.find((cat) => cat.id === option.id);
                            if (category) setSelectedCategory(category);
                        }}
                    />
                </View>

                {/* Date Picker */}
                <View style={styles.card}>
                    <Text style={styles.label}>Date</Text>
                    {Platform.OS === 'web' ? (
                        <input
                            type="date"
                            value={date.toISOString().split('T')[0]}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                if (!isNaN(selectedDate.getTime())) {
                                    setDate(selectedDate);
                                }
                            }}
                            style={{
                                padding: '14px 16px',
                                borderRadius: 12,
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#F9FAFB',
                                fontSize: 16,
                                width: '100%',
                                fontFamily: 'system-ui',
                                color: '#1F2937',
                                outline: 'none',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                            }}
                        />
                    ) : (
                        <CalendarDatePicker
                            date={date}
                            onDateChange={setDate}
                            maximumDate={new Date()}
                        />
                    )}
                </View>

                {/* Notes Input */}
                <View style={styles.card}>
                    <Text style={styles.label}>Notes (Optional)</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Add a note..."
                        placeholderTextColor={Colors.text.light}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={1}
                        textAlignVertical="top"
                    />
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
                        <Text style={styles.saveButtonText}>{isEditMode ? 'Update Transaction' : 'Save Transaction'}</Text>
                    )}
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    header: {
        backgroundColor: Colors.white,
        paddingHorizontal: 14,
        paddingTop: 50,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 11,
        color: Colors.text.secondary,
    },
    content: {
        flex: 1,
        padding: 10,
    },
    typeToggleContainer: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingVertical: 8,
        gap: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeButtonExpenseActive: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    typeButtonIncomeActive: {
        backgroundColor: '#22C55E',
        borderColor: '#22C55E',
    },
    typeButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    typeButtonTextActive: {
        color: Colors.white,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 6,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text.primary,
        marginRight: 4,
    },
    amountInput: {
        flex: 1,
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    notesInput: {
        backgroundColor: Colors.background.primary,
        borderRadius: 8,
        padding: 8,
        fontSize: 12,
        color: Colors.text.primary,
        minHeight: 40,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: Colors.text.light,
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.white,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.text.secondary,
    },
});

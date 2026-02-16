import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
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
    const { addTransaction, fetchTransactions } = useTransactions();
    const { getCurrencySymbol } = useCurrency();

    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [notes, setNotes] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    // Set initial category when categories load
    useEffect(() => {
        if (categories.length > 0 && !selectedCategory) {
            const expenseCategories = categories.filter(c => c.type === 'expense');
            if (expenseCategories.length > 0) {
                setSelectedCategory(expenseCategories[0]);
            }
        }
    }, [categories]);

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        const filteredCategories = categories.filter(c => c.type === newType);
        if (filteredCategories.length > 0) {
            setSelectedCategory(filteredCategories[0]);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        // On Android, close the picker after selection
        // On iOS, keep it open (it has a Done button)
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setDate(selectedDate);
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
        const { error } = await addTransaction({
            user_id: user.id,
            type,
            amount: parseFloat(amount),
            category_id: selectedCategory.id,
            date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            notes: notes || null,
        });

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
            // Navigate back to home page
            router.push('/(home)');
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
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
                <Text style={styles.headerTitle}>Add Transaction</Text>
                <Text style={styles.headerSubtitle}>Track your income and expenses</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Type Toggle */}
                <View style={styles.typeToggleContainer}>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'expense' && styles.typeButtonExpenseActive]}
                        onPress={() => handleTypeChange('expense')}
                    >
                        <Ionicons
                            name="arrow-down-circle-outline"
                            size={20}
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
                            size={20}
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
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    >
                        {selectedCategory ? (
                            <View style={styles.categoryButtonLeft}>
                                <View
                                    style={[
                                        styles.categoryIcon,
                                        { backgroundColor: `${selectedCategory.color}20` },
                                    ]}
                                >
                                    <Ionicons
                                        name={selectedCategory.icon as any}
                                        size={20}
                                        color={selectedCategory.color}
                                    />
                                </View>
                                <Text style={styles.categoryButtonText}>{selectedCategory.name}</Text>
                            </View>
                        ) : (
                            <Text style={styles.categoryButtonText}>Select a category</Text>
                        )}
                        <Ionicons
                            name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={Colors.text.secondary}
                        />
                    </TouchableOpacity>

                    {showCategoryPicker && (
                        <View style={styles.categoryList}>
                            {currentCategories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={styles.categoryItem}
                                    onPress={() => {
                                        setSelectedCategory(category);
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <View
                                        style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}
                                    >
                                        <Ionicons name={category.icon as any} size={20} color={category.color} />
                                    </View>
                                    <Text style={styles.categoryItemText}>{category.name}</Text>
                                    {selectedCategory?.id === category.id && (
                                        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
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
                        <>
                            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                                <Ionicons name="calendar-outline" size={20} color={Colors.text.secondary} />
                                <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </>
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
                        numberOfLines={4}
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
                        <Text style={styles.saveButtonText}>Save Transaction</Text>
                    )}
                </TouchableOpacity>

                {/* Bottom spacing for tab bar */}
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
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    typeToggleContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        gap: 8,
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
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    typeButtonTextActive: {
        color: Colors.white,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 12,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text.primary,
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    categoryButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        padding: 16,
    },
    categoryButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    categoryList: {
        marginTop: 12,
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    categoryItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    dateButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    notesInput: {
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: Colors.text.primary,
        minHeight: 100,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
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
        fontSize: 16,
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
    bottomSpacing: {
        height: 100,
    },
});

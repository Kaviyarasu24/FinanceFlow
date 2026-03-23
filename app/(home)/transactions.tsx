import { Colors } from '@/constants/Colors';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type TransactionType = 'all' | 'income' | 'expense';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function TransactionsScreen() {
    const {
        transactions,
        loading,
        deleteTransaction,
        refreshTransactions,
    } = useTransactions({ initialFetchMode: 'all' });
    const { categories } = useCategories();
    const { formatAmount } = useCurrency();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<TransactionType>('all');
    const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const filteredCategories = useMemo(
        () => categories.filter((category) => activeFilter === 'all' || category.type === activeFilter),
        [categories, activeFilter]
    );

    useEffect(() => {
        if (categoryFilter === 'all') return;
        const categoryStillVisible = filteredCategories.some((category) => category.id === categoryFilter);
        if (!categoryStillVisible) {
            setCategoryFilter('all');
        }
    }, [categoryFilter, filteredCategories]);

    // Refresh transactions when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refreshTransactions();
        }, [refreshTransactions])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshTransactions();
        setRefreshing(false);
    };

    const handleEdit = (transaction: typeof transactions[number]) => {
        router.push({
            pathname: '/(home)/add',
            params: {
                transactionId: transaction.id,
                type: transaction.type,
                amount: String(transaction.amount),
                categoryId: transaction.category_id || '',
                date: transaction.date,
                notes: transaction.notes || '',
            },
        });
    };

    const handleDelete = (transaction: typeof transactions[number]) => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await deleteTransaction(transaction.id);
                        if (error) {
                            Alert.alert('Error', error);
                        }
                    },
                },
            ]
        );
    };

    const handleTransactionLongPress = (transaction: typeof transactions[number]) => {
        Alert.alert(
            'Transaction Actions',
            'Choose an action for this transaction.',
            [
                { text: 'Edit', onPress: () => handleEdit(transaction) },
                { text: 'Delete', style: 'destructive', onPress: () => handleDelete(transaction) },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const getCategoryInfo = (categoryId: string | null) => {
        if (!categoryId) return { name: 'Uncategorized', icon: 'help-outline', color: '#6B7280' };
        const category = categories.find(c => c.id === categoryId);
        return category || { name: 'Unknown', icon: 'help-outline', color: '#6B7280' };
    };

    const formatDate = (dateString: string, createdAt?: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Use created_at for time display if available
        const timeSource = createdAt ? new Date(createdAt) : date;

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${timeSource.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${timeSource.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isInDateFilter = (dateString: string) => {
        if (activeDateFilter === 'all') return true;

        const txDate = new Date(dateString);
        txDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeDateFilter === 'today') {
            return txDate.getTime() === today.getTime();
        }

        if (activeDateFilter === 'week') {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - 6);
            return txDate >= weekStart && txDate <= today;
        }

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return txDate >= monthStart && txDate <= today;
    };

    const filteredTransactions = transactions
        .filter((transaction) => {
            const category = getCategoryInfo(transaction.category_id);
            const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType =
                activeFilter === 'all' ||
                (activeFilter === 'income' && transaction.type === 'income') ||
                (activeFilter === 'expense' && transaction.type === 'expense');
            const matchesCategory =
                categoryFilter === 'all' || transaction.category_id === categoryFilter;
            const matchesDate = isInDateFilter(transaction.date);

            return matchesSearch && matchesType && matchesCategory && matchesDate;
        })
        .sort((a, b) => {
            // Sort by created_at timestamp descending (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    if (loading && transactions.length === 0) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Transactions</Text>
            </View>

            {/* Transactions List */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color={Colors.text.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search transactions..."
                            placeholderTextColor={Colors.text.light}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterTabs}>
                    <TouchableOpacity
                        style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
                        onPress={() => setActiveFilter('all')}
                    >
                        <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, activeFilter === 'income' && styles.filterTabActive]}
                        onPress={() => setActiveFilter('income')}
                    >
                        <Text style={[styles.filterTabText, activeFilter === 'income' && styles.filterTabTextActive]}>
                            Income
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, activeFilter === 'expense' && styles.filterTabActive]}
                        onPress={() => setActiveFilter('expense')}
                    >
                        <Text style={[styles.filterTabText, activeFilter === 'expense' && styles.filterTabTextActive]}>
                            Expense
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.filterTabs}>
                    <TouchableOpacity
                        style={[styles.filterTab, activeDateFilter === 'all' && styles.filterTabActive]}
                        onPress={() => setActiveDateFilter('all')}
                    >
                        <Text style={[styles.filterTabText, activeDateFilter === 'all' && styles.filterTabTextActive]}>
                            All Time
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, activeDateFilter === 'today' && styles.filterTabActive]}
                        onPress={() => setActiveDateFilter('today')}
                    >
                        <Text style={[styles.filterTabText, activeDateFilter === 'today' && styles.filterTabTextActive]}>
                            Today
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, activeDateFilter === 'week' && styles.filterTabActive]}
                        onPress={() => setActiveDateFilter('week')}
                    >
                        <Text style={[styles.filterTabText, activeDateFilter === 'week' && styles.filterTabTextActive]}>
                            7 Days
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, activeDateFilter === 'month' && styles.filterTabActive]}
                        onPress={() => setActiveDateFilter('month')}
                    >
                        <Text style={[styles.filterTabText, activeDateFilter === 'month' && styles.filterTabTextActive]}>
                            This Month
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoryFilterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryFilterContent}
                        style={styles.categoryFilterScroll}
                    >
                        <TouchableOpacity
                            style={[styles.categoryChip, categoryFilter === 'all' && styles.categoryChipActive]}
                            onPress={() => setCategoryFilter('all')}
                        >
                            <Text style={[styles.categoryChipText, categoryFilter === 'all' && styles.categoryChipTextActive]}>
                                All Categories
                            </Text>
                        </TouchableOpacity>

                        {filteredCategories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.categoryChip, categoryFilter === category.id && styles.categoryChipActive]}
                                onPress={() => setCategoryFilter(category.id)}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.categoryChipText,
                                        categoryFilter === category.id && styles.categoryChipTextActive,
                                    ]}
                                >
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {filteredTransactions.map((transaction) => {
                    const category = getCategoryInfo(transaction.category_id);
                    return (
                        <TouchableOpacity
                            key={transaction.id}
                            style={styles.transactionItem}
                            onPress={() => handleEdit(transaction)}
                            onLongPress={() => handleTransactionLongPress(transaction)}
                        >
                            <View style={styles.transactionLeft}>
                                <View style={[styles.transactionIcon, { backgroundColor: `${category.color}20` }]}>
                                    <Ionicons name={category.icon as any} size={24} color={category.color} />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionTitle}>{category.name}</Text>
                                    <Text style={styles.transactionDate}>{formatDate(transaction.date, transaction.created_at)}</Text>
                                    {transaction.notes && (
                                        <Text style={styles.transactionNotes} numberOfLines={1}>
                                            {transaction.notes}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <View style={styles.transactionRight}>
                                <Text
                                    style={[
                                        styles.transactionAmount,
                                        transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                                    ]}
                                >
                                    {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                                </Text>
                                <Text style={styles.transactionActionHint}>Tap to edit</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {filteredTransactions.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color={Colors.text.light} />
                        <Text style={styles.emptyStateText}>No transactions found</Text>
                        <Text style={styles.emptyStateSubtext}>
                            {searchQuery ? 'Try a different search' : 'Add your first transaction'}
                        </Text>
                    </View>
                )}

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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.text.secondary,
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
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.text.primary,
    },
    filterTabs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    filterTab: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Colors.background.primary,
    },
    filterTabActive: {
        backgroundColor: Colors.primary,
    },
    filterTabText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    filterTabTextActive: {
        color: Colors.white,
    },
    categoryFilterContainer: {
        marginBottom: 12,
    },
    categoryFilterScroll: {
        marginHorizontal: -2,
    },
    categoryFilterContent: {
        paddingHorizontal: 2,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Colors.background.primary,
    },
    categoryChipActive: {
        backgroundColor: Colors.primary,
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    categoryChipTextActive: {
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    transactionNotes: {
        fontSize: 11,
        color: Colors.text.light,
        marginTop: 1,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionActionHint: {
        marginTop: 2,
        fontSize: 10,
        color: Colors.text.light,
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: '700',
    },
    incomeAmount: {
        color: '#22C55E',
    },
    expenseAmount: {
        color: Colors.text.primary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: Colors.text.light,
        marginTop: 8,
    },
    bottomSpacing: {
        height: 140,
    },
});

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';

type TransactionType = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
    const { transactions, loading, fetchTransactions } = useTransactions();
    const { categories } = useCategories();
    const { formatAmount } = useCurrency();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<TransactionType>('all');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    };

    const getCategoryInfo = (categoryId: string | null) => {
        if (!categoryId) return { name: 'Uncategorized', icon: 'help-outline', color: '#6B7280' };
        const category = categories.find(c => c.id === categoryId);
        return category || { name: 'Unknown', icon: 'help-outline', color: '#6B7280' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredTransactions = transactions.filter((transaction) => {
        const category = getCategoryInfo(transaction.category_id);
        const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter =
            activeFilter === 'all' ||
            (activeFilter === 'income' && transaction.type === 'income') ||
            (activeFilter === 'expense' && transaction.type === 'expense');
        return matchesSearch && matchesFilter;
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

            {/* Transactions List */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >
                {filteredTransactions.map((transaction) => {
                    const category = getCategoryInfo(transaction.category_id);
                    return (
                        <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                            <View style={styles.transactionLeft}>
                                <View style={[styles.transactionIcon, { backgroundColor: `${category.color}20` }]}>
                                    <Ionicons name={category.icon as any} size={24} color={category.color} />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionTitle}>{category.name}</Text>
                                    <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
        backgroundColor: Colors.white,
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.background.primary,
    },
    filterTabActive: {
        backgroundColor: Colors.primary,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    filterTabTextActive: {
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 13,
        color: Colors.text.secondary,
    },
    transactionNotes: {
        fontSize: 12,
        color: Colors.text.light,
        marginTop: 2,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
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
        height: 100,
    },
});

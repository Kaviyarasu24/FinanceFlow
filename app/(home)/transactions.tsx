import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type TransactionType = 'all' | 'income' | 'expense';

interface Transaction {
    id: string;
    title: string;
    date: string;
    amount: number;
    category: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
    type: 'income' | 'expense';
}

const transactions: Transaction[] = [
    {
        id: '1',
        title: 'Grocery Store',
        date: 'Today, 2:30 PM',
        amount: -89.50,
        category: 'Food & Drinks',
        icon: 'cart-outline',
        iconBg: '#E0F2FE',
        iconColor: '#0EA5E9',
        type: 'expense',
    },
    {
        id: '2',
        title: 'Salary Deposit',
        date: 'Today, 9:00 AM',
        amount: 4500.00,
        category: 'Income',
        icon: 'wallet-outline',
        iconBg: '#DCFCE7',
        iconColor: '#22C55E',
        type: 'income',
    },
    {
        id: '3',
        title: 'Netflix Subscription',
        date: 'Yesterday, 11:00 PM',
        amount: -15.99,
        category: 'Entertainment',
        icon: 'tv-outline',
        iconBg: '#F3E8FF',
        iconColor: '#A855F7',
        type: 'expense',
    },
    {
        id: '4',
        title: 'Uber Ride',
        date: 'Yesterday, 6:45 PM',
        amount: -24.50,
        category: 'Transport',
        icon: 'car-outline',
        iconBg: '#FEE2E2',
        iconColor: '#EF4444',
        type: 'expense',
    },
    {
        id: '5',
        title: 'Freelance Payment',
        date: 'Jan 15, 3:00 PM',
        amount: 850.00,
        category: 'Income',
        icon: 'briefcase-outline',
        iconBg: '#DCFCE7',
        iconColor: '#22C55E',
        type: 'income',
    },
    {
        id: '6',
        title: 'Electric Bill',
        date: 'Jan 17, 10:00 AM',
        amount: -125.00,
        category: 'Utilities',
        icon: 'flash-outline',
        iconBg: '#FEF3C7',
        iconColor: '#F59E0B',
        type: 'expense',
    },
    {
        id: '7',
        title: 'Coffee Shop',
        date: 'Jan 17, 8:30 AM',
        amount: -6.50,
        category: 'Food & Drinks',
        icon: 'cafe-outline',
        iconBg: '#E0F2FE',
        iconColor: '#0EA5E9',
        type: 'expense',
    },
    {
        id: '8',
        title: 'Gym Membership',
        date: 'Jan 16, 12:00 PM',
        amount: -50.00,
        category: 'Health',
        icon: 'fitness-outline',
        iconBg: '#DBEAFE',
        iconColor: '#3B82F6',
        type: 'expense',
    },
];

export default function TransactionsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<TransactionType>('all');

    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            activeFilter === 'all' ||
            (activeFilter === 'income' && transaction.type === 'income') ||
            (activeFilter === 'expense' && transaction.type === 'expense');
        return matchesSearch && matchesFilter;
    });

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
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="options-outline" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
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
            >
                {filteredTransactions.map((transaction) => (
                    <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                            <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBg }]}>
                                <Ionicons name={transaction.icon} size={24} color={transaction.iconColor} />
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                                <Text style={styles.transactionDate}>{transaction.date}</Text>
                            </View>
                        </View>
                        <View style={styles.transactionRight}>
                            <Text
                                style={[
                                    styles.transactionAmount,
                                    transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                                ]}
                            >
                                {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </Text>
                            <View
                                style={[
                                    styles.categoryBadge,
                                    transaction.type === 'income' ? styles.incomeBadge : styles.expenseBadge,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.categoryBadgeText,
                                        transaction.type === 'income' ? styles.incomeBadgeText : styles.expenseBadgeText,
                                    ]}
                                >
                                    {transaction.category}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {filteredTransactions.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color={Colors.text.light} />
                        <Text style={styles.emptyStateText}>No transactions found</Text>
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
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
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
    transactionRight: {
        alignItems: 'flex-end',
        gap: 6,
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
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    incomeBadge: {
        backgroundColor: '#DCFCE7',
    },
    expenseBadge: {
        backgroundColor: Colors.background.primary,
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    incomeBadgeText: {
        color: '#22C55E',
    },
    expenseBadgeText: {
        color: Colors.text.secondary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: Colors.text.secondary,
        marginTop: 16,
    },
    bottomSpacing: {
        height: 100,
    },
});

import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
    const { transactions, loading } = useTransactions();
    const { formatAmount, getCurrencySymbol } = useCurrency();

    // Calculate analytics data
    const analytics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Current month transactions
        const currentMonthTrans = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const income = currentMonthTrans
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = currentMonthTrans
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
        const savings = income - expense;

        // Last 6 months data
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const targetDate = new Date(currentYear, currentMonth - i, 1);
            const monthTrans = transactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === targetDate.getMonth() &&
                    date.getFullYear() === targetDate.getFullYear();
            });

            const monthIncome = monthTrans
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const monthExpense = monthTrans
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            monthlyData.push({
                month: targetDate.toLocaleDateString('en-US', { month: 'short' }),
                income: monthIncome,
                expense: monthExpense,
            });
        }

        // Category breakdown (expenses only)
        const categoryTotals: any = {};
        let totalExpense = 0;
        currentMonthTrans
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (!categoryTotals[t.category_id]) {
                    categoryTotals[t.category_id] = 0;
                }
                categoryTotals[t.category_id] += t.amount;
                totalExpense += t.amount;
            });

        const categoryBreakdown = Object.entries(categoryTotals)
            .map(([id, amount]: [string, any]) => ({
                id,
                amount,
                percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4);

        return {
            income,
            expense,
            savingsRate,
            savings,
            monthlyData,
            categoryBreakdown,
        };
    }, [transactions]);

    const getMonthYear = () => {
        const now = new Date();
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const maxValue = Math.max(...analytics.monthlyData.map(d => Math.max(d.income, d.expense)), 1);

    const categoryColors = ['#F97316', '#3B82F6', '#EC4899', '#A855F7'];
    const categoryNames = ['Food', 'Transport', 'Shopping', 'Other'];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <Text style={styles.headerSubtitle}>{getMonthYear()}</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Income & Expense Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="trending-up-outline" size={20} color="#22C55E" />
                            <Text style={styles.statLabel}>Income</Text>
                        </View>
                        <Text style={styles.statValue}>{formatAmount(analytics.income)}</Text>
                        <Text style={styles.statChange}>This month</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="trending-down-outline" size={20} color="#EF4444" />
                            <Text style={styles.statLabel}>Expense</Text>
                        </View>
                        <Text style={styles.statValue}>{formatAmount(analytics.expense)}</Text>
                        <Text style={styles.statChangeNegative}>This month</Text>
                    </View>
                </View>

                {/* Spending by Category */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Top Spending Categories</Text>

                    {analytics.categoryBreakdown.length > 0 ? (
                        <View style={styles.legend}>
                            {analytics.categoryBreakdown.map((cat, index) => (
                                <View key={cat.id} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: categoryColors[index] }]} />
                                    <Text style={styles.legendText}>{categoryNames[index] || 'Category'}</Text>
                                    <Text style={styles.legendPercent}>{cat.percentage.toFixed(1)}%</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No expense data for this month</Text>
                    )}
                </View>

                {/* Income vs Expense Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Income vs Expense (Last 6 Months)</Text>

                    <View style={styles.barChartContainer}>
                        {/* Y-axis labels */}
                        <View style={styles.yAxis}>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}{(maxValue).toFixed(0)}</Text>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}{(maxValue * 0.75).toFixed(0)}</Text>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}{(maxValue * 0.5).toFixed(0)}</Text>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}{(maxValue * 0.25).toFixed(0)}</Text>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}0</Text>
                        </View>

                        {/* Bar Chart */}
                        <View style={styles.barChart}>
                            {analytics.monthlyData.map((data, index) => {
                                const incomeHeight = (data.income / maxValue) * 100;
                                const expenseHeight = (data.expense / maxValue) * 100;
                                return (
                                    <View key={index} style={styles.barGroup}>
                                        <View style={styles.barPair}>
                                            <View style={[styles.bar, styles.incomeBar, { height: `${incomeHeight || 5}%` }]} />
                                            <View style={[styles.bar, styles.expenseBar, { height: `${expenseHeight || 5}%` }]} />
                                        </View>
                                        <Text style={styles.barLabel}>{data.month}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Chart Legend */}
                    <View style={styles.chartLegend}>
                        <View style={styles.chartLegendItem}>
                            <View style={[styles.chartLegendDot, { backgroundColor: '#22C55E' }]} />
                            <Text style={styles.chartLegendText}>Income</Text>
                        </View>
                        <View style={styles.chartLegendItem}>
                            <View style={[styles.chartLegendDot, { backgroundColor: '#94A3B8' }]} />
                            <Text style={styles.chartLegendText}>Expense</Text>
                        </View>
                    </View>
                </View>

                {/* Savings Rate */}
                <View style={styles.savingsCard}>
                    <View style={styles.savingsLeft}>
                        <Text style={styles.savingsLabel}>Savings Rate</Text>
                        <Text style={styles.savingsValue}>{analytics.savingsRate.toFixed(1)}%</Text>
                        <Text style={styles.savingsSubtext}>
                            You are {analytics.savings >= 0 ? 'saving' : 'overspending'} {formatAmount(Math.abs(analytics.savings))} this month
                        </Text>
                    </View>
                    <View style={styles.savingsIcon}>
                        <Ionicons name="cash-outline" size={32} color={Colors.primary} />
                    </View>
                </View>

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
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 14,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    statChange: {
        fontSize: 12,
        color: '#22C55E',
    },
    statChangeNegative: {
        fontSize: 12,
        color: '#EF4444',
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 20,
    },
    legend: {
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        flex: 1,
        fontSize: 14,
        color: Colors.text.primary,
    },
    legendPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        paddingVertical: 20,
    },
    barChartContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    yAxis: {
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    yAxisLabel: {
        fontSize: 11,
        color: Colors.text.secondary,
    },
    barChart: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 180,
        paddingBottom: 8,
    },
    barGroup: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    barPair: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        width: '100%',
        justifyContent: 'center',
    },
    bar: {
        width: 8,
        borderRadius: 4,
    },
    incomeBar: {
        backgroundColor: '#22C55E',
    },
    expenseBar: {
        backgroundColor: '#94A3B8',
    },
    barLabel: {
        fontSize: 11,
        color: Colors.text.secondary,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
    },
    chartLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    chartLegendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    chartLegendText: {
        fontSize: 13,
        color: Colors.text.secondary,
    },
    savingsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E0F2FE',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    savingsLeft: {
        flex: 1,
    },
    savingsLabel: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: 8,
    },
    savingsValue: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    savingsSubtext: {
        fontSize: 13,
        color: Colors.primary,
    },
    savingsIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSpacing: {
        height: 100,
    },
});

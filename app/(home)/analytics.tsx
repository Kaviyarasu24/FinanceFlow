import { Colors } from '@/constants/Colors';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Donut Chart Component
const DonutChart = ({ data, colors }: { data: any[], colors: string[] }) => {
    const size = 140;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const centerX = size / 2;
    const centerY = size / 2;

    let currentAngle = -90; // Start from top

    return (
        <Svg width={size} height={size}>
            <G rotation={0} origin={`${centerX}, ${centerY}`}>
                {data.map((item, index) => {
                    const angle = (item.percentage / 100) * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;

                    // Calculate the stroke dash array for the arc
                    const arcLength = (angle / 360) * circumference;
                    const strokeDasharray = `${arcLength} ${circumference}`;
                    
                    // Calculate rotation for this segment
                    const rotationAngle = startAngle + 90;

                    return (
                        <Circle
                            key={item.id}
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            stroke={colors[index]}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={0}
                            rotation={rotationAngle}
                            origin={`${centerX}, ${centerY}`}
                            strokeLinecap="round"
                        />
                    );
                })}
            </G>
        </Svg>
    );
};

export default function AnalyticsScreen() {
    const { transactions, loading, fetchTransactions } = useTransactions();
    const { formatAmount, getCurrencySymbol } = useCurrency();
    const { categories } = useCategories();

    // State for selected month/year
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Refresh transactions when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    // Navigate to next month
    const goToNextMonth = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    // Check if we can go to next month (don't go beyond current month)
    const canGoNext = () => {
        const now = new Date();
        const currentYearMonth = now.getFullYear() * 12 + now.getMonth();
        const selectedYearMonth = selectedDate.getFullYear() * 12 + selectedDate.getMonth();
        return selectedYearMonth < currentYearMonth;
    };

    // Calculate analytics data
    const analytics = useMemo(() => {
        const currentMonth = selectedDate.getMonth();
        const currentYear = selectedDate.getFullYear();

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
            .map(([id, amount]: [string, any]) => {
                const category = categories.find(c => c.id === id);
                return {
                    id,
                    name: category?.name || 'Unknown',
                    icon: category?.icon || 'help-circle-outline',
                    amount,
                    percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
                };
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        return {
            income,
            expense,
            savingsRate,
            savings,
            monthlyData,
            categoryBreakdown,
        };
    }, [transactions, categories, selectedDate]);

    const getMonthYear = () => {
        return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const maxValue = Math.max(...analytics.monthlyData.map(d => Math.max(d.income, d.expense)), 1);

    const categoryColors = ['#F97316', '#3B82F6', '#EC4899', '#A855F7', '#22C55E'];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <View style={styles.dateNavigator}>
                        <TouchableOpacity 
                            onPress={goToPreviousMonth}
                            style={styles.navButton}
                        >
                            <Ionicons name="chevron-back" size={20} color={Colors.text.secondary} />
                        </TouchableOpacity>
                        <Text style={styles.headerSubtitle}>{getMonthYear()}</Text>
                        <TouchableOpacity 
                            onPress={goToNextMonth}
                            style={[styles.navButton, !canGoNext() && styles.navButtonDisabled]}
                            disabled={!canGoNext()}
                        >
                            <Ionicons 
                                name="chevron-forward" 
                                size={20} 
                                color={canGoNext() ? Colors.text.secondary : Colors.text.light} 
                            />
                        </TouchableOpacity>
                    </View>
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
                    <Text style={styles.cardTitle}>Spending by Category</Text>

                    {analytics.categoryBreakdown.length > 0 ? (
                        <View style={styles.donutContainer}>
                            {/* Donut Chart */}
                            <View style={styles.donutChartWrapper}>
                                <DonutChart data={analytics.categoryBreakdown} colors={categoryColors} />
                            </View>

                            {/* Category Legend */}
                            <View style={styles.categoryLegend}>
                                {analytics.categoryBreakdown.map((cat, index) => (
                                    <View key={cat.id} style={styles.categoryLegendItem}>
                                        <View style={styles.categoryLegendLeft}>
                                            <View style={[styles.legendDot, { backgroundColor: categoryColors[index] }]} />
                                            <Text style={styles.categoryLegendText}>{cat.name}</Text>
                                        </View>
                                        <Text style={styles.categoryLegendPercent}>{cat.percentage.toFixed(0)}%</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No expense data for this month</Text>
                    )}
                </View>

                {/* Income vs Expense Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Income vs Expense</Text>

                    <View style={styles.barChartContainer}>
                        {/* Y-axis labels */}
                        <View style={styles.yAxis}>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}{(maxValue / 1000).toFixed(0)}k</Text>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}{(maxValue * 0.75 / 1000).toFixed(1)}k</Text>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}{(maxValue * 0.5 / 1000).toFixed(1)}k</Text>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}{(maxValue * 0.25 / 1000).toFixed(1)}k</Text>
                            <Text style={styles.yAxisLabel}>{getCurrencySymbol()}0k</Text>
                        </View>

                        {/* Bar Chart */}
                        <View style={styles.barChart}>
                            {analytics.monthlyData.map((data, index) => {
                                const incomeHeight = data.income > 0 ? Math.max((data.income / maxValue) * 180, 8) : 0;
                                const expenseHeight = data.expense > 0 ? Math.max((data.expense / maxValue) * 180, 8) : 0;
                                return (
                                    <View key={index} style={styles.barGroup}>
                                        <View style={styles.barPair}>
                                            {/* Income Bar */}
                                            {data.income > 0 ? (
                                                <View style={[styles.bar, styles.incomeBar, { height: incomeHeight }]} />
                                            ) : (
                                                <View style={styles.barPlaceholder} />
                                            )}
                                            {/* Expense Bar */}
                                            {data.expense > 0 ? (
                                                <View style={[styles.bar, styles.expenseBar, { height: expenseHeight }]} />
                                            ) : (
                                                <View style={styles.barPlaceholder} />
                                            )}
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
                            <View style={[styles.chartLegendDot, { backgroundColor: '#FBBF24' }]} />
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
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    dateNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    navButton: {
        padding: 4,
    },
    navButtonDisabled: {
        opacity: 0.3,
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
    donutContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        justifyContent: 'space-between',
    },
    donutChartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryLegend: {
        flex: 1,
        gap: 10,
    },
    categoryLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryLegendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryLegendText: {
        fontSize: 13,
        color: Colors.text.primary,
    },
    categoryLegendPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    categoryBarsContainer: {
        gap: 16,
    },
    categoryBarWrapper: {
        gap: 8,
    },
    categoryBarInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    categoryBarName: {
        fontSize: 14,
        color: Colors.text.primary,
        fontWeight: '500',
    },
    categoryBarAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    categoryBarTrack: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    categoryBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    categoryBarPercent: {
        fontSize: 12,
        color: Colors.text.secondary,
        textAlign: 'right',
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
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    barPair: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        height: 180,
        justifyContent: 'center',
    },
    barPlaceholder: {
        width: 12,
        height: 0,
    },
    bar: {
        width: 12,
        borderRadius: 6,
    },
    incomeBar: {
        backgroundColor: '#22C55E',
    },
    expenseBar: {
        backgroundColor: '#FBBF24',
    },
    emptyBar: {
        width: 8,
        height: 4,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
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

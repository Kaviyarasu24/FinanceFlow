import { CalendarDatePicker } from '@/components/ui/calendar-date-picker';
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

// Type definitions
interface CategoryBreakdown {
    id: string;
    name: string;
    icon: string;
    amount: number;
    percentage: number;
}

interface ChartData {
    month: string;
    income: number;
    expense: number;
}

interface Transaction {
    date: string;
    type: 'income' | 'expense';
    amount: number;
    category_id: string;
}

// Helper functions
const isSameMonth = (date1: Date, date2: Date): boolean => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
};

const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
};

const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
    const d = new Date(date);
    const s = new Date(start);
    const e = new Date(end);
    s.setHours(0, 0, 0, 0);
    e.setHours(23, 59, 59, 999);
    return d >= s && d <= e;
};

const calculateCategoryBreakdown = (
    transactions: Transaction[],
    categories: any[],
    maxItems: number = 5
): CategoryBreakdown[] => {
    const categoryTotals: Record<string, number> = {};
    let totalExpense = 0;

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categoryTotals[t.category_id] = (categoryTotals[t.category_id] || 0) + t.amount;
            totalExpense += t.amount;
        });

    return Object.entries(categoryTotals)
        .map(([id, amount]) => {
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
        .slice(0, maxItems);
};

const calculateIncome = (transactions: Transaction[]): number =>
    transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

const calculateExpense = (transactions: Transaction[]): number =>
    transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

// Donut Chart Component
interface DonutChartProps {
    data: CategoryBreakdown[];
    colors: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({ data, colors }) => {
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

    // State for view type and selected date
    const [viewType, setViewType] = useState<'month' | 'day' | 'range'>('month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [rangeStartDate, setRangeStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [rangeEndDate, setRangeEndDate] = useState(new Date());

    // Refresh transactions when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [fetchTransactions])
    );

    const today = useMemo(() => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        return now;
    }, []);

    // Calculate analytics data
    const analytics = useMemo(() => {
        if (viewType === 'month') {
            const filteredTrans = transactions.filter(t => isSameMonth(new Date(t.date), selectedDate));
            const income = calculateIncome(filteredTrans);
            const expense = calculateExpense(filteredTrans);
            const savings = income - expense;

            // Last 6 months data
            const monthlyData: ChartData[] = [];
            for (let i = 5; i >= 0; i--) {
                const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
                const monthTrans = transactions.filter(t => isSameMonth(new Date(t.date), targetDate));
                monthlyData.push({
                    month: targetDate.toLocaleDateString('en-US', { month: 'short' }),
                    income: calculateIncome(monthTrans),
                    expense: calculateExpense(monthTrans),
                });
            }

            return {
                income,
                expense,
                savingsRate: income > 0 ? ((savings) / income) * 100 : 0,
                savings,
                monthlyData,
                categoryBreakdown: calculateCategoryBreakdown(filteredTrans, categories),
            };
        } else if (viewType === 'day') {
            const filteredTrans = transactions.filter(t => isSameDay(new Date(t.date), selectedDate));
            const income = calculateIncome(filteredTrans);
            const expense = calculateExpense(filteredTrans);
            const savings = income - expense;

            // Last 7 days data
            const dailyData: ChartData[] = [];
            for (let i = 6; i >= 0; i--) {
                const targetDate = new Date(selectedDate);
                targetDate.setDate(selectedDate.getDate() - i);
                const dayTrans = transactions.filter(t => isSameDay(new Date(t.date), targetDate));
                dailyData.push({
                    month: targetDate.toLocaleDateString('en-US', { weekday: 'short' }),
                    income: calculateIncome(dayTrans),
                    expense: calculateExpense(dayTrans),
                });
            }

            return {
                income,
                expense,
                savingsRate: income > 0 ? ((savings) / income) * 100 : 0,
                savings,
                monthlyData: dailyData,
                categoryBreakdown: calculateCategoryBreakdown(filteredTrans, categories),
            };
        } else {
            // Range view
            const filteredTrans = transactions.filter(t =>
                isDateInRange(new Date(t.date), rangeStartDate, rangeEndDate)
            );
            const income = calculateIncome(filteredTrans);
            const expense = calculateExpense(filteredTrans);
            const savings = income - expense;

            // Daily breakdown
            const rangeData: ChartData[] = [];
            const currentDate = new Date(rangeStartDate);
            while (currentDate <= rangeEndDate) {
                const dayTrans = transactions.filter(t => isSameDay(new Date(t.date), currentDate));
                rangeData.push({
                    month: currentDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                    income: calculateIncome(dayTrans),
                    expense: calculateExpense(dayTrans),
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return {
                income,
                expense,
                savingsRate: income > 0 ? ((savings) / income) * 100 : 0,
                savings,
                monthlyData: rangeData,
                categoryBreakdown: calculateCategoryBreakdown(filteredTrans, categories),
            };
        }
    }, [transactions, categories, selectedDate, viewType, rangeStartDate, rangeEndDate]);

    // Calculate max value for chart (must be before loading check to maintain hook order)
    const maxValue = useMemo(
        () => Math.max(...analytics.monthlyData.map(d => Math.max(d.income, d.expense)), 1),
        [analytics.monthlyData]
    );

    const getMonthYear = () => {
        if (viewType === 'month') {
            return selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else if (viewType === 'day') {
            return selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        } else {
            const startStr = rangeStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endStr = rangeEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `${startStr} - ${endStr}`;
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} testID="loading-spinner" />
                <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
        );
    }

    const categoryColors = ['#F97316', '#3B82F6', '#EC4899', '#A855F7', '#22C55E'];
    const isNarrowScreen = width < 360;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Analytics</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* View Type Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        onPress={() => setViewType('month')}
                        style={[styles.toggleButton, viewType === 'month' && styles.toggleButtonActive]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.toggleButtonText, viewType === 'month' && styles.toggleButtonTextActive]}>
                            Monthly
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setViewType('day')}
                        style={[styles.toggleButton, viewType === 'day' && styles.toggleButtonActive]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.toggleButtonText, viewType === 'day' && styles.toggleButtonTextActive]}>
                            Daily
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setViewType('range')}
                        style={[styles.toggleButton, viewType === 'range' && styles.toggleButtonActive]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.toggleButtonText, viewType === 'range' && styles.toggleButtonTextActive]}>
                            Range
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dateNavigator}>
                    {viewType === 'range' ? (
                        <View style={styles.rangeDateContainer}>
                            <View style={styles.rangeDateItem}>
                                <Text style={styles.rangeDateLabel}>Start date</Text>
                                <CalendarDatePicker
                                    date={rangeStartDate}
                                    onDateChange={(date) => {
                                        setRangeStartDate(date);
                                        if (date > rangeEndDate) {
                                            setRangeEndDate(date);
                                        }
                                    }}
                                    maximumDate={today}
                                />
                            </View>
                            <View style={styles.rangeDateItem}>
                                <Text style={styles.rangeDateLabel}>End date</Text>
                                <CalendarDatePicker
                                    date={rangeEndDate}
                                    onDateChange={(date) => {
                                        setRangeEndDate(date);
                                        if (date < rangeStartDate) {
                                            setRangeStartDate(date);
                                        }
                                    }}
                                    maximumDate={today}
                                />
                            </View>
                        </View>
                    ) : (
                        <CalendarDatePicker
                            date={selectedDate}
                            onDateChange={setSelectedDate}
                            maximumDate={today}
                            mode={viewType === 'month' ? 'month-year' : 'date'}
                        />
                    )}

                    <Text style={styles.monthText}>{getMonthYear()}</Text>
                </View>

                {/* Income & Expense Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="trending-up-outline" size={20} color="#22C55E" />
                            <Text style={styles.statLabel}>Income</Text>
                        </View>
                        <Text style={styles.statValue}>{formatAmount(analytics.income)}</Text>
                        <Text style={styles.statChange}>This {viewType === 'month' ? 'month' : viewType === 'day' ? 'day' : 'period'}</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="trending-down-outline" size={20} color="#EF4444" />
                            <Text style={styles.statLabel}>Expense</Text>
                        </View>
                        <Text style={styles.statValue}>{formatAmount(analytics.expense)}</Text>
                        <Text style={styles.statChangeNegative}>This {viewType === 'month' ? 'month' : viewType === 'day' ? 'day' : 'period'}</Text>
                    </View>
                </View>

                {/* Spending by Category */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Spending by Category</Text>

                    {analytics.categoryBreakdown.length > 0 ? (
                        <View style={[styles.donutContainer, isNarrowScreen && styles.donutContainerStacked]}>
                            {/* Donut Chart */}
                            <View style={[styles.donutChartWrapper, isNarrowScreen && styles.donutChartWrapperStacked]}>
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
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="pie-chart-outline" size={48} color={Colors.text.light} />
                            <Text style={styles.emptyText}>
                                No expenses {viewType === 'month' ? 'this month' : viewType === 'day' ? 'today' : 'in this period'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                When you add expenses, they will appear here
                            </Text>
                        </View>
                    )}
                </View>

                {/* Income vs Expense Chart - Only show for month view */}
                {(viewType === 'month') && (
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
                )}

                {/* Savings Rate */}
                <View style={styles.savingsCard}>
                    <View style={styles.savingsLeft}>
                        <Text style={styles.savingsLabel}>Savings Rate</Text>
                        <Text style={styles.savingsValue}>{analytics.savingsRate.toFixed(1)}%</Text>
                        <Text style={styles.savingsSubtext}>
                            You are {analytics.savings >= 0 ? 'saving' : 'overspending'} {formatAmount(Math.abs(analytics.savings))} this {viewType === 'month' ? 'month' : viewType === 'day' ? 'day' : 'period'}
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
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
    header: {
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    dateNavigator: {
        alignItems: 'stretch',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    monthText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
        textAlign: 'left',
    },
    rangeDateContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    rangeDateItem: {
        flex: 1,
        gap: 6,
        minWidth: 140,
    },
    rangeDateLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
        gap: 8,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleButtonActive: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    toggleButtonTextActive: {
        color: Colors.primary,
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
    donutContainerStacked: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    donutChartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutChartWrapperStacked: {
        marginBottom: 16,
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
        flex: 1,
        paddingRight: 12,
    },
    categoryLegendText: {
        fontSize: 13,
        color: Colors.text.primary,
        flexShrink: 1,
    },
    categoryLegendPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
        minWidth: 36,
        textAlign: 'right',
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
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    emptySubtext: {
        fontSize: 13,
        color: Colors.text.light,
        textAlign: 'center',
        marginTop: 4,
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
        height: 140,
    },
});

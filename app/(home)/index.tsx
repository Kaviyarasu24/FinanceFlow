import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { user } = useAuth();
    const { transactions, loading, fetchTransactions } = useTransactions();
    const { formatAmount } = useCurrency();
    const [profile, setProfile] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        fetchProfile();
        fetchCategories();
    }, [user]);

    // Refresh transactions and profile when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
            fetchProfile();
        }, [user])
    );

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data) setProfile(data);
    };

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*');
        if (data) setCategories(data);
    };

    // Calculate statistics from transactions
    const stats = useMemo(() => {
        const now = new Date();
        
        // Get the start of the current week (Monday)
        const currentDayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Days since last Monday
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - daysFromMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        // Get the end of the current week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Format week date range (Mon - Sun)
        const weekDateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        // Get weekly transactions
        const weeklyTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            date.setHours(0, 0, 0, 0);
            return date >= weekStart && date <= weekEnd;
        });

        const totalSpent = weeklyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = weeklyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const remaining = totalIncome - totalSpent;

        // Calculate weekly spending for chart (Mon-Sun of current week)
        const weeklyData = Array(7).fill(0); // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]

        transactions.forEach(t => {
            if (t.type === 'expense') {
                const transactionDate = new Date(t.date);
                transactionDate.setHours(0, 0, 0, 0);
                
                // Check if transaction is within current week
                if (transactionDate >= weekStart && transactionDate <= weekEnd) {
                    // Get the day of week for the transaction (0=Sun, 1=Mon, ..., 6=Sat)
                    const transactionDayOfWeek = transactionDate.getDay();
                    // Convert to our array index (0=Mon, 1=Tue, ..., 6=Sun)
                    const dayIndex = transactionDayOfWeek === 0 ? 6 : transactionDayOfWeek - 1;
                    weeklyData[dayIndex] += t.amount;
                }
            }
        });

        const weekTotal = weeklyData.reduce((sum, val) => sum + val, 0);

        // Calculate top categories
        const categoryTotals: any = {};
        weeklyTransactions
            .forEach(t => {
                if (!categoryTotals[t.category_id]) {
                    categoryTotals[t.category_id] = { total: 0, count: 0, type: t.type };
                } else if (categoryTotals[t.category_id].type !== t.type) {
                    categoryTotals[t.category_id].type = 'mixed';
                }
                categoryTotals[t.category_id].total += t.amount;
                categoryTotals[t.category_id].count += 1;
            });

        const topCategories = Object.entries(categoryTotals)
            .map(([categoryId, data]: [string, any]) => {
                const category = categories.find(c => c.id === categoryId);
                return {
                    id: categoryId,
                    name: category?.name || 'Unknown',
                    icon: category?.icon || 'help-circle-outline',
                    color: category?.color || '#6B7280',
                    total: data.total,
                    count: data.count,
                    type: data.type,
                };
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);

        // Calculate last 6 months trend
        const trendDate = new Date();
        const trendMonth = trendDate.getMonth();
        const trendYear = trendDate.getFullYear();
        const monthlyTrend = [];

        for (let i = 5; i >= 0; i--) {
            const targetDate = new Date(trendYear, trendMonth - i, 1);
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' &&
                    tDate.getMonth() === targetDate.getMonth() &&
                    tDate.getFullYear() === targetDate.getFullYear();
            });

            const monthTotal = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
            monthlyTrend.push({
                month: targetDate.toLocaleDateString('en-US', { month: 'short' }),
                total: monthTotal
            });
        }

        return {
            totalSpent,
            totalIncome,
            remaining,
            weeklyData,
            weekTotal,
            topCategories,
            monthlyTrend,
            weekDateRange,
        };
    }, [transactions, categories]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {profile?.full_name ? getInitials(profile.full_name) : (user?.email?.[0]?.toUpperCase() || 'U')}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()},</Text>
                        <Text style={styles.userName}>
                            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Week Date Range Header */}
                <View style={styles.weekHeaderContainer}>
                    <Text style={styles.weekHeaderText}>This week: {stats.weekDateRange}</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, styles.statCardPrimary]}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="wallet-outline" size={20} color={Colors.white} />
                        </View>
                        <Text style={styles.statLabel}>Total Spent</Text>
                        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>{formatAmount(stats.totalSpent)}</Text>
                    </View>

                    <View style={[styles.statCard, styles.statCardLight]}>
                        <View style={[styles.statIconContainer, styles.statIconGray]}>
                            <Ionicons name="trending-up-outline" size={20} color={Colors.text.secondary} />
                        </View>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Total Income</Text>
                        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statValue, styles.statValueDark]}>{formatAmount(stats.totalIncome)}</Text>
                    </View>

                    <View style={[styles.statCard, styles.statCardOrange]}>
                        <View style={[styles.statIconContainer, styles.statIconOrange]}>
                            <Ionicons name="cash-outline" size={20} color="#F59E0B" />
                        </View>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Balance</Text>
                        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statValue, styles.statValueDark]}>{formatAmount(stats.remaining)}</Text>
                    </View>
                </View>

                {/* This Week Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>This Week</Text>
                        <Text style={styles.chartTotal}>{formatAmount(stats.weekTotal)} total</Text>
                    </View>
                    <View style={styles.barChart}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                            const maxHeight = Math.max(...stats.weeklyData, 1);
                            const height = (stats.weeklyData[index] / maxHeight) * 100;
                            // Calculate current day index (0=Mon, 1=Tue, ..., 6=Sun)
                            const todayDayOfWeek = new Date().getDay();
                            const todayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
                            const isToday = index === todayIndex;
                            return (
                                <View key={day} style={styles.barContainer}>
                                    <View style={styles.barWrapper}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: height || 10,
                                                    backgroundColor: isToday ? Colors.primary : '#E5E7EB',
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{day}</Text>
                                    {isToday && <View style={styles.todayIndicator} />}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Monthly Trend */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Monthly Trend</Text>
                        <View style={styles.legendContainer}>
                            <View style={styles.legendDot} />
                            <Text style={styles.legendText}>Spending</Text>
                        </View>
                    </View>
                    <View style={styles.lineChartContainer}>
                        {/* Smooth line chart */}
                        <View style={styles.lineChart}>
                            {(() => {
                                const chartWidth = width - 80;
                                const chartHeight = 100;
                                const maxValue = Math.max(...stats.monthlyTrend.map(m => m.total), 1);
                                const points = stats.monthlyTrend.map((data, index) => {
                                    const x = (index / (stats.monthlyTrend.length - 1)) * chartWidth;
                                    const y = chartHeight - ((data.total / maxValue) * chartHeight * 0.8);
                                    return { x, y };
                                });

                                // Create smooth curve path using quadratic bezier curves
                                let pathData = `M ${points[0].x} ${points[0].y}`;
                                for (let i = 0; i < points.length - 1; i++) {
                                    const current = points[i];
                                    const next = points[i + 1];
                                    const controlX = (current.x + next.x) / 2;
                                    pathData += ` Q ${controlX} ${current.y}, ${next.x} ${next.y}`;
                                }

                                // Create area fill path
                                let areaPath = pathData + ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

                                return (
                                    <Svg width={chartWidth} height={chartHeight} style={{ marginHorizontal: 20 }}>
                                        <Defs>
                                            <LinearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                <Stop offset="0" stopColor="#10B981" stopOpacity="0.3" />
                                                <Stop offset="1" stopColor="#10B981" stopOpacity="0.05" />
                                            </LinearGradient>
                                        </Defs>
                                        <Path
                                            d={areaPath}
                                            fill="url(#lineGradient)"
                                        />
                                        <Path
                                            d={pathData}
                                            stroke="#10B981"
                                            strokeWidth="3"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </Svg>
                                );
                            })()}
                        </View>
                        <View style={styles.monthLabels}>
                            {stats.monthlyTrend.map((data, index) => (
                                <Text key={index} style={styles.monthLabel}>
                                    {data.month}
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Top Categories */}
                <View style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>Top Categories</Text>
                        <Text style={styles.categorySubtitle}>This week</Text>
                    </View>

                    {stats.topCategories.length > 0 ? (
                        stats.topCategories.map((cat: any, index: number) => {
                            const isIncome = cat.type === 'income';
                            const isExpense = cat.type === 'expense';
                            return (
                                <TouchableOpacity key={index} style={styles.categoryItem}>
                                <View style={styles.categoryLeft}>
                                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                                        <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                                    </View>
                                    <View>
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                        <Text style={styles.categorySubtext}>{cat.count} transactions</Text>
                                    </View>
                                </View>
                                <View style={styles.categoryRight}>
                                    <Text
                                        style={[
                                            styles.categoryAmount,
                                            isIncome ? styles.categoryAmountIncome : styles.categoryAmountExpense,
                                        ]}
                                    >
                                        {isIncome ? '+' : isExpense ? '-' : ''}{formatAmount(cat.total)}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                                </View>
                            </TouchableOpacity>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>No transactions this month</Text>
                    )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: Colors.white,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
    },
    greeting: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 18,
        minHeight: 136,
    },
    statCardPrimary: {
        backgroundColor: Colors.primary,
    },
    statCardLight: {
        backgroundColor: '#F3F4F6',
    },
    statCardOrange: {
        backgroundColor: '#FEF3C7',
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statIconGray: {
        backgroundColor: '#E5E7EB',
    },
    statIconOrange: {
        backgroundColor: '#FDE68A',
    },
    statLabel: {
        fontSize: 12,
        color: Colors.white,
        marginBottom: 6,
        opacity: 0.9,
        fontWeight: '500',
    },
    statLabelDark: {
        color: Colors.text.secondary,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statValueDark: {
        color: Colors.text.primary,
    },
    statSubtext: {
        fontSize: 11,
        color: Colors.white,
        opacity: 0.8,
    },
    statSubtextDark: {
        color: Colors.text.secondary,
    },
    chartCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    chartTotal: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    barChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
    },
    barWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
        alignItems: 'center',
    },
    bar: {
        width: 24,
        borderRadius: 6,
    },
    barLabel: {
        fontSize: 11,
        color: Colors.text.secondary,
        marginTop: 8,
    },
    barLabelToday: {
        color: Colors.primary,
        fontWeight: '600',
    },
    todayIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginTop: 4,
        alignSelf: 'center',
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    legendText: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    lineChartContainer: {
        marginTop: 10,
    },
    lineChart: {
        height: 120,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 10,
    },
    lineChartPlaceholder: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    monthLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    monthLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
    categoryCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    seeAllButton: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    categoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    categoryAmountIncome: {
        color: '#22C55E',
    },
    categoryAmountExpense: {
        color: Colors.text.primary,
    },
    lastUpdated: {
        fontSize: 12,
        color: Colors.text.light,
        textAlign: 'center',
        marginTop: 16,
        paddingTop: 16,
    },
    weekHeaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(20, 184, 166, 0.08)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(20, 184, 166, 0.15)',
    },
    weekHeaderText: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.primary,
        letterSpacing: -0.3,
    },
    bottomSpacing: {
        height: 140,
    },
});

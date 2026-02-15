import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { user } = useAuth();
    const { transactions, loading } = useTransactions();
    const { formatAmount } = useCurrency();
    const [profile, setProfile] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        fetchProfile();
        fetchCategories();
    }, [user]);

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
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalSpent = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate weekly spending for chart
        const weeklyData = Array(7).fill(0);
        const today = now.getDay(); // 0 = Sunday, 6 = Saturday

        transactions.forEach(t => {
            if (t.type === 'expense') {
                const transactionDate = new Date(t.date);
                const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff >= 0 && daysDiff < 7) {
                    const dayIndex = (7 - daysDiff) % 7;
                    weeklyData[dayIndex] += t.amount;
                }
            }
        });

        const weekTotal = weeklyData.reduce((sum, val) => sum + val, 0);

        // Calculate top categories
        const categoryTotals: any = {};
        monthlyTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (!categoryTotals[t.category_id]) {
                    categoryTotals[t.category_id] = { total: 0, count: 0 };
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
                };
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);

        return {
            totalSpent,
            totalIncome,
            remaining: totalIncome - totalSpent,
            weeklyData,
            weekTotal,
            topCategories,
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
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, styles.statCardPrimary]}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="wallet-outline" size={20} color={Colors.white} />
                        </View>
                        <Text style={styles.statLabel}>Total Spent</Text>
                        <Text style={styles.statValue}>{formatAmount(stats.totalSpent)}</Text>
                        <Text style={styles.statSubtext}>this month</Text>
                    </View>

                    <View style={[styles.statCard, styles.statCardLight]}>
                        <View style={[styles.statIconContainer, styles.statIconGray]}>
                            <Ionicons name="trending-up-outline" size={20} color={Colors.text.secondary} />
                        </View>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Total Income</Text>
                        <Text style={[styles.statValue, styles.statValueDark]}>{formatAmount(stats.totalIncome)}</Text>
                        <Text style={[styles.statSubtext, styles.statSubtextDark]}>this month</Text>
                    </View>

                    <View style={[styles.statCard, styles.statCardOrange]}>
                        <View style={[styles.statIconContainer, styles.statIconOrange]}>
                            <Ionicons name="cash-outline" size={20} color="#F59E0B" />
                        </View>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Balance</Text>
                        <Text style={[styles.statValue, styles.statValueDark]}>{formatAmount(stats.remaining)}</Text>
                        <Text style={[styles.statSubtext, styles.statSubtextDark]}>remaining</Text>
                    </View>
                </View>

                {/* This Week Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>This Week</Text>
                        <Text style={styles.chartTotal}>${stats.weekTotal.toFixed(2)} total</Text>
                    </View>
                    <View style={styles.barChart}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                            const maxHeight = Math.max(...stats.weeklyData, 1);
                            const height = (stats.weeklyData[index] / maxHeight) * 100;
                            const isToday = index === new Date().getDay();
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
                                    <Text style={styles.barLabel}>{day}</Text>
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
                        {/* Simplified line chart representation */}
                        <View style={styles.lineChart}>
                            <Text style={styles.lineChartPlaceholder}>📈 Spending trend visualization</Text>
                        </View>
                        <View style={styles.monthLabels}>
                            {['Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
                                <Text key={month} style={styles.monthLabel}>
                                    {month}
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Top Categories */}
                <View style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>Top Categories</Text>
                        <Text style={styles.categorySubtitle}>This month</Text>
                    </View>

                    {stats.topCategories.length > 0 ? (
                        stats.topCategories.map((cat: any, index: number) => (
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
                                    <Text style={styles.categoryAmount}>${cat.total.toFixed(2)}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                                </View>
                            </TouchableOpacity>
                        ))
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
    notificationButton: {
        position: 'relative',
        padding: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    notificationBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        minHeight: 120,
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
        fontSize: 11,
        color: Colors.white,
        marginBottom: 4,
        opacity: 0.9,
    },
    statLabelDark: {
        color: Colors.text.secondary,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.white,
        marginBottom: 2,
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
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
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
    lastUpdated: {
        fontSize: 12,
        color: Colors.text.light,
        textAlign: 'center',
        marginTop: 16,
        paddingTop: 16,
    },
    bottomSpacing: {
        height: 100,
    },
});

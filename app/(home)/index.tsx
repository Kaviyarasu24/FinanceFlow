import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>SC</Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>Good morning,</Text>
                        <Text style={styles.userName}>Sarah</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>3</Text>
                    </View>
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
                        <Text style={styles.statValue}>$2,458</Text>
                        <Text style={styles.statSubtext}>this month</Text>
                    </View>

                    <View style={[styles.statCard, styles.statCardLight]}>
                        <View style={[styles.statIconContainer, styles.statIconGray]}>
                            <Ionicons name="time-outline" size={20} color={Colors.text.secondary} />
                        </View>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Remaining</Text>
                        <Text style={[styles.statValue, styles.statValueDark]}>$1,542</Text>
                        <Text style={[styles.statSubtext, styles.statSubtextDark]}>of $4,000</Text>
                    </View>

                    <View style={[styles.statCard, styles.statCardOrange]}>
                        <View style={[styles.statIconContainer, styles.statIconOrange]}>
                            <Ionicons name="calendar-outline" size={20} color="#F59E0B" />
                        </View>
                        <Text style={[styles.statLabel, styles.statLabelDark]}>Upcoming</Text>
                        <Text style={[styles.statValue, styles.statValueDark]}>$380</Text>
                        <Text style={[styles.statSubtext, styles.statSubtextDark]}>3 bills</Text>
                    </View>
                </View>

                {/* This Week Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>This Week</Text>
                        <Text style={styles.chartTotal}>$458 total</Text>
                    </View>
                    <View style={styles.barChart}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                            const heights = [40, 30, 60, 45, 80, 50, 90];
                            return (
                                <View key={day} style={styles.barContainer}>
                                    <View style={styles.barWrapper}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: heights[index],
                                                    backgroundColor: index === 6 ? Colors.primary : '#E5E7EB',
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

                {/* By Category */}
                <View style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>By Category</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllButton}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.categoryItem}>
                        <View style={styles.categoryLeft}>
                            <View style={[styles.categoryIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="cart-outline" size={20} color="#10B981" />
                            </View>
                            <Text style={styles.categoryName}>Shopping</Text>
                        </View>
                        <View style={styles.categoryRight}>
                            <Text style={styles.categoryAmount}>$342.50</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.categoryItem}>
                        <View style={styles.categoryLeft}>
                            <View style={[styles.categoryIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="restaurant-outline" size={20} color="#F59E0B" />
                            </View>
                            <Text style={styles.categoryName}>Food & Dining</Text>
                        </View>
                        <View style={styles.categoryRight}>
                            <Text style={styles.categoryAmount}>$218.30</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.categoryItem}>
                        <View style={styles.categoryLeft}>
                            <View style={[styles.categoryIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="car-outline" size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.categoryName}>Transportation</Text>
                        </View>
                        <View style={styles.categoryRight}>
                            <Text style={styles.categoryAmount}>$156.80</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.text.light} />
                        </View>
                    </TouchableOpacity>

                    {/* Last Updated */}
                    <Text style={styles.lastUpdated}>Last updated: 11:38 am</Text>
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

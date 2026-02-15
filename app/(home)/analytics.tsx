import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <Text style={styles.headerSubtitle}>January 2026</Text>
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
                        <Text style={styles.statValue}>$4,500</Text>
                        <Text style={styles.statChange}>+12% vs last month</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Ionicons name="trending-down-outline" size={20} color="#EF4444" />
                            <Text style={styles.statLabel}>Expense</Text>
                        </View>
                        <Text style={styles.statValue}>$3,200</Text>
                        <Text style={styles.statChangeNegative}>+8% vs last month</Text>
                    </View>
                </View>

                {/* Spending by Category */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Spending by Category</Text>

                    {/* Donut Chart Placeholder */}
                    <View style={styles.chartContainer}>
                        <View style={styles.donutChart}>
                            {/* Outer ring segments */}
                            <View style={[styles.donutSegment, styles.segment1]} />
                            <View style={[styles.donutSegment, styles.segment2]} />
                            <View style={[styles.donutSegment, styles.segment3]} />
                            <View style={[styles.donutSegment, styles.segment4]} />
                            {/* Center hole */}
                            <View style={styles.donutHole} />
                        </View>

                        {/* Legend */}
                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                                <Text style={styles.legendText}>Food & Drinks</Text>
                                <Text style={styles.legendPercent}>30%</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                                <Text style={styles.legendText}>Transport</Text>
                                <Text style={styles.legendPercent}>19%</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                                <Text style={styles.legendText}>Shopping</Text>
                                <Text style={styles.legendPercent}>21%</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
                                <Text style={styles.legendText}>Entertainment</Text>
                                <Text style={styles.legendPercent}>12%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Income vs Expense Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Income vs Expense</Text>

                    <View style={styles.barChartContainer}>
                        {/* Y-axis labels */}
                        <View style={styles.yAxis}>
                            <Text style={styles.yAxisLabel}>$4k</Text>
                            <Text style={styles.yAxisLabel}>$3k</Text>
                            <Text style={styles.yAxisLabel}>$2k</Text>
                            <Text style={styles.yAxisLabel}>$1k</Text>
                            <Text style={styles.yAxisLabel}>$0</Text>
                        </View>

                        {/* Bar Chart */}
                        <View style={styles.barChart}>
                            {[
                                { income: 70, expense: 60 },
                                { income: 85, expense: 70 },
                                { income: 75, expense: 65 },
                                { income: 90, expense: 75 },
                                { income: 80, expense: 70 },
                                { income: 95, expense: 80 },
                                { income: 85, expense: 75 },
                            ].map((data, index) => (
                                <View key={index} style={styles.barGroup}>
                                    <View style={styles.barPair}>
                                        <View style={[styles.bar, styles.incomeBar, { height: `${data.income}%` }]} />
                                        <View style={[styles.bar, styles.expenseBar, { height: `${data.expense}%` }]} />
                                    </View>
                                    <Text style={styles.barLabel}>
                                        {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][index]}
                                    </Text>
                                </View>
                            ))}
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
                        <Text style={styles.savingsValue}>28.9%</Text>
                        <Text style={styles.savingsSubtext}>You are saving $1,300 this month</Text>
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
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    donutChart: {
        width: 120,
        height: 120,
        borderRadius: 60,
        position: 'relative',
        backgroundColor: '#F97316',
        overflow: 'hidden',
    },
    donutSegment: {
        position: 'absolute',
        width: '50%',
        height: '50%',
    },
    segment1: {
        top: 0,
        left: 0,
        backgroundColor: '#F97316',
        borderTopLeftRadius: 60,
    },
    segment2: {
        top: 0,
        right: 0,
        backgroundColor: '#3B82F6',
        borderTopRightRadius: 60,
    },
    segment3: {
        bottom: 0,
        right: 0,
        backgroundColor: '#EC4899',
        borderBottomRightRadius: 60,
    },
    segment4: {
        bottom: 0,
        left: 0,
        backgroundColor: '#A855F7',
        borderBottomLeftRadius: 60,
    },
    donutHole: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.white,
        top: 25,
        left: 25,
    },
    legend: {
        flex: 1,
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

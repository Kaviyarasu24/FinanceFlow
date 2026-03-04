import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CalendarDatePickerProps {
    date: Date;
    onDateChange: (date: Date) => void;
    maximumDate?: Date;
    mode?: 'date' | 'month-year';
}

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
    date,
    onDateChange,
    maximumDate,
    mode = 'date',
}) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(date));

    useEffect(() => {
        if (showCalendar) {
            setCurrentMonth(new Date(date));
        }
    }, [date, showCalendar]);

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const renderDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <View key={`empty-${i}`} style={styles.dayCell} />
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isSelected = dayDate.getDate() === date.getDate() &&
                             dayDate.getMonth() === date.getMonth() &&
                             dayDate.getFullYear() === date.getFullYear();
            const isDisabled = maximumDate && dayDate > maximumDate;

            days.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                        styles.dayCell,
                        isSelected && styles.daySelected,
                        isDisabled && styles.dayDisabled,
                    ]}
                    onPress={() => {
                        if (!isDisabled) {
                            onDateChange(dayDate);
                            setShowCalendar(false);
                        }
                    }}
                    disabled={isDisabled}
                >
                    <Text style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        isDisabled && styles.dayTextDisabled,
                    ]}>
                        {day}
                    </Text>
                </TouchableOpacity>
            );
        }

        return days;
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const formatDate = (date: Date) => {
        if (mode === 'month-year') {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
            });
        }

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const previousYear = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
    };

    const nextYear = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
    };

    const renderMonths = () => {
        return monthNames.map((monthName, monthIndex) => {
            const monthDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
            const selectedMonth = date.getMonth() === monthIndex && date.getFullYear() === currentMonth.getFullYear();
            const isDisabled = maximumDate && monthDate > new Date(maximumDate.getFullYear(), maximumDate.getMonth(), 1);

            return (
                <TouchableOpacity
                    key={`month-${monthIndex}`}
                    style={[
                        styles.monthCell,
                        selectedMonth && styles.monthCellSelected,
                        isDisabled && styles.monthCellDisabled,
                    ]}
                    onPress={() => {
                        if (!isDisabled) {
                            onDateChange(new Date(currentMonth.getFullYear(), monthIndex, 1));
                            setShowCalendar(false);
                        }
                    }}
                    disabled={isDisabled}
                >
                    <Text
                        style={[
                            styles.monthCellText,
                            selectedMonth && styles.monthCellTextSelected,
                            isDisabled && styles.monthCellTextDisabled,
                        ]}
                    >
                        {monthName.slice(0, 3)}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <>
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendar(true)}
            >
                <Ionicons name="calendar-outline" size={20} color={Colors.text.secondary} />
                <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
            </TouchableOpacity>

            <Modal
                visible={showCalendar}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.yearText}>{currentMonth.getFullYear()}</Text>
                            <Text style={styles.dateText}>
                                {formatDate(date)}
                            </Text>
                        </View>

                        {/* Calendar */}
                        <View style={styles.calendarContainer}>
                            {mode === 'month-year' ? (
                                <>
                                    <View style={styles.monthHeader}>
                                        <TouchableOpacity
                                            onPress={previousYear}
                                            style={styles.navButton}
                                        >
                                            <Ionicons name="chevron-back" size={24} color={Colors.text.secondary} />
                                        </TouchableOpacity>
                                        <Text style={styles.monthText}>
                                            {currentMonth.getFullYear()}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={nextYear}
                                            style={styles.navButton}
                                        >
                                            <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.monthsGrid}>
                                        {renderMonths()}
                                    </View>
                                </>
                            ) : (
                                <>
                                    {/* Month navigation */}
                                    <View style={styles.monthHeader}>
                                        <TouchableOpacity
                                            onPress={previousMonth}
                                            style={styles.navButton}
                                        >
                                            <Ionicons name="chevron-back" size={24} color={Colors.text.secondary} />
                                        </TouchableOpacity>
                                        <Text style={styles.monthText}>
                                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={nextMonth}
                                            style={styles.navButton}
                                        >
                                            <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Day names */}
                                    <View style={styles.dayNamesRow}>
                                        {dayNames.map((day, index) => (
                                            <View key={`dayname-${index}`} style={styles.dayNameCell}>
                                                <Text style={styles.dayNameText}>{day}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Days grid */}
                                    <View style={styles.daysGrid}>
                                        {renderDays()}
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowCalendar(false)}
                            >
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.okButton}
                                onPress={() => setShowCalendar(false)}
                            >
                                <Text style={styles.okButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    dateButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        maxWidth: 320,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        backgroundColor: Colors.primary,
        padding: 24,
        justifyContent: 'center',
    },
    yearText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 28,
        fontWeight: '600',
        color: Colors.white,
    },
    calendarContainer: {
        padding: 16,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navButton: {
        padding: 8,
    },
    monthText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    dayNamesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayNameCell: {
        width: '14.28%',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dayNameText: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.text.secondary,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    monthCell: {
        width: '30%',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: Colors.background.primary,
    },
    monthCellSelected: {
        backgroundColor: Colors.primary,
    },
    monthCellDisabled: {
        opacity: 0.4,
    },
    monthCellText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    monthCellTextSelected: {
        color: Colors.white,
    },
    monthCellTextDisabled: {
        color: Colors.text.light,
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    daySelected: {
        backgroundColor: Colors.primary,
        borderRadius: 50,
    },
    dayDisabled: {
        opacity: 0.4,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    dayTextSelected: {
        color: Colors.white,
        fontWeight: '600',
    },
    dayTextDisabled: {
        color: Colors.text.light,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    cancelButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    okButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    okButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});

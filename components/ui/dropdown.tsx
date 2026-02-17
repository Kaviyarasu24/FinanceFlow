import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DropdownOption {
    id: string;
    label: string;
    icon?: string;
    color?: string;
}

interface DropdownProps {
    label?: string;
    placeholder?: string;
    options: DropdownOption[];
    selectedValue: string | null;
    onSelect: (option: DropdownOption) => void;
    renderOption?: (option: DropdownOption) => React.ReactNode;
}

export function Dropdown({
    label,
    placeholder = 'Select an option',
    options,
    selectedValue,
    onSelect,
    renderOption,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.id === selectedValue);

    const handleSelect = (option: DropdownOption) => {
        onSelect(option);
        setIsOpen(false);
    };

    const renderDefaultOption = (option: DropdownOption) => (
        <View style={styles.optionContent}>
            {option.icon && (
                <View
                    style={[
                        styles.optionIcon,
                        { backgroundColor: option.color ? `${option.color}20` : Colors.background.primary },
                    ]}
                >
                    <Ionicons
                        name={option.icon as any}
                        size={20}
                        color={option.color || Colors.primary}
                    />
                </View>
            )}
            <Text style={styles.optionLabel}>{option.label}</Text>
            {selectedValue === option.id && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            {/* Dropdown Button */}
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                {selectedOption ? (
                    <View style={styles.selectedContent}>
                        {selectedOption.icon && (
                            <View
                                style={[
                                    styles.selectedIcon,
                                    {
                                        backgroundColor: selectedOption.color
                                            ? `${selectedOption.color}20`
                                            : Colors.background.primary,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={selectedOption.icon as any}
                                    size={20}
                                    color={selectedOption.color || Colors.primary}
                                />
                            </View>
                        )}
                        <Text style={styles.selectedText}>{selectedOption.label}</Text>
                    </View>
                ) : (
                    <Text style={styles.placeholderText}>{placeholder}</Text>
                )}
                <Ionicons name="chevron-down" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>

            {/* Dropdown Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                            <TouchableOpacity
                                onPress={() => setIsOpen(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={Colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Options List */}
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        selectedValue === item.id && styles.optionSelected,
                                    ]}
                                    onPress={() => handleSelect(item)}
                                    activeOpacity={0.7}
                                >
                                    {renderOption ? renderOption(item) : renderDefaultOption(item)}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.optionsList}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 12,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    selectedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    selectedIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    placeholderText: {
        fontSize: 15,
        color: Colors.text.light,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionsList: {
        padding: 16,
        gap: 8,
    },
    option: {
        borderRadius: 12,
        padding: 14,
        backgroundColor: Colors.background.primary,
        marginBottom: 8,
    },
    optionSelected: {
        backgroundColor: `${Colors.primary}10`,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text.primary,
    },
});

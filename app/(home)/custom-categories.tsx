import { Colors } from '@/constants/Colors';
import { useCategories } from '@/hooks/useCategories';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const ICON_OPTIONS_BASE = [
    'ellipsis-horizontal',
    'restaurant',
    'fast-food',
    'cafe',
    'pizza',
    'beer',
    'cart',
    'bag-handle',
    'car',
    'car-sport',
    'bus',
    'train',
    'bicycle',
    'walk',
    'airplane',
    'boat',
    'home',
    'bed',
    'flash',
    'bulb',
    'medical',
    'fitness',
    'heart',
    'briefcase',
    'wallet',
    'card',
    'cash',
    'trending-up',
    'trending-down',
    'laptop',
    'phone-portrait',
    'camera',
    'tv',
    'game-controller',
    'film',
    'musical-notes',
    'book',
    'school',
    'gift',
    'construct',
    'hammer',
    'shirt',
    'paw',
    'leaf',
    'flower',
    'trophy',
    'football',
    'basketball',
    'barbell',
    'globe'
] as const;

const ICON_OPTIONS = Array.from(new Set(ICON_OPTIONS_BASE)).filter(
    (icon) => icon in (Ionicons as any).glyphMap
);

const COLOR_OPTIONS = [
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#22C55E', // Green
    '#0EA5E9', // Sky
    '#2563EB', // Royal Blue
    '#7C3AED', // Violet
    '#D946EF', // Fuchsia
    '#E11D48', // Rose
    '#B91C1C', // Dark Red
    '#A16207', // Dark Amber
    '#334155', // Slate
    '#6B7280', // Gray
    '#111827', // Near Black
];

export default function CustomCategoriesScreen() {
    const router = useRouter();
    const {
        getCustomCategories,
        addCategory,
        deleteCategory,
        getCategoryTransactionCount,
        reassignTransactionsAndDeleteCategory,
        loading,
    } = useCategories();
    const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
    const [showModal, setShowModal] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('ellipsis-horizontal');
    const [selectedColor, setSelectedColor] = useState('#EF4444');
    const [saving, setSaving] = useState(false);

    const customCategories = getCustomCategories(selectedType);

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        setSaving(true);
        const { error } = await addCategory({
            name: categoryName,
            type: selectedType,
            icon: selectedIcon,
            color: selectedColor,
        });

        setSaving(false);

        if (error) {
            Alert.alert('Error', `Failed to add category: ${error}`);
        } else {
            setCategoryName('');
            setSelectedIcon('ellipsis-horizontal');
            setSelectedColor('#EF4444');
            setShowModal(false);
            Alert.alert('Success', 'Category added successfully');
        }
    };

    const isIoniconName = (icon: string) => icon in (Ionicons as any).glyphMap;
    const normalizeIcon = (icon: string) => (icon || '').trim() || 'ellipsis-horizontal';

    const renderCategoryIcon = (icon: string, size: number) => {
        const normalized = normalizeIcon(icon);
        if (isIoniconName(normalized)) {
            return <Ionicons name={normalized as any} size={size} color={Colors.white} />;
        }
        return <Ionicons name="ellipsis-horizontal" size={size} color={Colors.white} />;
    };

    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${categoryName}"?`,
            [
                { text: 'Cancel', onPress: () => {} },
                {
                    text: 'Delete',
                    onPress: async () => {
                        const { count, error: countError } = await getCategoryTransactionCount(categoryId);

                        if (countError) {
                            Alert.alert('Error', `Failed to check category usage: ${countError}`);
                            return;
                        }

                        if (count > 0) {
                            Alert.alert(
                                'Category In Use',
                                `This category is used by ${count} transaction(s). You can reassign those transactions to Uncategorized and then delete this category.`,
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Reassign and Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                            const { error } = await reassignTransactionsAndDeleteCategory(categoryId);
                                            if (error) {
                                                Alert.alert('Error', `Failed to reassign and delete category: ${error}`);
                                            } else {
                                                Alert.alert('Success', 'Category deleted and transactions moved to Uncategorized');
                                            }
                                        },
                                    },
                                ]
                            );
                            return;
                        }

                        const { error } = await deleteCategory(categoryId);
                        if (error) {
                            Alert.alert('Error', `Failed to delete category: ${error}`);
                        } else {
                            Alert.alert('Success', 'Category deleted successfully');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(home)/profile')}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Custom Categories</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Type Selector */}
            <View style={styles.typeSelector}>
                <TouchableOpacity
                    style={[
                        styles.typeButton,
                        selectedType === 'expense' && styles.typeButtonActive,
                    ]}
                    onPress={() => setSelectedType('expense')}
                >
                    <Ionicons
                        name="arrow-down-outline"
                        size={20}
                        color={selectedType === 'expense' ? Colors.white : Colors.text.secondary}
                    />
                    <Text
                        style={[
                            styles.typeButtonText,
                            selectedType === 'expense' && styles.typeButtonTextActive,
                        ]}
                    >
                        Expense
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.typeButton,
                        selectedType === 'income' && styles.typeButtonActive,
                    ]}
                    onPress={() => setSelectedType('income')}
                >
                    <Ionicons
                        name="arrow-up-outline"
                        size={20}
                        color={selectedType === 'income' ? Colors.white : Colors.text.secondary}
                    />
                    <Text
                        style={[
                            styles.typeButtonText,
                            selectedType === 'income' && styles.typeButtonTextActive,
                        ]}
                    >
                        Income
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Add Button */}
            <TouchableOpacity
                style={styles.topAddButton}
                onPress={() => {
                    setCategoryName('');
                    setSelectedIcon('ellipsis-horizontal');
                    setSelectedColor('#EF4444');
                    setShowModal(true);
                }}
            >
                <Ionicons name="add-circle" size={24} color={Colors.white} />
                <Text style={styles.topAddButtonText}>Add Category</Text>
            </TouchableOpacity>

            {/* Categories List */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : customCategories.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="folder-outline" size={64} color={Colors.text.light} />
                        <Text style={styles.emptyText}>No custom categories yet</Text>
                        <Text style={styles.emptySubtext}>Create your first one to get started</Text>
                    </View>
                ) : (
                    <View style={styles.categoriesContainer}>
                        {customCategories.map((category) => (
                            <View key={category.id} style={styles.categoryCard}>
                                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                                    {renderCategoryIcon(category.icon, 24)}
                                </View>
                                <View style={styles.categoryInfo}>
                                    <Text style={styles.categoryName}>{category.name}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteCategory(category.id, category.name)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Add Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    setCategoryName('');
                    setSelectedIcon('ellipsis-horizontal');
                    setSelectedColor('#EF4444');
                    setShowModal(true);
                }}
            >
                <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>

            {/* Add Category Modal */}
            <Modal visible={showModal} animationType="fade" transparent={true}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity 
                        style={styles.modalBackdrop} 
                        activeOpacity={1}
                        onPress={() => setShowModal(false)}
                    />
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={styles.modalCloseButton}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Add Category</Text>
                            <TouchableOpacity
                                onPress={handleAddCategory}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={Colors.primary} />
                                ) : (
                                    <Text style={styles.modalSaveButton}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.modalScroll}
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Category Name */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Category Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter category name"
                                    placeholderTextColor={Colors.text.light}
                                    value={categoryName}
                                    onChangeText={setCategoryName}
                                />
                            </View>

                            {/* Preview */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Preview</Text>
                                <View style={styles.previewCard}>
                                    <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
                                        {renderCategoryIcon(selectedIcon, 32)}
                                    </View>
                                    <Text style={styles.previewText}>{categoryName || 'Category'}</Text>
                                </View>
                            </View>

                            {/* Icon Selector */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionLabel}>Icon</Text>
                                </View>
                                <View style={styles.iconGrid}>
                                    {ICON_OPTIONS.map((icon) => (
                                        <TouchableOpacity
                                            key={icon}
                                            style={[
                                                styles.iconOption,
                                                selectedIcon === icon && styles.iconOptionSelected,
                                            ]}
                                            onPress={() => {
                                                setSelectedIcon(icon);
                                            }}
                                        >
                                            <Ionicons name={icon as any} size={22} color={Colors.text.primary} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Color Selector */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionLabel}>Color</Text>
                                </View>
                                <View style={styles.colorGrid}>
                                    {COLOR_OPTIONS.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color },
                                                selectedColor === color && styles.colorOptionSelected,
                                            ]}
                                            onPress={() => setSelectedColor(color)}
                                        >
                                            {selectedColor === color && (
                                                <Ionicons name="checkmark" size={20} color={Colors.white} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.bottomSpacing} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
    },
    placeholder: {
        width: 40,
    },
    typeSelector: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.white,
        gap: 6,
    },
    typeButtonActive: {
        backgroundColor: Colors.primary,
    },
    typeButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    typeButtonTextActive: {
        color: Colors.white,
    },
    topAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        gap: 6,
    },
    topAddButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 12,
        gap: 10,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    deleteButton: {
        padding: 8,
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 16,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: Colors.background.primary,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '85%',
        borderBottomWidth: 0,
        paddingBottom: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalCloseButton: {
        fontSize: 16,
        color: Colors.text.secondary,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    modalSaveButton: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.primary,
    },
    modalScroll: {
        flex: 1,
    },
    modalScrollContent: {
        paddingBottom: 24,
        flexGrow: 1,
    },
    section: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: Colors.text.primary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    previewCard: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        gap: 8,
    },
    previewIcon: {
        width: 54,
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingVertical: 6,
        marginTop: 8,
    },
    iconOption: {
        width: 40,
        height: 40,
        backgroundColor: Colors.white,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconOptionSelected: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingVertical: 6,
        marginTop: 8,
    },
    colorOption: {
        width: 38,
        height: 38,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorOptionSelected: {
        borderColor: Colors.text.primary,
    },
    bottomSpacing: {
        height: 30,
    },
    border: {
        borderBottomColor: Colors.border,
    },
});

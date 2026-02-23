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
    'restaurant', 'cart', 'car', 'game-controller', 'flash', 'fitness', 'ellipsis-horizontal',
    'briefcase', 'laptop', 'trending-up', 'home', 'medical', 'airplane', 'beer', 'gift',
    'book', 'tv', 'camera', 'music-note', 'utensils', 'shopping-bag', 'bus', 'bed'
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
];

export default function CustomCategoriesScreen() {
    const router = useRouter();
    const { getCustomCategories, addCategory, deleteCategory, loading } = useCategories();
    const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
    const [showModal, setShowModal] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('ellipsis-horizontal');
    const [selectedColor, setSelectedColor] = useState('#EF4444');
    const [iconInput, setIconInput] = useState('');
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
            setIconInput('');
            setShowModal(false);
            Alert.alert('Success', 'Category added successfully');
        }
    };

    const isIoniconName = (icon: string) => ICON_OPTIONS.includes(icon as any);
    const normalizeIcon = (icon: string) => (icon || '').trim() || 'ellipsis-horizontal';
    const isValidHexColor = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
    // Extract first emoji/character using proper Unicode iteration
    const toSingleEmoji = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return '';
        // Use Array.from with proper spread to handle complex Unicode
        const chars = [...trimmed];
        return chars[0] || '';
    };

    const renderCategoryIcon = (icon: string, size: number) => {
        const normalized = normalizeIcon(icon);
        if (isIoniconName(normalized)) {
            return <Ionicons name={normalized as any} size={size} color={Colors.white} />;
        }
        return (
            <Text style={[styles.emojiIcon, { fontSize: size }]}>
                {normalized}
            </Text>
        );
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
                    setIconInput('');
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
                    setIconInput('');
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
                                <TextInput
                                    style={styles.input}
                                    placeholder="Type an emoji"
                                    placeholderTextColor={Colors.text.light}
                                    value={iconInput}
                                    onChangeText={(value) => {
                                        const emoji = toSingleEmoji(value);
                                        setIconInput(emoji);
                                        if (emoji) {
                                            setSelectedIcon(emoji);
                                        }
                                    }}
                                />
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.iconGrid}
                                >
                                    {ICON_OPTIONS.map((icon) => (
                                        <TouchableOpacity
                                            key={icon}
                                            style={[
                                                styles.iconOption,
                                                selectedIcon === icon && styles.iconOptionSelected,
                                            ]}
                                            onPress={() => {
                                                setSelectedIcon(icon);
                                                setIconInput('');
                                            }}
                                        >
                                            <Ionicons name={icon as any} size={28} color={Colors.text.primary} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Color Selector */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionLabel}>Color</Text>
                                </View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.colorGrid}
                                >
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
                                </ScrollView>
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: Colors.white,
        gap: 8,
    },
    typeButtonActive: {
        backgroundColor: Colors.primary,
    },
    typeButtonText: {
        fontSize: 14,
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
        marginHorizontal: 20,
        marginVertical: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        gap: 8,
    },
    topAddButtonText: {
        fontSize: 15,
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    deleteButton: {
        padding: 8,
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '85%',
        borderBottomWidth: 0,
        paddingBottom: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalCloseButton: {
        fontSize: 16,
        color: Colors.text.secondary,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    modalSaveButton: {
        fontSize: 16,
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
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.text.primary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    previewCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        gap: 12,
    },
    previewIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiIcon: {
        color: Colors.white,
    },
    previewText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    iconGrid: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 4,
        marginTop: 12,
    },
    iconOption: {
        width: 44,
        height: 44,
        backgroundColor: Colors.white,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    iconOptionSelected: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    colorGrid: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 4,
        marginTop: 12,
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
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

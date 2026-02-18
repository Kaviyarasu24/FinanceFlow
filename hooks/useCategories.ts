import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Category = Database['public']['Tables']['categories']['Row'];

interface AddCategoryParams {
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
}

export function useCategories() {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getCategoriesByType = (type: 'income' | 'expense') => {
        return categories.filter((cat) => cat.type === type);
    };

    const getCustomCategories = (type: 'income' | 'expense') => {
        return categories.filter((cat) => cat.type === type && !cat.is_default);
    };

    const addCategory = async (params: AddCategoryParams) => {
        try {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('categories')
                .insert([
                    {
                        user_id: user.id,
                        name: params.name,
                        type: params.type,
                        icon: params.icon,
                        color: params.color,
                        is_default: false,
                    },
                ])
                .select();

            if (error) throw error;
            await fetchCategories();
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const deleteCategory = async (categoryId: string) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId);

            if (error) throw error;
            await fetchCategories();
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        categories,
        loading,
        error,
        fetchCategories,
        getCategoriesByType,
        getCustomCategories,
        addCategory,
        deleteCategory,
    };
}

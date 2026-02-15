import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useAuth } from '@/contexts/AuthContext';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export function useSettings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            setSettings(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates: UserSettingsUpdate) => {
        if (!user) return { error: 'No user logged in' };

        try {
            console.log('updateSettings called with:', updates);
            console.log('User ID:', user.id);

            // Use upsert to insert or update
            const { data, error } = await supabase
                .from('user_settings')
                .upsert(
                    {
                        user_id: user.id,
                        ...updates
                    },
                    {
                        onConflict: 'user_id',
                        ignoreDuplicates: false
                    }
                )
                .select()
                .single();

            console.log('Upsert result:', { data, error });

            if (error) throw error;
            setSettings(data);
            return { data, error: null };
        } catch (err: any) {
            console.error('updateSettings error:', err);
            return { data: null, error: err.message };
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [user]);

    return {
        settings,
        loading,
        error,
        fetchSettings,
        updateSettings,
    };
}

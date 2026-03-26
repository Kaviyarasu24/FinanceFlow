import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { Platform } from 'react-native';

const configuredSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const configuredSupabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const missingEnvVars: string[] = [];
if (!configuredSupabaseUrl) {
    missingEnvVars.push('EXPO_PUBLIC_SUPABASE_URL');
}
if (!configuredSupabaseAnonKey) {
    missingEnvVars.push('EXPO_PUBLIC_SUPABASE_KEY/EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

if (missingEnvVars.length > 0) {
    console.error(
        `[Supabase] Missing environment variables: ${missingEnvVars.join(', ')}. ` +
            'The app will open, but authentication and data operations will fail until these are configured in EAS/env.'
    );
}

const supabaseUrl = configuredSupabaseUrl ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = configuredSupabaseAnonKey ?? 'placeholder-anon-key';

// Create a storage adapter that works on both web and native
const createStorageAdapter = () => {
    if (Platform.OS === 'web') {
        // Use localStorage for web
        return {
            getItem: (key: string) => {
                if (typeof window !== 'undefined') {
                    return Promise.resolve(window.localStorage.getItem(key));
                }
                return Promise.resolve(null);
            },
            setItem: (key: string, value: string) => {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, value);
                }
                return Promise.resolve();
            },
            removeItem: (key: string) => {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem(key);
                }
                return Promise.resolve();
            },
        };
    } else {
        // Use AsyncStorage for native platforms
        return AsyncStorage;
    }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: createStorageAdapter(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

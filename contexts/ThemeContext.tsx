import { useSettings } from '@/hooks/useSettings';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: (enabled: boolean) => Promise<void>;
    loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const { user } = useAuth();
    const { settings, updateSettings } = useSettings();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (settings) {
            setIsDarkMode(settings.dark_mode_enabled ?? false);
            setLoading(false);
        }
    }, [settings]);

    const toggleDarkMode = async (enabled: boolean) => {
        if (!user) return;

        setIsDarkMode(enabled);
        await updateSettings({
            dark_mode_enabled: enabled,
        });
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, loading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

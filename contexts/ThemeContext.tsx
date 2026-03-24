import React, { createContext, useContext } from 'react';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: (enabled: boolean) => Promise<void>;
    loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const isDarkMode = false;
    const loading = false;

    const toggleDarkMode = async (_enabled: boolean) => {
        // Dark mode is intentionally disabled. App always uses light mode.
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

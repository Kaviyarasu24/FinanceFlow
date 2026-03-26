import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    verifyResetOtpAndUpdatePassword: (email: string, token: string, password: string) => Promise<{ error: any }>;
    updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const applySessionFromUrl = async (url: string) => {
            try {
                const normalizedUrl = url.includes('#') ? url.replace('#', '?') : url;
                const parsed = Linking.parse(normalizedUrl);
                const accessToken = parsed.queryParams?.access_token;
                const refreshToken = parsed.queryParams?.refresh_token;
                const tokenHash = parsed.queryParams?.token_hash;
                const linkType = parsed.queryParams?.type;

                if (
                    typeof accessToken === 'string' &&
                    typeof refreshToken === 'string'
                ) {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (error) {
                        console.error('[Auth] Failed to set session from deep link:', error);
                    }
                    return;
                }

                if (
                    typeof tokenHash === 'string' &&
                    linkType === 'recovery'
                ) {
                    const { error } = await supabase.auth.verifyOtp({
                        type: 'recovery',
                        token_hash: tokenHash,
                    });

                    if (error) {
                        console.error('[Auth] Failed to verify recovery token from deep link:', error);
                    }
                }
            } catch (error) {
                console.error('[Auth] Failed to parse deep link URL:', error);
            }
        };

        // Get initial session
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            })
            .catch((error) => {
                console.error('[Auth] Failed to get initial session:', error);
                setSession(null);
                setUser(null);
                setLoading(false);
            });

        Linking.getInitialURL()
            .then((url) => {
                if (url) {
                    return applySessionFromUrl(url);
                }
            })
            .catch((error) => {
                console.error('[Auth] Failed to read initial URL:', error);
            });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const deepLinkSubscription = Linking.addEventListener('url', ({ url }) => {
            void applySessionFromUrl(url);
        });

        return () => {
            subscription.unsubscribe();
            deepLinkSubscription.remove();
        };
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) return { error };

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : typeof error === 'string'
                        ? error
                        : 'Failed to sign in. Please try again.';
            return { error: { message } };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
    };

    const resetPassword = async (email: string) => {
        try {
            const redirectTo = Linking.createURL('/reset-password');
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });
            return { error };
        } catch (error) {
            return { error };
        }
    };

    const verifyResetOtpAndUpdatePassword = async (
        email: string,
        token: string,
        password: string
    ) => {
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'recovery',
            });

            if (verifyError) {
                return { error: verifyError };
            }

            const { error: updateError } = await supabase.auth.updateUser({ password });
            return { error: updateError };
        } catch (error) {
            return { error };
        }
    };

    const updatePassword = async (password: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password });
            return { error };
        } catch (error) {
            return { error };
        }
    };

    const value = {
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        verifyResetOtpAndUpdatePassword,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

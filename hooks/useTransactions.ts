import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

interface UseTransactionsOptions {
    initialFetchMode?: 'all' | 'page';
    pageSize?: number;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
    const initialFetchMode = options.initialFetchMode ?? 'all';
    const pageSize = options.pageSize ?? 30;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const offsetRef = useRef(0);
    const hasMoreRef = useRef(true);
    const inFlightRef = useRef(false);

    const fetchTransactions = useCallback(
        async (params?: { paginated?: boolean; reset?: boolean }) => {
            const paginated = params?.paginated ?? false;
            const reset = params?.reset ?? false;

            if (inFlightRef.current) return;
            if (paginated && !reset && !hasMoreRef.current) return;

            inFlightRef.current = true;

            try {
                if (paginated) {
                    if (reset) {
                        setLoading(true);
                        setError(null);
                        offsetRef.current = 0;
                        hasMoreRef.current = true;
                        setHasMore(true);
                    } else {
                        setLoadingMore(true);
                    }

                    const from = offsetRef.current;
                    const to = from + pageSize - 1;

                    const { data, error } = await supabase
                        .from('transactions')
                        .select('*')
                        .order('date', { ascending: false })
                        .order('created_at', { ascending: false })
                        .range(from, to);

                    if (error) throw error;

                    const rows = data || [];

                    if (reset) {
                        setTransactions(rows);
                    } else {
                        setTransactions((prev) => {
                            const existingIds = new Set(prev.map((item) => item.id));
                            const nextRows = rows.filter((item) => !existingIds.has(item.id));
                            return [...prev, ...nextRows];
                        });
                    }

                    offsetRef.current = from + rows.length;
                    const canLoadMore = rows.length === pageSize;
                    hasMoreRef.current = canLoadMore;
                    setHasMore(canLoadMore);
                } else {
                    setLoading(true);
                    setError(null);

                    const { data, error } = await supabase
                        .from('transactions')
                        .select('*')
                        .order('date', { ascending: false })
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    const rows = data || [];
                    setTransactions(rows);
                    offsetRef.current = rows.length;
                    hasMoreRef.current = false;
                    setHasMore(false);
                }

                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                inFlightRef.current = false;
                if (paginated && !reset) {
                    setLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [pageSize]
    );

    const loadMoreTransactions = useCallback(async () => {
        await fetchTransactions({ paginated: true, reset: false });
    }, [fetchTransactions]);

    const refreshTransactions = useCallback(async () => {
        await fetchTransactions({
            paginated: initialFetchMode === 'page',
            reset: true,
        });
    }, [fetchTransactions, initialFetchMode]);

    const addTransaction = useCallback(async (transaction: TransactionInsert) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert(transaction)
                .select()
                .single();

            if (error) throw error;

            // Optimistically update local state
            setTransactions((prev) => [data, ...prev]);
            offsetRef.current += 1;
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }, []);

    const updateTransaction = useCallback(async (id: string, updates: TransactionUpdate) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Update local state
            setTransactions((prev) =>
                prev.map((t) => (t.id === id ? data : t))
            );
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }, []);

    const deleteTransaction = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Update local state
            let removedCount = 0;
            setTransactions((prev) => {
                const next = prev.filter((t) => t.id !== id);
                removedCount = prev.length - next.length;
                return next;
            });
            if (removedCount > 0 && offsetRef.current > 0) {
                offsetRef.current = Math.max(0, offsetRef.current - removedCount);
            }
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    }, []);

    const getTransactionsByDateRange = useCallback(async (startDate: string, endDate: string) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (err: any) {
            return { data: [], error: err.message };
        }
    }, []);

    useEffect(() => {
        if (initialFetchMode === 'page') {
            fetchTransactions({ paginated: true, reset: true });
        } else {
            fetchTransactions();
        }
    }, [fetchTransactions, initialFetchMode]);

    return {
        transactions,
        loading,
        loadingMore,
        hasMore,
        error,
        fetchTransactions,
        loadMoreTransactions,
        refreshTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionsByDateRange,
    };
}

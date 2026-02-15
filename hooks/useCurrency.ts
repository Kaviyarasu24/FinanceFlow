import { useSettings } from '@/hooks/useSettings';

// Currency symbols mapping
const CURRENCY_SYMBOLS: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
};

// Hook to get currency formatter
export function useCurrency() {
    const { settings } = useSettings();

    const formatAmount = (amount: number): string => {
        const symbol = settings?.currency_symbol || '$';

        // Format number with 2 decimal places
        const formatted = Math.abs(amount).toFixed(2);

        return `${symbol}${formatted}`;
    };

    const getCurrencySymbol = (): string => {
        return settings?.currency_symbol || '$';
    };

    return {
        formatAmount,
        getCurrencySymbol,
        currency: settings?.currency_code || 'USD',
    };
}

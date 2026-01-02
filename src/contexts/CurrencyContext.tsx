'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported currencies
export type CurrencyCode = 'VND' | 'USD' | 'EUR';

// Exchange rates relative to USD (base currency in database)
// 1 USD = X currency
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
    USD: 1,
    VND: 25000,   // 1 USD = 25,000 VND
    EUR: 0.92,    // 1 USD = 0.92 EUR
};

// Currency symbols and formatting
const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; locale: string; decimals: number }> = {
    USD: { symbol: '$', locale: 'en-US', decimals: 2 },
    VND: { symbol: '₫', locale: 'vi-VN', decimals: 0 },
    EUR: { symbol: '€', locale: 'de-DE', decimals: 2 },
};

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    formatPrice: (amountInUSD: number) => string;
    convertPrice: (amountInUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'offlineShop_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
    const [isHydrated, setIsHydrated] = useState(false);

    // Load currency from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
        if (saved && EXCHANGE_RATES[saved]) {
            setCurrencyState(saved);
        }
        setIsHydrated(true);
    }, []);

    // Save currency to localStorage when changed
    const setCurrency = (newCurrency: CurrencyCode) => {
        setCurrencyState(newCurrency);
        localStorage.setItem(STORAGE_KEY, newCurrency);
    };

    // Convert USD (database currency) to selected currency
    const convertPrice = (amountInUSD: number): number => {
        return amountInUSD * EXCHANGE_RATES[currency];
    };

    // Format price in selected currency
    const formatPrice = (amountInUSD: number): string => {
        const converted = convertPrice(amountInUSD);
        const config = CURRENCY_CONFIG[currency];

        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: config.decimals,
            minimumFractionDigits: config.decimals,
        }).format(converted);
    };

    // Prevent hydration mismatch by not rendering until client is ready
    if (!isHydrated) {
        return (
            <CurrencyContext.Provider
                value={{
                    currency: 'USD',
                    setCurrency: () => { },
                    formatPrice: (amount) => new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 2,
                    }).format(amount),
                    convertPrice: (amount) => amount,
                }}
            >
                {children}
            </CurrencyContext.Provider>
        );
    }

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}

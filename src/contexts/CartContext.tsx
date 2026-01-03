'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCartCount } from '@/services/cart.service';
import { useAuth } from '@/contexts/AuthContext';

interface CartContextType {
    cartCount: number;
    refreshCartCount: () => Promise<void>;
    incrementCart: () => void;
    decrementCart: () => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
    cartCount: 0,
    refreshCartCount: async () => { },
    incrementCart: () => { },
    decrementCart: () => { },
    clearCart: () => { },
});

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart count from database
    const refreshCartCount = useCallback(async () => {
        if (user) {
            const count = await getCartCount();
            setCartCount(count);
        } else {
            setCartCount(0);
        }
    }, [user]);

    // Optimistic update: increment count immediately
    const incrementCart = useCallback(() => {
        setCartCount(prev => prev + 1);
    }, []);

    // Optimistic update: decrement count immediately
    const decrementCart = useCallback(() => {
        setCartCount(prev => Math.max(0, prev - 1));
    }, []);

    // Clear cart (after checkout)
    const clearCart = useCallback(() => {
        setCartCount(0);
    }, []);

    // Fetch cart count when user changes
    useEffect(() => {
        refreshCartCount();
    }, [user, refreshCartCount]);

    return (
        <CartContext.Provider value={{
            cartCount,
            refreshCartCount,
            incrementCart,
            decrementCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

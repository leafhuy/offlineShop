'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartBadge() {
    const { cartCount } = useCart();

    return (
        <Link
            href="/cart"
            className="relative p-2.5 text-[#c7d5e0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-[#5c7e10] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            )}
        </Link>
    );
}

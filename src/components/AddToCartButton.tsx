'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { addToCart } from '@/services/cart.service';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface AddToCartButtonProps {
    appid: number;
    price: number;
    isOwned?: boolean;
    isInCart?: boolean;
    size?: 'default' | 'small';
    className?: string;
}

export default function AddToCartButton({
    appid,
    price,
    isOwned = false,
    isInCart = false,
    size = 'default',
    className = '',
}: AddToCartButtonProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { incrementCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [inCart, setInCart] = useState(isInCart);

    async function handleAddToCart() {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            router.push('/login');
            return;
        }

        if (isOwned) {
            toast.error('Bạn đã sở hữu game này');
            return;
        }

        if (inCart) {
            router.push('/cart');
            return;
        }

        setLoading(true);

        const result = await addToCart(appid);

        if (result.success) {
            setInCart(true);
            incrementCart(); // Update navbar badge immediately
            toast.success('Đã thêm vào giỏ hàng!');
        } else {
            toast.error(result.error || 'Không thể thêm vào giỏ hàng');
        }

        setLoading(false);
    }

    // Already owned
    if (isOwned) {
        return (
            <button
                disabled
                className={`flex items-center justify-center gap-2 px-4 py-2 
                           bg-[#3d4450] text-[#8b929a] rounded cursor-not-allowed
                           ${size === 'small' ? 'text-xs py-1.5 px-3' : 'text-sm'}
                           ${className}`}
            >
                <Check size={size === 'small' ? 14 : 16} />
                Đã sở hữu
            </button>
        );
    }

    // In cart - go to cart
    if (inCart) {
        return (
            <button
                onClick={() => router.push('/cart')}
                className={`flex items-center justify-center gap-2 px-4 py-2
                           bg-[#2a475e] hover:bg-[#316282] text-white rounded transition-colors
                           ${size === 'small' ? 'text-xs py-1.5 px-3' : 'text-sm'}
                           ${className}`}
            >
                <ShoppingCart size={size === 'small' ? 14 : 16} />
                Trong giỏ hàng
            </button>
        );
    }

    // Default - Add to cart button
    return (
        <button
            onClick={handleAddToCart}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-4 py-2
                       bg-[#5c7e10] hover:bg-[#6d8f1a] text-white font-medium rounded 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       ${size === 'small' ? 'text-xs py-1.5 px-3' : 'text-sm'}
                       ${className}`}
        >
            {loading ? (
                <Loader2 size={size === 'small' ? 14 : 16} className="animate-spin" />
            ) : (
                <ShoppingCart size={size === 'small' ? 14 : 16} />
            )}
            {loading ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </button>
    );
}

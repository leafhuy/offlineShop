'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Trash2, ShoppingCart, Loader2, Gift } from 'lucide-react';
import { getCartItems, removeFromCart, CartItem } from '@/services/cart.service';
import { processCheckout } from '@/services/checkout.service';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getGameImage } from '@/utils/helpers';
import { toast } from 'sonner';

export default function CartPage() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();
    const { decrementCart, clearCart } = useCart();
    const { formatPrice } = useCurrency();
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);

    // Fetch cart items
    useEffect(() => {
        async function fetchCart() {
            const { items, total } = await getCartItems();
            setItems(items);
            setTotal(total);
            setLoading(false);
        }
        fetchCart();
    }, []);

    // Handle remove item
    async function handleRemove(appid: number) {
        setRemovingId(appid);
        const result = await removeFromCart(appid);

        if (result.success) {
            setItems(prev => prev.filter(item => item.game_appid !== appid));
            // Recalculate total
            const newItems = items.filter(item => item.game_appid !== appid);
            const newTotal = newItems.reduce((sum, item) => {
                if (item.game) {
                    return sum + (item.game.discount_price || item.game.original_price || 0);
                }
                return sum;
            }, 0);
            setTotal(newTotal);
            decrementCart(); // Update navbar badge
            toast.success('Đã xóa khỏi giỏ hàng');
        } else {
            toast.error(result.error || 'Không thể xóa');
        }

        setRemovingId(null);
    }

    // Handle checkout
    async function handleCheckout() {
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            router.push('/login');
            return;
        }

        setCheckingOut(true);
        const result = await processCheckout();

        if (result.success) {
            toast.success('Mua hàng thành công! Key của bạn đã sẵn sàng.');
            setItems([]);
            setTotal(0);
            clearCart(); // Reset navbar badge
            refreshProfile(); // Refresh wallet balance
            router.push('/orders');
        } else {
            toast.error(result.error || 'Không thể thanh toán');
        }

        setCheckingOut(false);
    }

    // Not logged in
    if (!user && !loading) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-20">
                    <ShoppingCart size={64} className="text-[#3d4450] mb-4" />
                    <h2 className="text-xl font-semibold text-[#c7d5e0] mb-2">
                        Vui lòng đăng nhập
                    </h2>
                    <p className="text-[#8f98a0] mb-6">
                        Bạn cần đăng nhập để xem giỏ hàng
                    </p>
                    <Link
                        href="/login"
                        className="px-6 py-2 bg-gradient-to-r from-[#47bfff] to-[#1a44c2] text-white rounded transition-colors"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-[#8f98a0] mb-6">
                <Link href="/" className="hover:text-white transition-colors">
                    Trang chủ
                </Link>
                <ChevronRight size={14} />
                <span className="text-[#c7d5e0]">Giỏ hàng</span>
            </nav>

            {/* Header */}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">
                Giỏ hàng của bạn
            </h1>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[#66c0f4]" />
                </div>
            ) : items.length === 0 ? (
                /* Empty Cart */
                <div className="flex flex-col items-center justify-center py-20">
                    <ShoppingCart size={64} className="text-[#3d4450] mb-4" />
                    <h2 className="text-xl font-semibold text-[#c7d5e0] mb-2">
                        Giỏ hàng trống
                    </h2>
                    <p className="text-[#8f98a0] mb-6">
                        Thêm game vào giỏ hàng để tiếp tục
                    </p>
                    <Link
                        href="/"
                        className="px-6 py-2 bg-[#2a475e] hover:bg-[#316282] text-white rounded transition-colors"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>
            ) : (
                /* Cart Content */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-[#1b2838] rounded-lg p-4 flex items-center gap-4 border border-[#2a475e]"
                            >
                                {/* Game Image */}
                                <Link href={`/game/${item.game_appid}`}>
                                    <img
                                        src={item.game ? getGameImage(item.game) : ''}
                                        alt={item.game?.name || 'Game'}
                                        className="w-[120px] h-[45px] object-cover rounded"
                                    />
                                </Link>

                                {/* Game Info */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/game/${item.game_appid}`}
                                        className="text-[#c7d5e0] hover:text-white font-medium truncate block"
                                    >
                                        {item.game?.name || 'Unknown Game'}
                                    </Link>
                                    <p className="text-xs text-[#8f98a0]">
                                        {item.game?.developer || ''}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                    {item.game?.discount_percent ? (
                                        <div className="flex items-center gap-2">
                                            <span className="bg-[#5c7e10] text-white text-xs px-1 py-0.5 rounded">
                                                -{item.game.discount_percent}%
                                            </span>
                                            <div>
                                                <span className="text-xs text-[#8f98a0] line-through block">
                                                    {formatPrice(item.game.original_price)}
                                                </span>
                                                <span className="text-[#5c7e10] font-medium">
                                                    {formatPrice(item.game.discount_price)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[#c7d5e0] font-medium">
                                            {formatPrice(item.game?.original_price || 0)}
                                        </span>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemove(item.game_appid)}
                                    disabled={removingId === item.game_appid}
                                    className="p-2 text-[#8f98a0] hover:text-red-400 hover:bg-red-500/10 
                                             rounded transition-colors disabled:opacity-50"
                                >
                                    {removingId === item.game_appid ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary Box */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1b2838] rounded-lg p-6 border border-[#2a475e] sticky top-[120px]">
                            <h3 className="text-sm text-[#8f98a0] uppercase tracking-wide mb-4">
                                Tóm tắt đơn hàng
                            </h3>

                            {/* Items count */}
                            <div className="flex justify-between text-sm text-[#c7d5e0] mb-2">
                                <span>{items.length} sản phẩm</span>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center py-4 border-t border-[#2a475e]">
                                <span className="text-[#8f98a0]">Tổng cộng:</span>
                                <span className="text-2xl font-bold text-white">
                                    {formatPrice(total)}
                                </span>
                            </div>

                            {/* Purchase Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut || items.length === 0}
                                className="w-full py-3 bg-[#5c7e10] hover:bg-[#6d8f1a] text-white 
                                         font-semibold rounded transition-colors 
                                         disabled:opacity-50 disabled:cursor-not-allowed
                                         flex items-center justify-center gap-2"
                            >
                                {checkingOut ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Mua cho bản thân'
                                )}
                            </button>

                            {/* Gift Button (Disabled) */}
                            <button
                                disabled
                                className="w-full py-3 mt-2 bg-[#3d4450] text-[#8b929a] 
                                         font-medium rounded cursor-not-allowed
                                         flex items-center justify-center gap-2"
                            >
                                <Gift size={16} />
                                Mua làm quà tặng
                            </button>

                            {/* Continue Shopping */}
                            <Link
                                href="/"
                                className="block text-center text-sm text-[#66c0f4] hover:text-white 
                                         transition-colors mt-4"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

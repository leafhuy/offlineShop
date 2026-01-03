'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Package, Copy, Check, Loader2, Key } from 'lucide-react';
import { getOrders } from '@/services/checkout.service';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getGameImage } from '@/utils/helpers';
import { toast } from 'sonner';

interface Order {
    id: string;
    game_appid: number;
    game_key: string;
    purchase_price: number;
    purchased_at: string;
    game?: {
        appid: number;
        name: string;
        header_image: string;
    };
}

export default function OrdersPage() {
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Fetch orders
    useEffect(() => {
        async function fetchOrders() {
            const { orders: data } = await getOrders();
            setOrders(data);
            setLoading(false);
        }
        fetchOrders();
    }, []);

    // Copy key to clipboard
    async function copyKey(key: string) {
        try {
            await navigator.clipboard.writeText(key.replace(/-/g, ''));
            setCopiedKey(key);
            toast.success('Đã copy key!');
            setTimeout(() => setCopiedKey(null), 2000);
        } catch {
            toast.error('Không thể copy');
        }
    }

    // Format date
    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Not logged in
    if (!user && !loading) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-20">
                    <Package size={64} className="text-[#3d4450] mb-4" />
                    <h2 className="text-xl font-semibold text-[#c7d5e0] mb-2">
                        Vui lòng đăng nhập
                    </h2>
                    <p className="text-[#8f98a0] mb-6">
                        Bạn cần đăng nhập để xem đơn hàng
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
                <span className="text-[#c7d5e0]">Đơn hàng của tôi</span>
            </nav>

            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 bg-[#66c0f4] rounded-lg">
                    <Package size={28} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                        Đơn hàng của tôi
                    </h1>
                    <p className="text-[#8f98a0]">
                        {orders.length} sản phẩm đã mua
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[#66c0f4]" />
                </div>
            ) : orders.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20">
                    <Package size={64} className="text-[#3d4450] mb-4" />
                    <h2 className="text-xl font-semibold text-[#c7d5e0] mb-2">
                        Chưa có đơn hàng
                    </h2>
                    <p className="text-[#8f98a0] mb-6">
                        Bạn chưa mua sản phẩm nào
                    </p>
                    <Link
                        href="/"
                        className="px-6 py-2 bg-[#5c7e10] hover:bg-[#6d8f1a] text-white rounded transition-colors"
                    >
                        Khám phá game
                    </Link>
                </div>
            ) : (
                /* Orders List */
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-[#1b2838] rounded-lg p-4 border border-[#2a475e]"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Left: Game Image & Info */}
                                <div className="flex gap-4 flex-1">
                                    <Link href={`/game/${order.game_appid}`}>
                                        <img
                                            src={order.game?.header_image || ''}
                                            alt={order.game?.name || 'Game'}
                                            className="w-[120px] h-[45px] object-cover rounded"
                                        />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/game/${order.game_appid}`}
                                            className="text-[#c7d5e0] hover:text-white font-medium truncate block"
                                        >
                                            {order.game?.name || 'Unknown Game'}
                                        </Link>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-[#8f98a0]">
                                            <span>Ngày mua: {formatDate(order.purchased_at)}</span>
                                            <span>Giá: {formatPrice(order.purchase_price)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Product Key */}
                                <div className="md:text-right">
                                    <div className="flex items-center gap-2 text-xs text-[#8f98a0] mb-1">
                                        <Key size={12} />
                                        <span>Product Key</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="px-3 py-2 bg-[#0a0f14] border border-[#2a475e] rounded 
                                                       text-sm font-mono text-[#66c0f4] tracking-wider">
                                            {order.game_key}
                                        </code>
                                        <button
                                            onClick={() => copyKey(order.game_key)}
                                            className="p-2 bg-[#2a475e] hover:bg-[#3d5a6c] text-white rounded transition-colors"
                                            title="Copy key"
                                        >
                                            {copiedKey === order.game_key ? (
                                                <Check size={16} className="text-green-400" />
                                            ) : (
                                                <Copy size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

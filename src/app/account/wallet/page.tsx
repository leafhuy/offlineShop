'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Wallet, Loader2, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { addFunds, getTransactionHistory, getWalletBalance, Transaction } from '@/services/wallet.service';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';

// Preset amounts in VND
const PRESET_AMOUNTS = [
    { value: 50000, label: '50.000₫' },
    { value: 100000, label: '100.000₫' },
    { value: 200000, label: '200.000₫' },
    { value: 500000, label: '500.000₫' },
    { value: 1000000, label: '1.000.000₫' },
];

export default function WalletPage() {
    const { user, refreshProfile } = useAuth();
    const { formatPrice } = useCurrency();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingAmount, setProcessingAmount] = useState<number | null>(null);

    // Fetch data on mount
    useEffect(() => {
        async function fetchData() {
            const [walletBalance, { transactions: txns }] = await Promise.all([
                getWalletBalance(),
                getTransactionHistory(),
            ]);
            setBalance(walletBalance);
            setTransactions(txns);
            setLoading(false);
        }
        fetchData();
    }, []);

    // Handle add funds
    async function handleAddFunds(amount: number) {
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        setProcessingAmount(amount);

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = await addFunds(amount);

        if (result.success) {
            setBalance(result.newBalance || balance + amount);
            toast.success('Nạp tiền thành công!');
            refreshProfile(); // Update navbar balance

            // Refresh transactions
            const { transactions: txns } = await getTransactionHistory();
            setTransactions(txns);
        } else {
            toast.error(result.error || 'Không thể nạp tiền');
        }

        setProcessingAmount(null);
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
                    <Wallet size={64} className="text-[#3d4450] mb-4" />
                    <h2 className="text-xl font-semibold text-[#c7d5e0] mb-2">
                        Vui lòng đăng nhập
                    </h2>
                    <p className="text-[#8f98a0] mb-6">
                        Bạn cần đăng nhập để quản lý ví
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
                <Link href="/profile" className="hover:text-white transition-colors">
                    Tài khoản
                </Link>
                <ChevronRight size={14} />
                <span className="text-[#c7d5e0]">Ví của tôi</span>
            </nav>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[#66c0f4]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Add Funds */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-[#5c7e10] rounded-lg">
                                <Wallet size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    Nạp tiền vào ví
                                </h1>
                                <p className="text-[#8f98a0]">
                                    Chọn một mức nạp tiền bên dưới
                                </p>
                            </div>
                        </div>

                        {/* Preset Amounts */}
                        <div className="space-y-3">
                            {PRESET_AMOUNTS.map((preset) => (
                                <div
                                    key={preset.value}
                                    className="bg-[#1b2838] rounded-lg p-4 flex items-center justify-between border border-[#2a475e]"
                                >
                                    <div className="flex items-center gap-3">
                                        <Plus size={20} className="text-[#5c7e10]" />
                                        <span className="text-[#c7d5e0]">
                                            Nạp <span className="text-white font-medium">{preset.label}</span> vào tài khoản
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleAddFunds(preset.value)}
                                        disabled={processingAmount !== null}
                                        className="px-5 py-2 bg-[#5c7e10] hover:bg-[#6d8f1a] text-white font-medium rounded
                                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                                 flex items-center gap-2"
                                    >
                                        {processingAmount === preset.value ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Nạp tiền'
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Transaction History */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-white mb-4">
                                Lịch sử giao dịch
                            </h2>

                            {transactions.length === 0 ? (
                                <div className="bg-[#1b2838] rounded-lg p-8 text-center border border-[#2a475e]">
                                    <p className="text-[#8f98a0]">
                                        Chưa có giao dịch nào
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-[#1b2838] rounded-lg border border-[#2a475e] overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#0a0f14]">
                                                <th className="px-4 py-3 text-left text-xs font-medium text-[#8f98a0] uppercase">
                                                    Thời gian
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-[#8f98a0] uppercase">
                                                    Loại
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-[#8f98a0] uppercase">
                                                    Nội dung
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-[#8f98a0] uppercase">
                                                    Số tiền
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((txn, index) => (
                                                <tr
                                                    key={txn.id}
                                                    className={index % 2 === 0 ? 'bg-[#1b2838]' : 'bg-[#16202d]'}
                                                >
                                                    <td className="px-4 py-3 text-sm text-[#8f98a0]">
                                                        {formatDate(txn.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`flex items-center gap-1 ${txn.type === 'deposit' ? 'text-[#5c7e10]' : 'text-[#c75c5c]'
                                                            }`}>
                                                            {txn.type === 'deposit' ? (
                                                                <>
                                                                    <ArrowDownCircle size={14} />
                                                                    Nạp tiền
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ArrowUpCircle size={14} />
                                                                    Mua hàng
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-[#c7d5e0]">
                                                        {txn.description || '-'}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm text-right font-medium ${txn.amount > 0 ? 'text-[#5c7e10]' : 'text-[#c75c5c]'
                                                        }`}>
                                                        {txn.amount > 0 ? '+' : ''}{formatPrice(txn.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Balance Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1b2838] rounded-lg p-6 border border-[#2a475e] sticky top-[120px]">
                            <h3 className="text-sm text-[#8f98a0] uppercase tracking-wide mb-2">
                                Tài khoản của bạn
                            </h3>
                            <p className="text-[#c7d5e0] mb-4">
                                {user?.email}
                            </p>

                            <div className="border-t border-[#2a475e] pt-4">
                                <span className="text-sm text-[#8f98a0]">Số dư hiện tại</span>
                                <div className="text-3xl font-bold text-[#5c7e10] mt-1">
                                    {formatPrice(balance)}
                                </div>
                            </div>

                            <Link
                                href="/orders"
                                className="block text-center text-sm text-[#66c0f4] hover:text-white 
                                         transition-colors mt-6"
                            >
                                Xem đơn hàng đã mua →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

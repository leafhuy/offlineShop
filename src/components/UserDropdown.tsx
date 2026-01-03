'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/auth.service';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ChevronDown, User, LogOut, Wallet } from 'lucide-react';

export default function UserDropdown() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const { formatPrice } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function handleSignOut() {
        await signOut();
        setIsOpen(false);
        router.push('/');
        router.refresh();
    }

    // Loading state
    if (loading) {
        return (
            <div className="w-10 h-10 rounded-full bg-[#32353c] animate-pulse" />
        );
    }

    // Guest state - show Login link
    if (!user) {
        return (
            <Link
                href="/login"
                className="text-sm text-[#b8b6b4] hover:text-white transition-colors"
            >
                Đăng nhập
            </Link>
        );
    }

    // Authenticated state - show wallet + avatar dropdown
    const displayName = profile?.username || user.email?.split('@')[0] || 'User';
    const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
    const walletBalance = profile?.wallet_balance || 0;

    return (
        <div className="flex items-center gap-3">
            {/* Wallet Balance */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2838] rounded text-sm">
                <Wallet size={14} className="text-[#66c0f4]" />
                <span className="text-[#c7d5e0] font-medium">
                    {formatPrice(walletBalance)}
                </span>
            </div>

            {/* Avatar Dropdown */}
            <div ref={dropdownRef} className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors"
                >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#2a475e] hover:border-[#66c0f4] transition-colors">
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <ChevronDown
                        size={14}
                        className={`text-[#8f98a0] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1b2838] border border-[#2a475e] rounded-lg shadow-2xl overflow-hidden z-50 animate-fadeIn">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-[#2a475e]">
                            <p className="text-sm font-medium text-[#c7d5e0] truncate">{displayName}</p>
                            <p className="text-xs text-[#8f98a0] truncate">{user.email}</p>
                        </div>

                        {/* Wallet (Mobile) */}
                        <div className="md:hidden px-4 py-3 border-b border-[#2a475e] flex items-center gap-2">
                            <Wallet size={14} className="text-[#66c0f4]" />
                            <span className="text-sm text-[#c7d5e0]">{formatPrice(walletBalance)}</span>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#8f98a0] hover:text-white hover:bg-[#2a475e]/50 transition-colors"
                            >
                                <User size={16} />
                                Trang cá nhân
                            </Link>
                            <Link
                                href="/account/wallet"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#8f98a0] hover:text-white hover:bg-[#2a475e]/50 transition-colors"
                            >
                                <Wallet size={16} />
                                Nạp tiền
                            </Link>
                            <Link
                                href="/orders"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#8f98a0] hover:text-white hover:bg-[#2a475e]/50 transition-colors"
                            >
                                <User size={16} />
                                Đơn hàng của tôi
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8f98a0] hover:text-white hover:bg-[#2a475e]/50 transition-colors"
                            >
                                <LogOut size={16} />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

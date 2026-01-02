'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, ShoppingCart } from 'lucide-react';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import GlobalSearch from './GlobalSearch';

interface NavbarProps {
    genres: string[];
}

// Top categories with images
const TOP_CATEGORIES = [
    { name: 'Action', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_184x69.jpg' },
    { name: 'RPG', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_184x69.jpg' },
    { name: 'Adventure', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_184x69.jpg' },
    { name: 'Strategy', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/289070/capsule_184x69.jpg' },
    { name: 'Simulation', image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/255710/capsule_184x69.jpg' },
];

export default function Navbar({ genres }: NavbarProps) {
    const { currency, setCurrency } = useCurrency();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-[#171a21]">
            {/* Single Row Navbar - Clean Layout */}
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-[104px]">

                    {/* ===== LEFT GROUP ===== */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <span className="text-3xl font-bold text-[#c7d5e0]">
                                offlineShop
                            </span>
                        </Link>

                        {/* Categories Mega Menu */}
                        <div
                            ref={dropdownRef}
                            className="relative hidden lg:block"
                            onMouseEnter={() => setIsMenuOpen(true)}
                            onMouseLeave={() => setIsMenuOpen(false)}
                        >
                            <button
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#c7d5e0] hover:text-white transition-colors"
                            >
                                Categories
                                <ChevronDown size={16} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Mega Menu Dropdown */}
                            {isMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-[650px] bg-[#1b2838] border border-[#2a475e] rounded-lg shadow-2xl animate-fadeIn">
                                    <div className="grid grid-cols-2 gap-6 p-6">
                                        {/* Left Column - Top Categories with Images */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-[#c7d5e0] mb-4 uppercase tracking-wide">
                                                Danh mục phổ biến
                                            </h3>
                                            <div className="space-y-2">
                                                {TOP_CATEGORIES.map((category) => (
                                                    <Link
                                                        key={category.name}
                                                        href={`/browse?category=${encodeURIComponent(category.name)}`}
                                                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-[#2a475e]/50 transition-colors group"
                                                    >
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className="w-[100px] h-[38px] object-cover rounded"
                                                        />
                                                        <span className="text-sm text-[#8f98a0] group-hover:text-white font-medium">
                                                            {category.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Column - All Genres Text List */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-[#c7d5e0] mb-4 uppercase tracking-wide">
                                                Tất cả thể loại
                                            </h3>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {genres.map((genre) => (
                                                    <Link
                                                        key={genre}
                                                        href={`/browse?category=${encodeURIComponent(genre)}`}
                                                        className="text-sm text-[#8f98a0] hover:text-[#66c0f4] py-1.5 transition-colors"
                                                    >
                                                        {genre}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===== CENTER: Global Search ===== */}
                    <div className="hidden md:flex flex-1 justify-center px-8">
                        <GlobalSearch />
                    </div>

                    {/* ===== RIGHT GROUP (User Actions) ===== */}
                    <div className="flex items-center gap-3">
                        {/* Currency Selector */}
                        <div className="relative hidden md:block">
                            <select
                                className="appearance-none bg-transparent text-sm text-[#c7d5e0] hover:text-white 
                                           px-3 py-2 pr-7 rounded cursor-pointer hover:bg-white/10 transition-colors
                                           focus:outline-none focus:ring-2 focus:ring-[#66c0f4]/50"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                            >
                                <option value="VND" className="bg-[#1b2838] text-white">🇻🇳 VND</option>
                                <option value="USD" className="bg-[#1b2838] text-white">🇺🇸 USD</option>
                                <option value="EUR" className="bg-[#1b2838] text-white">🇪🇺 EUR</option>
                            </select>
                            <ChevronDown
                                size={14}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#c7d5e0] pointer-events-none"
                            />
                        </div>

                        {/* Cart Icon */}
                        <button className="relative p-2.5 text-[#c7d5e0] hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <ShoppingCart size={22} />
                            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#5c7e10] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                0
                            </span>
                        </button>

                        {/* User Avatar */}
                        <button className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#2a475e] hover:border-[#66c0f4] transition-colors">
                            <img
                                src="https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        </button>

                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden p-2 text-[#c7d5e0] hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-[#1b2838] border-t border-[#2a475e] px-6 py-4">
                    {/* Mobile Search */}
                    <div className="mb-4">
                        <GlobalSearch />
                    </div>

                    {/* Mobile Categories */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-[#c7d5e0] uppercase">Categories</h3>
                        {TOP_CATEGORIES.map((category) => (
                            <Link
                                key={category.name}
                                href={`/browse?category=${encodeURIComponent(category.name)}`}
                                className="block py-2 text-sm text-[#8f98a0] hover:text-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}

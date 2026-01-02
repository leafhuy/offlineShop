'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { Game } from '@/types/game';
import { searchGames } from '@/services/game.service';
import { useDebounce } from '@/hooks/useDebounce';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function GlobalSearch() {
    const router = useRouter();
    const { formatPrice } = useCurrency();

    // State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounced query (300ms delay)
    const debouncedQuery = useDebounce(query, 300);

    // Search effect - triggers when debounced query changes
    useEffect(() => {
        async function performSearch() {
            if (!debouncedQuery || debouncedQuery.trim().length < 2) {
                setResults([]);
                setShowDropdown(false);
                return;
            }

            setIsLoading(true);
            try {
                const searchResults = await searchGames(debouncedQuery, 6);
                setResults(searchResults);
                setShowDropdown(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }

        performSearch();
    }, [debouncedQuery]);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            // Navigate to search results page
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowDropdown(false);
            inputRef.current?.blur();
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            inputRef.current?.blur();
        }
    }, [query, router]);

    // Handle input focus
    const handleFocus = () => {
        if (results.length > 0) {
            setShowDropdown(true);
        }
    };

    // Handle result click
    const handleResultClick = () => {
        setShowDropdown(false);
        setQuery('');
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-[500px]">
            {/* Search Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder="Search games..."
                    className="w-full bg-[#316282] text-white placeholder-[#8b929a] text-sm 
                             px-4 py-2 pr-10 rounded
                             border border-transparent
                             focus:border-[#67c1f5] focus:outline-none focus:ring-1 focus:ring-[#67c1f5]/50
                             transition-all duration-200"
                />

                {/* Search Icon / Loading Spinner */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 size={16} className="text-[#67c1f5] animate-spin" />
                    ) : (
                        <Search size={16} className="text-[#8b929a]" />
                    )}
                </div>
            </div>

            {/* Dropdown Results */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50
                              bg-[#3d4450] rounded shadow-xl overflow-hidden
                              border border-[#2a475e]">
                    {results.length > 0 ? (
                        <div className="max-h-[400px] overflow-y-auto">
                            {results.map((game) => (
                                <SearchResultItem
                                    key={game.appid}
                                    game={game}
                                    formatPrice={formatPrice}
                                    onClick={handleResultClick}
                                />
                            ))}

                            {/* View All Results */}
                            <Link
                                href={`/search?q=${encodeURIComponent(query.trim())}`}
                                onClick={handleResultClick}
                                className="block py-3 text-center text-sm text-[#67c1f5] 
                                         hover:bg-[#4a5562] transition-colors
                                         border-t border-[#2a475e]"
                            >
                                View all results for "{query}"
                            </Link>
                        </div>
                    ) : (
                        <div className="py-6 text-center text-sm text-[#8b929a]">
                            No items match your query
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Individual search result item
interface SearchResultItemProps {
    game: Game;
    formatPrice: (price: number) => string;
    onClick: () => void;
}

function SearchResultItem({ game, formatPrice, onClick }: SearchResultItemProps) {
    const hasDiscount = game.discount_percent > 0;

    return (
        <Link
            href={`/game/${game.appid}`}
            onClick={onClick}
            className="flex items-center gap-3 p-2 
                     hover:bg-[#67c1f5] group transition-colors
                     border-b border-[#2a475e] last:border-b-0"
        >
            {/* Thumbnail */}
            <img
                src={game.header_image || '/placeholder.png'}
                alt={game.name}
                className="w-16 h-9 object-cover rounded flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white group-hover:text-[#1b2838] truncate font-medium">
                    {game.name}
                </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {hasDiscount && (
                    <span className="bg-[#a4d007] text-black text-xs font-bold px-1.5 py-0.5 rounded">
                        -{game.discount_percent}%
                    </span>
                )}
                <div className="text-right">
                    {hasDiscount ? (
                        <>
                            <span className="text-xs text-[#8b929a] group-hover:text-[#1b2838]/60 line-through block">
                                {formatPrice(game.original_price)}
                            </span>
                            <span className="text-sm text-[#a4d007] group-hover:text-[#1b2838] font-bold">
                                {formatPrice(game.discount_price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-white group-hover:text-[#1b2838]">
                            {game.original_price > 0 ? formatPrice(game.original_price) : 'Free'}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Game } from '@/types/game';
import { getGameImage } from '@/utils/helpers';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Monitor, Apple, Server } from 'lucide-react';
import HoverPreview from './HoverPreview';

interface GameCardProps {
    game: Game;
}

export default function GameCard({ game }: GameCardProps) {
    const { formatPrice } = useCurrency();
    const [showPreview, setShowPreview] = useState(false);
    const [previewPosition, setPreviewPosition] = useState<'left' | 'right'>('right');
    const [cardRect, setCardRect] = useState<DOMRect | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = useCallback(() => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setCardRect(rect);

            // Determine if popup should appear on left or right
            const windowWidth = window.innerWidth;
            const cardCenter = rect.left + rect.width / 2;
            setPreviewPosition(cardCenter > windowWidth / 2 ? 'left' : 'right');
        }

        // Delay showing preview for smoother UX
        timeoutRef.current = setTimeout(() => {
            setShowPreview(true);
        }, 300);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setShowPreview(false);
    }, []);

    const hasDiscount = game.discount_percent > 0;

    return (
        <>
            <div
                ref={cardRef}
                className="group relative bg-steam-bg-card rounded-lg overflow-hidden 
                   hover:scale-[1.02] hover:shadow-lg transition-all duration-300
                   border border-transparent hover:border-steam-border"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Link href={`/game/${game.appid}`} className="block">
                    {/* Header Image */}
                    <div className="relative aspect-[460/215] overflow-hidden">
                        <img
                            src={getGameImage(game)}
                            alt={game.name}
                            className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                            loading="lazy"
                        />

                        {/* Discount Badge (on image) */}
                        {hasDiscount && (
                            <div className="absolute top-2 right-2 bg-steam-accent-green text-black 
                            font-bold text-xs px-2 py-1 rounded">
                                -{game.discount_percent}%
                            </div>
                        )}
                    </div>

                    {/* Info Bar */}
                    <div className="p-3">
                        {/* Game Name */}
                        <h3 className="text-sm font-medium text-steam-text-light mb-2 truncate group-hover:text-steam-accent-blue transition-colors">
                            {game.name}
                        </h3>

                        {/* Bottom Row: Price & Platforms */}
                        <div className="flex items-center justify-between">
                            {/* Price Section */}
                            <div className="flex items-center gap-2">
                                {hasDiscount ? (
                                    <>
                                        <span className="text-xs text-steam-text-secondary line-through">
                                            {formatPrice(game.original_price)}
                                        </span>
                                        <span className="text-sm font-bold text-steam-price-discount">
                                            {formatPrice(game.discount_price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm font-medium text-steam-text-light">
                                        {game.original_price > 0
                                            ? formatPrice(game.original_price)
                                            : 'Free to Play'}
                                    </span>
                                )}
                            </div>

                            {/* Platform Icons */}
                            <div className="flex items-center gap-1">
                                {game.windows && <Monitor size={12} className="text-steam-text-secondary" />}
                                {game.mac && <Apple size={12} className="text-steam-text-secondary" />}
                                {game.linux && <Server size={12} className="text-steam-text-secondary" />}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Hover Preview Portal */}
            {showPreview && cardRect && (
                <HoverPreview
                    game={game}
                    position={previewPosition}
                    parentRect={cardRect}
                />
            )}
        </>
    );
}

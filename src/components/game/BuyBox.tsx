'use client';

import { Game } from '@/types/game';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ShoppingCart } from 'lucide-react';

interface BuyBoxProps {
    game: Game;
}

export default function BuyBox({ game }: BuyBoxProps) {
    const { formatPrice } = useCurrency();
    const hasDiscount = game.discount_percent > 0;
    const isFree = game.original_price === 0;

    return (
        <div className="bg-gradient-to-r from-[#374c5a] via-[#2e4453] to-[#1b2838] rounded p-1">
            <div className="bg-[#0a141d]/90 rounded p-4">
                <h2 className="text-base text-[#c6d4df] mb-4">
                    Buy {game.name}
                </h2>

                <div className="flex items-center justify-end gap-3">
                    {/* Price Section */}
                    {hasDiscount ? (
                        <div className="flex items-center gap-2">
                            {/* Discount Badge */}
                            <div className="bg-[#4c6b22] text-[#a4d007] font-bold text-xl px-2 py-1 rounded">
                                -{game.discount_percent}%
                            </div>
                            {/* Price Box */}
                            <div className="bg-[#000000]/40 px-3 py-1 rounded text-right">
                                <div className="text-xs text-[#8b929a] line-through">
                                    {formatPrice(game.original_price)}
                                </div>
                                <div className="text-sm font-medium text-[#beee11]">
                                    {formatPrice(game.discount_price)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#000000]/40 px-4 py-2 rounded">
                            <span className="text-sm font-medium text-[#c6d4df]">
                                {isFree ? 'Free to Play' : formatPrice(game.original_price)}
                            </span>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button className="flex items-center gap-2 px-5 py-2 
                                     bg-gradient-to-b from-[#75b022] to-[#588a1b]
                                     hover:from-[#8bc527] hover:to-[#6b9c1f]
                                     text-white font-medium text-sm rounded
                                     shadow-[0_2px_4px_rgba(0,0,0,0.4)]
                                     transition-all active:scale-95">
                        <ShoppingCart size={16} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

'use client';

import { Game } from '@/types/game';
import { useCurrency } from '@/contexts/CurrencyContext';
import AddToCartButton from '@/components/AddToCartButton';

interface BuyBoxProps {
    game: Game;
    isOwned?: boolean;
    isInCart?: boolean;
}

export default function BuyBox({ game, isOwned = false, isInCart = false }: BuyBoxProps) {
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
                    <AddToCartButton
                        appid={game.appid}
                        price={game.discount_price || game.original_price}
                        isOwned={isOwned}
                        isInCart={isInCart}
                    />
                </div>
            </div>
        </div>
    );
}

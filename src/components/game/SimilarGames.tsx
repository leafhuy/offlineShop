'use client';

import Link from 'next/link';
import { Game } from '@/types/game';
import { getGameImage } from '@/utils/helpers';
import { useCurrency } from '@/contexts/CurrencyContext';

interface SimilarGamesProps {
    games: Game[];
}

export default function SimilarGames({ games }: SimilarGamesProps) {
    const { formatPrice } = useCurrency();

    if (!games || games.length === 0) return null;

    return (
        <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-[#66c0f4]">
                Gợi ý tương tự
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {games.map((game) => {
                    const hasDiscount = game.discount_percent > 0;

                    return (
                        <Link
                            key={game.appid}
                            href={`/game/${game.appid}`}
                            className="group bg-[#1b2838] rounded-lg overflow-hidden border border-transparent
                                     hover:border-[#67c1f5] hover:scale-[1.02] transition-all duration-200"
                        >
                            {/* Game Image */}
                            <div className="relative aspect-[460/215] overflow-hidden">
                                <img
                                    src={getGameImage(game)}
                                    alt={game.name}
                                    className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                                    loading="lazy"
                                />

                                {/* Discount Badge */}
                                {hasDiscount && (
                                    <div className="absolute top-1 right-1 bg-[#a4d007] text-black 
                                                  text-xs font-bold px-1.5 py-0.5 rounded">
                                        -{game.discount_percent}%
                                    </div>
                                )}
                            </div>

                            {/* Game Info */}
                            <div className="p-2">
                                <h3 className="text-xs font-medium text-[#c7d5e0] truncate 
                                             group-hover:text-[#67c1f5] transition-colors">
                                    {game.name}
                                </h3>

                                {/* Price */}
                                <div className="mt-1 flex items-center gap-1.5">
                                    {hasDiscount ? (
                                        <>
                                            <span className="text-[10px] text-[#8b929a] line-through">
                                                {formatPrice(game.original_price)}
                                            </span>
                                            <span className="text-xs font-bold text-[#a4d007]">
                                                {formatPrice(game.discount_price)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-[#c7d5e0]">
                                            {game.original_price > 0
                                                ? formatPrice(game.original_price)
                                                : 'Free'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

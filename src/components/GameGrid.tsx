'use client';

import GameCard from './GameCard';
import { Game } from '@/types/game';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface GameGridProps {
    title?: string;
    games: Game[];
    viewAllLink?: string;
}

export default function GameGrid({ title, games, viewAllLink }: GameGridProps) {
    if (games.length === 0) {
        return null;
    }

    return (
        <section className="mb-10">
            {/* Section Header - Only render if title exists */}
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-steam-text-light uppercase tracking-wide">
                        {title}
                    </h2>
                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="flex items-center gap-1 text-sm text-steam-text-secondary 
                     hover:text-steam-accent-blue transition-colors"
                        >
                            View All
                            <ChevronRight size={16} />
                        </Link>
                    )}
                </div>
            )}

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {games.map((game) => (
                    <GameCard key={game.uiid} game={game} />
                ))}
            </div>
        </section>
    );
}

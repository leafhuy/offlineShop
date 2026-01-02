'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Game } from '@/types/game';
import GameCard from './GameCard';

interface InfiniteScrollGamesProps {
    initialGames: Game[];
    initialHasMore: boolean;
}

export default function InfiniteScrollGames({
    initialGames,
    initialHasMore,
}: InfiniteScrollGamesProps) {
    const [games, setGames] = useState<Game[]>(initialGames);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [offset, setOffset] = useState(initialGames.length);
    const loaderRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/games?offset=${offset}&limit=20`);
            const data = await response.json();

            if (data.games && data.games.length > 0) {
                setGames((prev) => [...prev, ...data.games]);
                setOffset((prev) => prev + data.games.length);
                setHasMore(data.hasMore);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more games:', error);
        } finally {
            setIsLoading(false);
        }
    }, [offset, isLoading, hasMore]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loadMore, hasMore, isLoading]);

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-steam-text-light">
                    Popular Games
                </h2>
                <span className="text-sm text-steam-text-secondary">
                    Sorted by total reviews
                </span>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {games.map((game) => (
                    <GameCard key={game.uiid} game={game} />
                ))}
            </div>

            {/* Loading Indicator / Scroll Trigger */}
            <div ref={loaderRef} className="flex justify-center py-8">
                {isLoading && (
                    <div className="flex items-center gap-2 text-steam-text-secondary">
                        <div className="w-5 h-5 border-2 border-steam-accent-blue border-t-transparent rounded-full animate-spin" />
                        <span>Loading more games...</span>
                    </div>
                )}
                {!hasMore && games.length > 0 && (
                    <p className="text-steam-text-secondary text-sm">
                        You&apos;ve reached the end! ({games.length} games loaded)
                    </p>
                )}
            </div>
        </section>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Game } from '@/types/game';
import { getGameImage } from '@/utils/helpers';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ChevronLeft, ChevronRight, Monitor, Apple, Server } from 'lucide-react';

interface HeroProps {
    games: Game[];
}

export default function Hero({ games }: HeroProps) {
    const { formatPrice } = useCurrency();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const currentGame = games[currentIndex];

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, []);

    const goToPrevious = useCallback(() => {
        const newIndex = currentIndex === 0 ? games.length - 1 : currentIndex - 1;
        goToSlide(newIndex);
    }, [currentIndex, games.length, goToSlide]);

    const goToNext = useCallback(() => {
        const newIndex = currentIndex === games.length - 1 ? 0 : currentIndex + 1;
        goToSlide(newIndex);
    }, [currentIndex, games.length, goToSlide]);

    // Auto-play effect
    useEffect(() => {
        if (!isAutoPlaying || games.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === games.length - 1 ? 0 : prev + 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, games.length]);

    if (games.length === 0) {
        return (
            <section className="relative h-[450px] bg-steam-bg-card rounded-lg flex items-center justify-center">
                <p className="text-steam-text-secondary">No featured games available</p>
            </section>
        );
    }

    return (
        <section className="relative">
            {/* Main Display */}
            <div className="relative h-[450px] rounded-lg overflow-hidden group">
                {/* Clickable Hero Link */}
                <Link
                    href={`/game/${currentGame.appid}`}
                    className="absolute inset-0 z-10 cursor-pointer"
                    aria-label={`View details for ${currentGame.name}`}
                />

                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: `url(${getGameImage(currentGame)})` }}
                >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-steam-bg-main/90 via-steam-bg-main/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-steam-bg-main via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative h-full flex pointer-events-none">
                    {/* Left Content */}
                    <div className="flex-1 flex flex-col justify-end p-8 max-w-xl">
                        <h2 className="text-4xl font-bold text-steam-text-light mb-4 text-shadow-lg">
                            {currentGame.name}
                        </h2>

                        {currentGame.desc_snippet && (
                            <p className="text-steam-text-primary text-sm mb-4 line-clamp-3">
                                {currentGame.desc_snippet}
                            </p>
                        )}

                        {/* Platform Icons */}
                        <div className="flex items-center gap-2 mb-4">
                            {currentGame.windows && <Monitor size={16} className="text-steam-text-secondary" />}
                            {currentGame.mac && <Apple size={16} className="text-steam-text-secondary" />}
                            {currentGame.linux && <Server size={16} className="text-steam-text-secondary" />}
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-6">
                            {currentGame.discount_percent > 0 && (
                                <span className="bg-steam-accent-green text-black font-bold text-sm px-2 py-1 rounded">
                                    -{currentGame.discount_percent}%
                                </span>
                            )}
                            {currentGame.discount_percent > 0 && (
                                <span className="text-steam-text-secondary line-through text-sm">
                                    {formatPrice(currentGame.original_price)}
                                </span>
                            )}
                            <span className="text-steam-text-light text-xl font-bold">
                                {formatPrice(currentGame.discount_price || currentGame.original_price)}
                            </span>
                        </div>

                        {/* CTA Button */}
                        <button className="w-fit px-8 py-3 bg-steam-accent-green hover:bg-steam-accent-green/80 
                             text-black font-bold rounded transition-colors pointer-events-auto z-20 relative">
                            Add to Cart
                        </button>
                    </div>

                    {/* Right - Featured Image */}
                    <div className="hidden lg:flex flex-1 items-center justify-center p-8">
                        <img
                            src={getGameImage(currentGame)}
                            alt={currentGame.name}
                            className="max-h-[350px] rounded-lg shadow-2xl object-cover"
                        />
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 
                   rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                    <ChevronLeft size={24} className="text-steam-text-light" />
                </button>
                <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 
                   rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                    <ChevronRight size={24} className="text-steam-text-light" />
                </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {games.map((game, index) => (
                    <button
                        key={game.uiid}
                        onClick={() => goToSlide(index)}
                        className={`flex-shrink-0 rounded overflow-hidden transition-all duration-300
                       ${index === currentIndex
                                ? 'ring-2 ring-steam-accent-blue'
                                : 'opacity-60 hover:opacity-100'}`}
                    >
                        <img
                            src={getGameImage(game)}
                            alt={game.name}
                            className="w-[160px] h-[75px] object-cover"
                        />
                    </button>
                ))}
            </div>
        </section>
    );
}

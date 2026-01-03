'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Game } from '@/types/game';
import { getGameImage, parseMediaString, parseMovieUrls, parseCommaString } from '@/utils/helpers';
import { calculateReviewScore, formatReviewCount } from '@/utils/review';

interface HoverPreviewProps {
    game: Game;
    position: 'left' | 'right';
    parentRect: DOMRect;
}

export default function HoverPreview({ game, position, parentRect }: HoverPreviewProps) {
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const screenshots = parseMediaString(game.screenshots);
    const movies = parseMovieUrls(game.movies);
    const genres = parseCommaString(game.genre);
    const tags = parseCommaString(game.popular_tags);
    const reviewScore = calculateReviewScore(game.positive, game.negative);

    // Determine media source - prioritize video, fallback to screenshot
    const hasVideo = movies.length > 0 && !videoError;
    const mediaUrl = hasVideo ? movies[0] : (screenshots[0] || getGameImage(game));

    // Calculate position
    const style: React.CSSProperties = {
        position: 'fixed',
        top: Math.max(10, parentRect.top - 50),
        zIndex: 9999,
    };

    // Arrow position (vertically centered on the card)
    const arrowTop = parentRect.top + parentRect.height / 2 - (Math.max(10, parentRect.top - 50));

    if (position === 'right') {
        style.left = parentRect.right + 15;
    } else {
        style.right = window.innerWidth - parentRect.left + 15;
    }

    // Auto-play video when mounted
    useEffect(() => {
        if (videoRef.current && hasVideo) {
            videoRef.current.play().catch(() => setVideoError(true));
        }
    }, [hasVideo]);

    // Combine genres and tags for display
    const allTags = [...genres, ...tags.filter(tag => !genres.includes(tag))];

    return (
        <div
            style={style}
            className="w-[340px] bg-[#1b2838] border border-[#2a475e] rounded-lg shadow-2xl 
                 overflow-visible animate-fadeIn relative"
        >
            {/* Arrow pointer pointing to the game card */}
            <div
                className={`absolute w-0 h-0 border-solid ${position === 'right'
                    ? 'border-r-[12px] border-r-[#1b2838] border-y-[10px] border-y-transparent border-l-0 -left-3'
                    : 'border-l-[12px] border-l-[#1b2838] border-y-[10px] border-y-transparent border-r-0 -right-3'
                    }`}
                style={{ top: Math.min(Math.max(20, arrowTop), 280) }}
            />
            {/* Arrow border (outer) */}
            <div
                className={`absolute w-0 h-0 border-solid ${position === 'right'
                    ? 'border-r-[14px] border-r-[#2a475e] border-y-[12px] border-y-transparent border-l-0 -left-[15px]'
                    : 'border-l-[14px] border-l-[#2a475e] border-y-[12px] border-y-transparent border-r-0 -right-[15px]'
                    } -z-10`}
                style={{ top: Math.min(Math.max(18, arrowTop - 2), 278) }}
            />
            {/* 1. Header - Title & Release Date */}
            <div className="p-4 pb-2">
                <h3 className="text-xl font-bold text-white leading-tight mb-1">
                    {game.name}
                </h3>
                {game.release_date && (
                    <p className="text-xs text-gray-400">
                        Released: {game.release_date}
                    </p>
                )}
            </div>

            {/* 2. Body - Image/Auto-play Video */}
            <div className="relative h-[170px] bg-[#0a0f14]">
                {hasVideo ? (
                    <video
                        ref={videoRef}
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={() => setVideoError(true)}
                    />
                ) : (
                    <img
                        src={mediaUrl}
                        alt={game.name}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* 3. Description */}
            <div className="px-4 py-3">
                {game.desc_snippet && (
                    <p className="text-xs text-gray-300 line-clamp-4 leading-relaxed">
                        {game.desc_snippet}
                    </p>
                )}
            </div>

            {/* 4. Review Box */}
            <div className="mx-4 mb-3 p-3 bg-[#202731] rounded">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Overall Reviews:</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${reviewScore.className}`}>
                        {reviewScore.label}
                    </span>
                    {reviewScore.total > 0 && (
                        <span className="text-xs text-gray-400">
                            ({formatReviewCount(reviewScore.total)} reviews)
                        </span>
                    )}
                </div>
            </div>

            {/* 5. Genre + Tags */}
            {allTags.length > 0 && (
                <div className="px-4 pb-4">
                    <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">
                        Popular user-defined tags:
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {allTags.slice(0, 8).map((tag) => (
                            <Link
                                key={tag}
                                href={`/category/${encodeURIComponent(tag)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-2 py-0.5 text-[10px] bg-[#384959] text-[#8bb9e1] 
                                    rounded-sm hover:bg-[#67c1f5] hover:text-white transition-colors cursor-pointer"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

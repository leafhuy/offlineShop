'use client';

import { useState, useRef, useEffect } from 'react';
import { parseMediaString, parseMovieUrls } from '@/utils/helpers';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface MediaGalleryProps {
    screenshots: string | null;
    movies: string | null;
    gameName: string;
}

interface MediaItem {
    type: 'video' | 'image';
    url: string;
    thumbnail?: string;
}

export default function MediaGallery({ screenshots, movies, gameName }: MediaGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);

    // Parse media
    const screenshotUrls = parseMediaString(screenshots);
    const movieUrls = parseMovieUrls(movies);

    // Combine into media items (videos first)
    const mediaItems: MediaItem[] = [
        ...movieUrls.map(url => ({ type: 'video' as const, url })),
        ...screenshotUrls.map(url => ({ type: 'image' as const, url })),
    ];

    const currentItem = mediaItems[currentIndex];

    // Auto-play video when mounted or when video changes
    useEffect(() => {
        if (currentItem?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(() => setVideoError(true));
        }
    }, [currentIndex, currentItem?.type]);

    // Scroll thumbnail into view when index changes
    useEffect(() => {
        const container = thumbnailContainerRef.current;
        if (container) {
            const thumbnail = container.children[currentIndex] as HTMLElement;
            if (thumbnail) {
                thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentIndex]);

    const goToPrevious = () => {
        setCurrentIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
        setVideoError(false);
    };

    const goToNext = () => {
        setCurrentIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1);
        setVideoError(false);
    };

    if (mediaItems.length === 0) {
        return (
            <div className="aspect-video bg-[#0a0f14] rounded-lg flex items-center justify-center">
                <p className="text-[#8b929a]">No media available</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Main Player */}
            <div className="relative aspect-video bg-[#0a0f14] rounded-lg overflow-hidden group">
                {currentItem.type === 'video' && !videoError ? (
                    <video
                        ref={videoRef}
                        src={currentItem.url}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        onError={() => setVideoError(true)}
                    />
                ) : (
                    <img
                        src={currentItem.type === 'video' && videoError ? screenshotUrls[0] : currentItem.url}
                        alt={`${gameName} screenshot`}
                        className="w-full h-full object-contain"
                    />
                )}

                {/* Navigation Arrows */}
                {mediaItems.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 
                                     rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={24} className="text-white" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 
                                     rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRight size={24} className="text-white" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail Strip */}
            {mediaItems.length > 1 && (
                <div
                    ref={thumbnailContainerRef}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#3d4450] scrollbar-track-transparent"
                >
                    {mediaItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setVideoError(false);
                            }}
                            className={`relative flex-shrink-0 rounded overflow-hidden transition-all
                                      ${index === currentIndex
                                    ? 'ring-2 ring-white'
                                    : 'opacity-60 hover:opacity-100'}`}
                        >
                            {item.type === 'video' ? (
                                <>
                                    {/* Video thumbnail - shows frame 12 (~0.5s at 24fps) */}
                                    <video
                                        src={item.url}
                                        className="w-[120px] h-[68px] object-cover"
                                        preload="metadata"
                                        muted
                                        playsInline
                                        onLoadedMetadata={(e) => {
                                            const video = e.currentTarget;
                                            video.currentTime = 0.5; // Seek to ~frame 12 at 24fps
                                        }}
                                    />
                                    {/* Play icon overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Play size={24} className="text-white fill-white" />
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-[120px] h-[68px] object-cover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

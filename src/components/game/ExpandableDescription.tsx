'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableDescriptionProps {
    html: string;
    maxHeight?: number; // Default collapsed height in pixels
}

export default function ExpandableDescription({
    html,
    maxHeight = 300
}: ExpandableDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsExpand, setNeedsExpand] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            // Check if content is taller than max height
            setNeedsExpand(contentRef.current.scrollHeight > maxHeight);
        }
    }, [html, maxHeight]);

    return (
        <div className="bg-[#101822] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b-2 border-[#66c0f4]">
                About This Game
            </h2>

            {/* Content Container */}
            <div className="relative">
                <div
                    ref={contentRef}
                    className={`steam-description text-[#acb2b8] leading-relaxed overflow-hidden transition-all duration-300
                        [&_h1]:text-white [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2
                        [&_h2]:text-white [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4
                        [&_h3]:text-[#67c1f5] [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-2
                        [&_p]:mb-3
                        [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-3
                        [&_li]:mb-1
                        [&_a]:text-[#66c0f4] [&_a]:hover:text-white
                        [&_strong]:text-white
                        [&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full`}
                    style={{
                        maxHeight: isExpanded ? 'none' : `${maxHeight}px`
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                />

                {/* Gradient Overlay (only when collapsed and content needs expansion) */}
                {!isExpanded && needsExpand && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-24 
                                 bg-gradient-to-t from-[#101822] to-transparent 
                                 pointer-events-none"
                    />
                )}
            </div>

            {/* Expand/Collapse Button */}
            {needsExpand && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 flex items-center gap-2 text-[#67c1f5] hover:text-white 
                             transition-colors text-sm font-medium mx-auto"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp size={18} />
                            Thu gọn
                        </>
                    ) : (
                        <>
                            <ChevronDown size={18} />
                            Mở rộng
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

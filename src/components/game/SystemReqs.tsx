'use client';

import { Monitor, Apple, Server } from 'lucide-react';

interface SystemReqsProps {
    minimum: string | null;
    recommended: string | null;
    windows: boolean;
    mac: boolean;
    linux: boolean;
}

export default function SystemReqs({ minimum, recommended, windows, mac, linux }: SystemReqsProps) {
    if (!minimum && !recommended) {
        return null;
    }

    // Parse HTML content to plain text sections
    const parseRequirements = (html: string | null): string => {
        if (!html) return '';
        // Remove HTML tags but preserve line breaks
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .trim();
    };

    return (
        <div className="bg-[#1b2838] rounded-lg p-6 border border-[#2a475e]">
            <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#2a475e]">
                System Requirements
            </h2>

            {/* Platform Icons */}
            <div className="flex items-center gap-3 mb-4">
                {windows && (
                    <div className="flex items-center gap-1 text-[#8b929a]">
                        <Monitor size={16} />
                        <span className="text-xs">Windows</span>
                    </div>
                )}
                {mac && (
                    <div className="flex items-center gap-1 text-[#8b929a]">
                        <Apple size={16} />
                        <span className="text-xs">macOS</span>
                    </div>
                )}
                {linux && (
                    <div className="flex items-center gap-1 text-[#8b929a]">
                        <Server size={16} />
                        <span className="text-xs">Linux</span>
                    </div>
                )}
            </div>

            {/* Requirements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Minimum */}
                {minimum && (
                    <div>
                        <h3 className="text-sm font-semibold text-[#67c1f5] mb-2 uppercase">
                            Minimum
                        </h3>
                        <div
                            className="text-xs text-[#8b929a] leading-relaxed whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: minimum }}
                        />
                    </div>
                )}

                {/* Recommended */}
                {recommended && (
                    <div>
                        <h3 className="text-sm font-semibold text-[#67c1f5] mb-2 uppercase">
                            Recommended
                        </h3>
                        <div
                            className="text-xs text-[#8b929a] leading-relaxed whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: recommended }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

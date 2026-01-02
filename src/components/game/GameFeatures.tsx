'use client';

import { parseCommaString } from '@/utils/helpers';
import {
    User, Users, Cloud, Trophy, Gamepad2,
    Globe, Mic, Zap, CreditCard, Shield
} from 'lucide-react';

interface GameFeaturesProps {
    gameDetails: string | null;
}

// Map feature names to icons
const FEATURE_ICONS: Record<string, React.ReactNode> = {
    'single-player': <User size={16} />,
    'multi-player': <Users size={16} />,
    'multiplayer': <Users size={16} />,
    'co-op': <Users size={16} />,
    'steam cloud': <Cloud size={16} />,
    'achievements': <Trophy size={16} />,
    'steam achievements': <Trophy size={16} />,
    'controller': <Gamepad2 size={16} />,
    'full controller support': <Gamepad2 size={16} />,
    'partial controller support': <Gamepad2 size={16} />,
    'remote play': <Globe size={16} />,
    'steam trading cards': <CreditCard size={16} />,
    'trading cards': <CreditCard size={16} />,
    'steam workshop': <Zap size={16} />,
    'workshop': <Zap size={16} />,
    'vr': <Shield size={16} />,
    'vr supported': <Shield size={16} />,
    'voice chat': <Mic size={16} />,
};

function getFeatureIcon(feature: string): React.ReactNode {
    const lowerFeature = feature.toLowerCase();
    for (const [key, icon] of Object.entries(FEATURE_ICONS)) {
        if (lowerFeature.includes(key)) {
            return icon;
        }
    }
    return <Zap size={16} />;
}

export default function GameFeatures({ gameDetails }: GameFeaturesProps) {
    const features = parseCommaString(gameDetails);

    if (features.length === 0) {
        return null;
    }

    return (
        <div className="bg-[#1b2838] rounded-lg p-4 border border-[#2a475e]">
            <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">
                Game Features
            </h3>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-[#8b929a]"
                    >
                        <span className="text-[#67c1f5]">
                            {getFeatureIcon(feature)}
                        </span>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}

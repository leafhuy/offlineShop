import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getGameByAppId, getSimilarGames } from '@/services/game.service';
import { calculateReviewScore, formatReviewCount } from '@/utils/review';
import { parseCommaString, getGameImage } from '@/utils/helpers';
import MediaGallery from '@/components/game/MediaGallery';
import BuyBox from '@/components/game/BuyBox';
import SystemReqs from '@/components/game/SystemReqs';
import GameFeatures from '@/components/game/GameFeatures';
import SimilarGames from '@/components/game/SimilarGames';
import ExpandableDescription from '@/components/game/ExpandableDescription';
import { Monitor, Apple, Server, Heart, Bell, EyeOff, ChevronRight } from 'lucide-react';

interface GamePageProps {
    params: Promise<{ appid: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
    const { appid } = await params;
    const game = await getGameByAppId(appid);

    if (!game) {
        return { title: 'Game Not Found - offlineShop' };
    }

    return {
        title: `${game.name} on Steam - offlineShop`,
        description: game.desc_snippet || `Buy ${game.name} at the best price on offlineShop`,
        openGraph: {
            title: game.name,
            description: game.desc_snippet || '',
            images: [getGameImage(game)],
        },
    };
}

export default async function GamePage({ params }: GamePageProps) {
    const { appid } = await params;
    const game = await getGameByAppId(appid);

    if (!game) {
        notFound();
    }

    const reviewScore = calculateReviewScore(game.positive, game.negative);
    const tags = parseCommaString(game.popular_tags);
    const genres = parseCommaString(game.genre);
    const headerImage = getGameImage(game);

    // Fetch similar games based on tags
    const similarGames = await getSimilarGames(game.appid, game.popular_tags || '', 8);

    return (
        <div className="min-h-screen bg-[#1b2838] relative">
            {/* ===== BACKGROUND WRAPPER ===== */}
            <div
                className="absolute inset-0 h-[600px] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(27,40,56,0.4) 0%, rgba(27,40,56,1) 100%), url(${headerImage})`,
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                }}
            />
            <div className="absolute inset-0 h-[600px] bg-gradient-to-b from-transparent to-[#1b2838]" />

            {/* ===== MAIN CONTENT CONTAINER ===== */}
            <div className="relative z-10 max-w-[940px] mx-auto px-4 py-6">

                {/* ===== BREADCRUMBS ===== */}
                <nav className="flex items-center gap-2 text-sm text-[#8b929a] mb-4">
                    <Link href="/" className="hover:text-white transition-colors">
                        All Games
                    </Link>
                    <ChevronRight size={14} />
                    {genres.length > 0 && (
                        <>
                            <Link
                                href={`/category/${encodeURIComponent(genres[0])}`}
                                className="hover:text-white transition-colors"
                            >
                                {genres[0]}
                            </Link>
                            <ChevronRight size={14} />
                        </>
                    )}
                    <span className="text-[#c6d4df]">{game.name}</span>
                </nav>

                {/* ===== GAME TITLE ===== */}
                <h1 className="text-3xl font-bold text-white mb-6">{game.name}</h1>

                {/* ===== HERO SECTION (2 Columns) ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-[616px_324px] gap-4 mb-6">
                    {/* Left: Media Gallery (600px + padding) */}
                    <div>
                        <MediaGallery
                            screenshots={game.screenshots}
                            movies={game.movies}
                            gameName={game.name}
                        />
                    </div>

                    {/* Right: Glance Details */}
                    <div className="bg-[#0a141d]/80 backdrop-blur-sm rounded p-4 space-y-4">
                        {/* Header Image */}
                        <img
                            src={headerImage}
                            alt={game.name}
                            className="w-full rounded"
                        />

                        {/* Description Snippet */}
                        {game.desc_snippet && (
                            <p className="text-[13px] text-[#c6d4df] leading-relaxed">
                                {game.desc_snippet}
                            </p>
                        )}

                        {/* Review Summary */}
                        <div className="space-y-1 text-sm border-t border-[#2a475e] pt-3">
                            <div className="flex justify-between">
                                <span className="text-[#556772]">All Reviews:</span>
                                <span className={reviewScore.className}>
                                    {reviewScore.label}
                                    <span className="text-[#556772] ml-1 text-xs">
                                        ({formatReviewCount(reviewScore.total)})
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Meta Info Table */}
                        <div className="space-y-2 text-sm border-t border-[#2a475e] pt-3">
                            {game.release_date && (
                                <div className="flex justify-between">
                                    <span className="text-[#556772]">Release Date:</span>
                                    <span className="text-[#8f98a0]">{game.release_date}</span>
                                </div>
                            )}
                            {game.developer && (
                                <div className="flex justify-between">
                                    <span className="text-[#556772]">Developer:</span>
                                    <span className="text-[#66c0f4] hover:text-white cursor-pointer">
                                        {game.developer}
                                    </span>
                                </div>
                            )}
                            {game.publisher && (
                                <div className="flex justify-between">
                                    <span className="text-[#556772]">Publisher:</span>
                                    <span className="text-[#66c0f4] hover:text-white cursor-pointer">
                                        {game.publisher}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Popular Tags */}
                        {tags.length > 0 && (
                            <div className="border-t border-[#2a475e] pt-3">
                                <div className="flex flex-wrap gap-1">
                                    {tags.slice(0, 5).map((tag, index) => (
                                        <Link
                                            key={index}
                                            href={`/category/${encodeURIComponent(tag)}`}
                                            className="px-2 py-0.5 text-xs bg-[#3d4450]/60 text-[#8b929a] 
                                                     rounded hover:bg-[#67c1f5] hover:text-white 
                                                     cursor-pointer transition-colors"
                                        >
                                            {tag}
                                        </Link>
                                    ))}
                                    <span className="px-2 py-0.5 text-xs bg-[#3d4450]/60 text-[#8b929a] 
                                                   rounded hover:bg-[#67c1f5] hover:text-white 
                                                   cursor-pointer transition-colors">
                                        +
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Platform Icons */}
                        <div className="flex items-center gap-3 border-t border-[#2a475e] pt-3">
                            {game.windows && <Monitor size={16} className="text-[#8b929a]" />}
                            {game.mac && <Apple size={16} className="text-[#8b929a]" />}
                            {game.linux && <Server size={16} className="text-[#8b929a]" />}
                        </div>
                    </div>
                </div>

                {/* ===== ACTION BAR (Wishlist Strip) ===== */}
                <div className="bg-gradient-to-r from-[#3d4450]/50 to-[#3d4450]/30 rounded p-3 mb-6
                              flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#8b929a] 
                                     hover:text-white transition-colors">
                        <Heart size={16} />
                        Add to your wishlist
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#8b929a] 
                                     hover:text-white transition-colors">
                        <Bell size={16} />
                        Follow
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#8b929a] 
                                     hover:text-white transition-colors">
                        <EyeOff size={16} />
                        Ignore
                    </button>
                </div>

                {/* ===== BUY BOX ===== */}
                <div className="mb-8">
                    <BuyBox game={game} />
                </div>

                {/* ===== MAIN CONTENT AREA (2 Columns) ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
                    {/* Left: Main Content */}
                    <div className="space-y-6">
                        {/* About This Game */}
                        {game.game_description && (
                            <ExpandableDescription html={game.game_description} maxHeight={300} />
                        )}

                        {/* System Requirements */}
                        <SystemReqs
                            minimum={game.minimum_requirements}
                            recommended={game.recommended_requirements}
                            windows={game.windows}
                            mac={game.mac}
                            linux={game.linux}
                        />
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-4">
                        {/* Genres */}
                        {genres.length > 0 && (
                            <div className="bg-[#1b2838] rounded-lg p-4 border border-[#2a475e]">
                                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">
                                    Genres
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {genres.map((genre, index) => (
                                        <Link
                                            key={index}
                                            href={`/category/${encodeURIComponent(genre)}`}
                                            className="px-2 py-1 text-xs bg-[#3d4450]/60 text-[#67c1f5] 
                                                     rounded hover:bg-[#67c1f5] hover:text-white 
                                                     cursor-pointer transition-colors"
                                        >
                                            {genre}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Game Features */}
                        <GameFeatures gameDetails={game.game_details} />

                        {/* Languages */}
                        {game.languages && (
                            <div className="bg-[#1b2838] rounded-lg p-4 border border-[#2a475e]">
                                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">
                                    Languages
                                </h3>
                                <p className="text-xs text-[#8b929a] leading-relaxed whitespace-pre-wrap">
                                    {game.languages}
                                </p>
                            </div>
                        )}

                        {/* Age Rating */}
                        {game.required_age && game.required_age !== '0' && (
                            <div className="bg-[#1b2838] rounded-lg p-4 border border-[#2a475e]">
                                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">
                                    Age Rating
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-[#CD4C44] text-white text-sm font-bold rounded">
                                        {game.required_age}+
                                    </span>
                                    <span className="text-xs text-[#8b929a]">
                                        Mature Content
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Steam Link */}
                        {game.url && (
                            <a
                                href={game.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-gradient-to-r from-[#1a9fff] to-[#1a6fff] 
                                         text-white text-center py-3 rounded-lg font-semibold
                                         hover:from-[#3aafff] hover:to-[#3a8fff] transition-all"
                            >
                                View on Steam
                            </a>
                        )}
                    </div>
                </div>

                {/* ===== SIMILAR GAMES SECTION ===== */}
                <SimilarGames games={similarGames} />
            </div>
        </div>
    );
}

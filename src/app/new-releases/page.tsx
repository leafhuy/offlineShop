import { getNewReleasesPaginated } from '@/services/game.service';
import { Game } from '@/types/game';
import GameCard from '@/components/GameCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'New & Trending - offlineShop',
    description: 'Discover the latest game releases on offlineShop. Browse new and trending games with the best prices.',
};

interface NewReleasesPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function NewReleasesPage({ searchParams }: NewReleasesPageProps) {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const limit = 50;

    // Fetch new releases
    const { data: games, totalCount } = await getNewReleasesPaginated(currentPage, limit);
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-[#8f98a0] mb-6">
                <Link href="/" className="hover:text-white transition-colors">
                    Trang chủ
                </Link>
                <ChevronRight size={14} />
                <span className="text-[#c7d5e0]">New & Trending</span>
            </nav>

            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 bg-[#1a9fff] rounded-lg">
                    <Sparkles size={28} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                        New & Trending
                    </h1>
                    <p className="text-[#8f98a0]">
                        {totalCount} game mới phát hành
                    </p>
                </div>
            </div>

            {/* Games Grid */}
            {games.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                        {games.map((game: Game) => (
                            <GameCard key={game.uiid || game.appid} game={game} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        className="mt-8"
                    />
                </>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-6xl mb-4">🆕</div>
                    <h2 className="text-xl font-semibold text-[#c7d5e0] mb-2">
                        Không có game mới
                    </h2>
                    <p className="text-[#8f98a0] mb-6">
                        Hiện tại không có game mới nào
                    </p>
                    <Link
                        href="/"
                        className="px-6 py-2 bg-[#2a475e] hover:bg-[#316282] text-white rounded transition-colors"
                    >
                        Về trang chủ
                    </Link>
                </div>
            )}
        </div>
    );
}

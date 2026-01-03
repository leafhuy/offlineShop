import { getGamesByGenre } from '@/services/game.service';
import { Game } from '@/types/game';
import GameCard from '@/components/GameCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    // Decode and capitalize genre name
    const slug = resolvedParams.slug;
    const decodedGenre = decodeURIComponent(slug);
    const genreName = decodedGenre
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // Pagination
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const limit = 50;

    // Fetch games by genre
    const { data: games, totalCount } = await getGamesByGenre(genreName, currentPage, limit);
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-[#8f98a0] mb-6">
                <Link href="/" className="hover:text-white transition-colors">
                    Trang chủ
                </Link>
                <ChevronRight size={14} />
                <span className="text-[#c7d5e0]">{genreName}</span>
            </nav>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {genreName} Games
                </h1>
                <p className="text-[#8f98a0]">
                    {totalCount} game{totalCount !== 1 ? 's' : ''} được tìm thấy
                </p>
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
                    <div className="text-6xl mb-4">🎮</div>
                    <h2 className="text-xl font-semibold text-[#c7d5e0] mb-2">
                        Không tìm thấy game
                    </h2>
                    <p className="text-[#8f98a0] mb-6">
                        Không có game nào thuộc thể loại "{genreName}"
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

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const decodedGenre = decodeURIComponent(resolvedParams.slug);
    const genreName = decodedGenre
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return {
        title: `${genreName} Games - offlineShop`,
        description: `Browse ${genreName} games on offlineShop. Find the best deals on ${genreName} game keys.`,
    };
}

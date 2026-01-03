import Hero from "@/components/Hero";
import GameGrid from "@/components/GameGrid";
import Pagination from "@/components/Pagination";
import {
    getFeaturedGames,
    getSpecialOffers,
    getNewReleases,
    getGamesByPopularity
} from "@/services/game.service";

const GAMES_PER_PAGE = 20;

interface HomeProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const params = await searchParams;
    const currentPage = Math.max(1, parseInt(params.page || '1', 10));
    const offset = (currentPage - 1) * GAMES_PER_PAGE;

    // Fetch all data in parallel
    const [
        featuredGames,
        specialOffers,
        newReleases,
        popularGames,
    ] = await Promise.all([
        getFeaturedGames(10),
        getSpecialOffers(10),
        getNewReleases(10),
        getGamesByPopularity(GAMES_PER_PAGE, offset),
    ]);

    const totalPages = Math.ceil(popularGames.totalCount / GAMES_PER_PAGE);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <section className="mb-12">
                <Hero games={featuredGames} />
            </section>

            {/* Special Offers */}
            <GameGrid
                title="Special Offers"
                games={specialOffers}
                viewAllLink="/special-offers"
            />

            {/* New Releases */}
            <GameGrid
                title="New & Trending"
                games={newReleases}
                viewAllLink="/new-releases"
            />

            {/* Popular Games with Pagination */}
            <section className="mt-12">
                <h2 className="text-2xl font-bold text-[#c7d5e0] mb-6">Popular Games</h2>
                <GameGrid
                    games={popularGames.games}
                />

                {/* Pagination Controls */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    className="mt-8"
                />
            </section>
        </div>
    );
}

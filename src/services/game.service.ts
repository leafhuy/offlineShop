import { supabase } from '@/lib/supabase';
import { Game } from '@/types/game';

export interface GameFilter {
    genre?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'name' | 'discount_percent' | 'original_price' | 'release_date';
    orderDirection?: 'asc' | 'desc';
    hasDiscount?: boolean;
}

/**
 * Get featured games for Hero Section
 * Returns a mix of: most reviewed (nổi bật), newest, and on sale games
 */
export async function getFeaturedGames(limit: number = 5): Promise<Game[]> {
    // Fetch all games to process
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .limit(500);

    if (error) {
        console.error('Error fetching featured games:', error);
        return [];
    }

    if (!data || data.length === 0) {
        return [];
    }

    // Helper to calculate total reviews
    const getTotalReviews = (game: Game): number => {
        const positive = parseReviewCount(game.positive);
        const negative = parseReviewCount(game.negative);
        return positive + negative;
    };

    // 1. Nổi bật nhất - Most reviewed (highest total reviews)
    const mostReviewed = [...data]
        .sort((a, b) => getTotalReviews(b) - getTotalReviews(a))
        .slice(0, 4);

    // 2. Mới nhất - Newest releases with valid dates
    const validDateGames = data.filter(game => {
        if (!game.release_date) return false;
        const parsed = Date.parse(game.release_date);
        return !isNaN(parsed);
    });
    const newest = [...validDateGames]
        .sort((a, b) => new Date(b.release_date!).getTime() - new Date(a.release_date!).getTime())
        .slice(0, 4);

    // 3. Đang giảm giá - Best discounts
    const onSale = [...data]
        .filter(game => game.discount_percent > 0)
        .sort((a, b) => b.discount_percent - a.discount_percent)
        .slice(0, 4);

    // Combine and deduplicate
    const combined = [...mostReviewed, ...newest, ...onSale];
    const seen = new Set<string>();
    const unique: Game[] = [];

    for (const game of combined) {
        if (!seen.has(game.uiid)) {
            seen.add(game.uiid);
            unique.push(game);
        }
        if (unique.length >= limit) break;
    }

    return unique;
}

/**
 * Get list of games with optional filtering
 */
export async function getGameList(filter: GameFilter = {}): Promise<Game[]> {
    const {
        genre,
        limit = 20,
        offset = 0,
        orderBy = 'name',
        orderDirection = 'asc',
        hasDiscount,
    } = filter;

    let query = supabase.from('offlineShop_gamedata').select('*');

    // Apply genre filter (partial match)
    if (genre) {
        query = query.ilike('genre', `%${genre}%`);
    }

    // Apply discount filter
    if (hasDiscount) {
        query = query.gt('discount_percent', 0);
    }

    // Apply ordering and pagination
    query = query
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching games:', error);
        return [];
    }

    return data || [];
}

/**
 * Get all unique genres from the database
 * Parses the genre column (comma-separated) and returns unique values
 */
export async function getAllGenres(): Promise<string[]> {
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('genre');

    if (error) {
        console.error('Error fetching genres:', error);
        return [];
    }

    // Extract and deduplicate genres
    const genreSet = new Set<string>();

    data?.forEach((game) => {
        if (game.genre) {
            game.genre.split(',').forEach((g: string) => {
                const trimmed = g.trim();
                if (trimmed) {
                    genreSet.add(trimmed);
                }
            });
        }
    });

    // Sort alphabetically
    return Array.from(genreSet).sort();
}

/**
 * Get special offer games (high discount)
 */
export async function getSpecialOffers(limit: number = 10): Promise<Game[]> {
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .gt('discount_percent', 30)
        .order('discount_percent', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching special offers:', error);
        return [];
    }

    return data || [];
}

/**
 * Check if a date string is a valid parseable date format
 * Returns true for formats like "Jan 1, 2024", "2024-01-01", "1 Jan 2024"
 * Returns false for "Coming Soon", "Q1 2024", "TBD", etc.
 */
function isValidDateFormat(dateStr: string | null): boolean {
    if (!dateStr || dateStr.trim() === '') return false;

    // Try to parse the date
    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) return false;

    // Additional check: must contain a day number (1-31)
    // This filters out partial dates like "2024" or "Jan 2024"
    const dayPattern = /\b([1-9]|[12][0-9]|3[01])\b/;
    return dayPattern.test(dateStr);
}

/**
 * Get new and trending games
 * Recent releases sorted by positive review count
 * Only includes games with valid, parseable release dates
 */
export async function getNewReleases(limit: number = 10): Promise<Game[]> {
    // Fetch games with release dates
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .not('release_date', 'is', null)
        .neq('release_date', '')
        .limit(500);

    if (error) {
        console.error('Error fetching new releases:', error);
        return [];
    }

    if (!data || data.length === 0) {
        return [];
    }

    // Filter for games with valid date format
    const validDateGames = data.filter(game => isValidDateFormat(game.release_date));

    // Sort by release date (newest first)
    const sortedByDate = validDateGames.sort((a, b) => {
        const dateA = new Date(a.release_date!).getTime();
        const dateB = new Date(b.release_date!).getTime();
        return dateB - dateA;
    });

    // Take recent games and sort by positive reviews
    const recentGames = sortedByDate.slice(0, 100);
    const sorted = recentGames.sort((a, b) => {
        const positiveA = parseReviewCount(a.positive);
        const positiveB = parseReviewCount(b.positive);
        return positiveB - positiveA;
    });

    return sorted.slice(0, limit);
}

/**
 * Get a single game by ID
 */
export async function getGameById(uiid: string): Promise<Game | null> {
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .eq('uiid', uiid)
        .single();

    if (error) {
        console.error('Error fetching game:', error);
        return null;
    }

    return data;
}

/**
 * Get a single game by Steam App ID
 */
export async function getGameByAppId(appid: string): Promise<Game | null> {
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .eq('appid', parseInt(appid, 10))
        .single();

    if (error) {
        console.error('Error fetching game by appid:', error);
        return null;
    }

    return data;
}

/**
 * Parse formatted number string to integer (e.g., "15,000" -> 15000)
 */
function parseReviewCount(str: string | null): number {
    if (!str) return 0;
    return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * Get games ordered by positive review count (most popular)
 * Supports pagination for infinite scroll
 */
export async function getGamesByPopularity(
    limit: number = 20,
    offset: number = 0
): Promise<{ games: Game[]; hasMore: boolean; totalCount: number }> {
    // Fetch all games to sort by positive reviews
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*');

    if (error) {
        console.error('Error fetching games by popularity:', error);
        return { games: [], hasMore: false, totalCount: 0 };
    }

    if (!data || data.length === 0) {
        return { games: [], hasMore: false, totalCount: 0 };
    }

    // Sort by positive reviews (descending) - highest positive first
    const sorted = [...data].sort((a, b) => {
        const positiveA = parseReviewCount(a.positive);
        const positiveB = parseReviewCount(b.positive);
        return positiveB - positiveA;
    });

    // Apply pagination
    const paginatedGames = sorted.slice(offset, offset + limit);
    const hasMore = sorted.length > offset + limit;

    return { games: paginatedGames, hasMore, totalCount: sorted.length };
}

/**
 * Get similar games based on matching popular_tags
 * Returns games with the most tag matches, excluding the current game
 */
export async function getSimilarGames(
    currentAppId: number,
    currentTags: string,
    limit: number = 8
): Promise<Game[]> {
    if (!currentTags) return [];

    // Parse current game's tags
    const tagList = currentTags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

    if (tagList.length === 0) return [];

    // Fetch all games with tags
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .not('popular_tags', 'is', null)
        .neq('appid', currentAppId)
        .limit(500);

    if (error) {
        console.error('Error fetching similar games:', error);
        return [];
    }

    if (!data || data.length === 0) return [];

    // Calculate tag match score for each game
    const gamesWithScore = data.map(game => {
        const gameTags = (game.popular_tags || '')
            .split(',')
            .map((t: string) => t.trim().toLowerCase())
            .filter((t: string) => t.length > 0);

        // Count matching tags
        const matchCount = tagList.filter(tag => gameTags.includes(tag)).length;

        return { game, matchCount };
    });

    // Sort by match count (descending) and take top results
    const sorted = gamesWithScore
        .filter(g => g.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, limit)
        .map(g => g.game);

    return sorted;
}

/**
 * Search games by name for GlobalSearch dropdown
 * Returns limited fields for performance
 */
export async function searchGames(query: string, limit: number = 6): Promise<Game[]> {
    if (!query || query.trim().length < 2) return [];

    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('appid, name, header_image, original_price, discount_price, discount_percent')
        .ilike('name', `%${query.trim()}%`)
        .limit(limit);

    if (error) {
        console.error('Error searching games:', error);
        return [];
    }

    return (data as Game[]) || [];
}

/**
 * Get games by genre with pagination
 * Uses ilike for partial matching since genre is comma-separated
 */
export async function getGamesByGenre(
    genre: string,
    page: number = 1,
    limit: number = 50
): Promise<{ data: Game[]; totalCount: number }> {
    const offset = (page - 1) * limit;

    // Get total count first
    const { count, error: countError } = await supabase
        .from('offlineShop_gamedata')
        .select('*', { count: 'exact', head: true })
        .ilike('genre', `%${genre}%`);

    if (countError) {
        console.error('Error counting games by genre:', countError);
        return { data: [], totalCount: 0 };
    }

    // Fetch paginated data
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .ilike('genre', `%${genre}%`)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching games by genre:', error);
        return { data: [], totalCount: 0 };
    }

    return { data: data || [], totalCount: count || 0 };
}

/**
 * Get all discounted games with pagination
 * Sorted by discount percentage (highest first)
 */
export async function getDiscountedGames(
    page: number = 1,
    limit: number = 50
): Promise<{ data: Game[]; totalCount: number }> {
    const offset = (page - 1) * limit;

    // Get total count first
    const { count, error: countError } = await supabase
        .from('offlineShop_gamedata')
        .select('*', { count: 'exact', head: true })
        .gt('discount_percent', 0);

    if (countError) {
        console.error('Error counting discounted games:', countError);
        return { data: [], totalCount: 0 };
    }

    // Fetch paginated data
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .gt('discount_percent', 0)
        .order('discount_percent', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching discounted games:', error);
        return { data: [], totalCount: 0 };
    }

    return { data: data || [], totalCount: count || 0 };
}

/**
 * Get new releases with pagination
 * Sorted by release date (newest first)
 * Only includes games with valid release dates
 */
export async function getNewReleasesPaginated(
    page: number = 1,
    limit: number = 50
): Promise<{ data: Game[]; totalCount: number }> {
    // Fetch all games with release dates to filter and sort
    const { data, error } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .not('release_date', 'is', null)
        .neq('release_date', '');

    if (error) {
        console.error('Error fetching new releases:', error);
        return { data: [], totalCount: 0 };
    }

    if (!data || data.length === 0) {
        return { data: [], totalCount: 0 };
    }

    // Filter for games with valid date format
    const validDateGames = data.filter(game => isValidDateFormat(game.release_date));

    // Sort by release date (newest first)
    const sortedByDate = validDateGames.sort((a, b) => {
        const dateA = new Date(a.release_date!).getTime();
        const dateB = new Date(b.release_date!).getTime();
        return dateB - dateA;
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedData = sortedByDate.slice(offset, offset + limit);

    return { data: paginatedData, totalCount: sortedByDate.length };
}


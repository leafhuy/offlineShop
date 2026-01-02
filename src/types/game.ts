/**
 * Game interface matching Supabase database schema
 */
export interface Game {
    /** Primary Key (UUID) */
    uiid: string;

    /** Steam App ID */
    appid: number;

    /** Game name */
    name: string;

    /** Header image URL (may be null - use fallback) */
    header_image: string | null;

    /** Original price */
    original_price: number;

    /** Discounted price */
    discount_price: number;

    /** Discount percentage (0 if no discount) */
    discount_percent: number;

    /** Windows platform support */
    windows: boolean;

    /** Mac platform support */
    mac: boolean;

    /** Linux platform support */
    linux: boolean;

    /** Genre string (comma-separated) */
    genre: string | null;

    /** Screenshots JSON/string */
    screenshots: string | null;

    /** Movies/trailers JSON/string */
    movies: string | null;

    /** Popular tags string */
    popular_tags: string | null;

    /** Positive reviews count (formatted string) */
    positive: string | null;

    /** Negative reviews count (formatted string) */
    negative: string | null;

    /** Release date */
    release_date: string | null;

    /** Short description */
    desc_snippet: string | null;

    /** Developer name */
    developer: string | null;

    /** Publisher name */
    publisher: string | null;

    /** Required age rating */
    required_age: string | null;

    /** Steam URL */
    url: string | null;

    /** Product type */
    types: string | null;

    /** Supported languages */
    languages: string | null;

    /** Game details */
    game_details: string | null;

    /** Full game description (HTML) */
    game_description: string | null;

    /** Mature content warning */
    mature_content: string | null;

    /** Minimum system requirements */
    minimum_requirements: string | null;

    /** Recommended system requirements */
    recommended_requirements: string | null;
}

/** Parsed game with processed media arrays */
export interface ParsedGame extends Game {
    screenshotUrls: string[];
    movieUrls: string[];
    genreList: string[];
    tagList: string[];
}

/** Review score result */
export interface ReviewScore {
    label: string;
    total: number;
    percentage: number;
    className: string;
}

import { Game } from '@/types/game';

/**
 * Format currency in Vietnamese Dong (VND)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Clean Python-style array string to extract URLs
 * Handles format like: "['url1', 'url2']" or "[{...}]"
 */
function cleanPythonArrayString(data: string): string {
    // Remove leading/trailing brackets and whitespace
    let cleaned = data.trim();

    // Check if it's wrapped in brackets
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        // Replace single quotes with double quotes for JSON parsing
        cleaned = cleaned.replace(/'/g, '"');
    }

    return cleaned;
}

/**
 * Parse a media string (screenshots or movies) into an array of URLs
 * Handles JSON arrays, Python-style arrays, and comma-separated strings
 */
export function parseMediaString(data: string | null): string[] {
    if (!data) return [];

    const trimmedData = data.trim();

    // Clean Python-style arrays first (single quotes to double quotes)
    const cleanedData = cleanPythonArrayString(trimmedData);

    // Try parsing as JSON
    try {
        const parsed = JSON.parse(cleanedData);
        if (Array.isArray(parsed)) {
            // If it's an array of objects with path_full or url property
            if (parsed.length > 0 && typeof parsed[0] === 'object') {
                return parsed.map((item: { path_full?: string; url?: string; path_thumbnail?: string }) =>
                    item.path_full || item.url || item.path_thumbnail || ''
                ).filter(Boolean);
            }
            // If it's an array of strings
            return parsed.filter((item): item is string => typeof item === 'string' && item.startsWith('http'));
        }
    } catch {
        // Not valid JSON, try other methods
    }

    // Handle comma-separated URL strings
    if (trimmedData.includes(',')) {
        // Extract all URLs using regex
        const urlMatches = trimmedData.match(/https?:\/\/[^\s,'"\]]+/g);
        if (urlMatches && urlMatches.length > 0) {
            return urlMatches;
        }
    }

    // Single URL
    if (trimmedData.startsWith('http')) {
        return [trimmedData];
    }

    // Try to extract URLs from malformed string
    const urlMatches = trimmedData.match(/https?:\/\/[^\s,'"\]]+/g);
    if (urlMatches && urlMatches.length > 0) {
        return urlMatches;
    }

    return [];
}

/**
 * Get the game header image with Steam CDN fallback
 */
export function getGameImage(game: Game): string {
    if (game.header_image) {
        // Check if header_image is a malformed array string
        if (game.header_image.startsWith('[')) {
            const urls = parseMediaString(game.header_image);
            if (urls.length > 0) {
                return urls[0];
            }
        }
        return game.header_image;
    }
    // Fallback to Steam CDN
    return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`;
}

/**
 * Parse comma-separated string into trimmed array
 */
export function parseCommaString(data: string | null): string[] {
    if (!data) return [];
    return data.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Parse movie URLs - extracts video URLs from movies JSON/string
 */
export function parseMovieUrls(data: string | null): string[] {
    if (!data) return [];

    const trimmedData = data.trim();
    const cleanedData = cleanPythonArrayString(trimmedData);

    try {
        const parsed = JSON.parse(cleanedData);
        if (Array.isArray(parsed)) {
            const urls: string[] = [];

            for (const movie of parsed) {
                if (typeof movie === 'object' && movie !== null) {
                    // Handle Steam movie format: { mp4: { max: url, 480: url }, webm: { max: url } }
                    const mp4Max = movie.mp4?.max || movie.mp4?.['480'];
                    const webmMax = movie.webm?.max;
                    const directUrl = movie.url || movie.path_full;

                    if (mp4Max) urls.push(mp4Max);
                    else if (webmMax) urls.push(webmMax);
                    else if (directUrl) urls.push(directUrl);
                } else if (typeof movie === 'string' && movie.startsWith('http')) {
                    urls.push(movie);
                }
            }

            return urls;
        }
    } catch {
        // Not valid JSON
    }

    // Try to extract video URLs using regex
    const videoMatches = trimmedData.match(/https?:\/\/[^\s,'"\]]+\.(mp4|webm)[^\s,'"\]]*/gi);
    if (videoMatches && videoMatches.length > 0) {
        return videoMatches;
    }

    // Fall back to generic parsing
    const urls = parseMediaString(data);
    return urls.filter(url => url.includes('.mp4') || url.includes('.webm'));
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}


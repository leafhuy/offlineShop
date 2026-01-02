import { ReviewScore } from '@/types/game';

/**
 * Parse a formatted number string (e.g., "15,000") to integer
 */
function parseFormattedNumber(str: string | null): number {
    if (!str) return 0;
    // Remove all non-digit characters
    return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * Calculate review score based on positive and negative review counts
 * Returns a 7-level classification with label, total, and styling class
 * 
 * Levels:
 * 1. Overwhelmingly Positive: > 95% & Total > 500
 * 2. Very Positive: > 85%
 * 3. Mostly Positive: > 70%
 * 4. Mixed: 40% - 70%
 * 5. Mostly Negative: < 40%
 * 6. Very Negative: < 20%
 * 7. Overwhelmingly Negative: < 10% & Total > 500
 */
export function calculateReviewScore(
    positiveStr: string | null,
    negativeStr: string | null
): ReviewScore {
    const positive = parseFormattedNumber(positiveStr);
    const negative = parseFormattedNumber(negativeStr);
    const total = positive + negative;

    // Handle no reviews case
    if (total === 0) {
        return {
            label: 'No Reviews',
            total: 0,
            percentage: 0,
            className: 'text-steam-text-secondary',
        };
    }

    const percentage = (positive / total) * 100;

    // Determine label and class based on percentage and total
    let label: string;
    let className: string;

    if (percentage > 95 && total > 500) {
        label = 'Overwhelmingly Positive';
        className = 'text-steam-review-positive';
    } else if (percentage > 85) {
        label = 'Very Positive';
        className = 'text-steam-review-positive';
    } else if (percentage > 70) {
        label = 'Mostly Positive';
        className = 'text-steam-review-positive';
    } else if (percentage >= 40) {
        label = 'Mixed';
        className = 'text-steam-review-mixed';
    } else if (percentage >= 20) {
        label = 'Mostly Negative';
        className = 'text-steam-review-negative';
    } else if (percentage >= 10 || total <= 500) {
        label = 'Very Negative';
        className = 'text-steam-review-negative';
    } else {
        // < 10% and total > 500
        label = 'Overwhelmingly Negative';
        className = 'text-steam-review-negative';
    }

    return {
        label,
        total,
        percentage: Math.round(percentage),
        className,
    };
}

/**
 * Format total reviews count for display
 */
export function formatReviewCount(total: number): string {
    if (total >= 1000000) {
        return `${(total / 1000000).toFixed(1)}M`;
    }
    if (total >= 1000) {
        return `${(total / 1000).toFixed(1)}K`;
    }
    return total.toLocaleString();
}

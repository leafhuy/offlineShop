/**
 * Generate a random 16-digit game key
 * Format: XXXX-XXXX-XXXX-XXXX
 */
export function generateGameKey(): string {
    const digits = '0123456789';
    let key = '';

    for (let i = 0; i < 16; i++) {
        key += digits.charAt(Math.floor(Math.random() * digits.length));

        // Add dash after every 4 digits (except at the end)
        if ((i + 1) % 4 === 0 && i < 15) {
            key += '-';
        }
    }

    return key;
}

/**
 * Generate an alphanumeric game key (like Steam keys)
 * Format: XXXXX-XXXXX-XXXXX
 */
export function generateAlphanumericKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing chars: 0,O,1,I
    let key = '';

    for (let i = 0; i < 15; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));

        // Add dash after every 5 characters
        if ((i + 1) % 5 === 0 && i < 14) {
            key += '-';
        }
    }

    return key;
}

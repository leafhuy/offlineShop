import { createClient } from '@/lib/supabase-browser';
import { Game } from '@/types/game';

export interface CartItem {
    id: string;
    user_id: string;
    game_appid: number;
    created_at: string;
    game?: Game;
}

export interface CartResult {
    success: boolean;
    error?: string;
}

/**
 * Add a game to cart
 */
export async function addToCart(appid: number): Promise<CartResult> {
    const supabase = createClient();

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Vui lòng đăng nhập để thêm vào giỏ hàng' };
    }

    // Check if already owned (purchased before)
    const { data: owned } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_appid', appid)
        .limit(1);

    if (owned && owned.length > 0) {
        return { success: false, error: 'Bạn đã sở hữu game này' };
    }

    // Check if already in cart
    const { data: inCart } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_appid', appid)
        .single();

    if (inCart) {
        return { success: false, error: 'Game đã có trong giỏ hàng' };
    }

    // Add to cart
    const { error } = await supabase
        .from('cart_items')
        .insert({
            user_id: user.id,
            game_appid: appid,
        });

    if (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: 'Không thể thêm vào giỏ hàng' };
    }

    return { success: true };
}

/**
 * Remove a game from cart
 */
export async function removeFromCart(appid: number): Promise<CartResult> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Vui lòng đăng nhập' };
    }

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('game_appid', appid);

    if (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: 'Không thể xóa khỏi giỏ hàng' };
    }

    return { success: true };
}

/**
 * Get all cart items with game details
 */
export async function getCartItems(): Promise<{ items: CartItem[]; total: number }> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { items: [], total: 0 };
    }

    // Get cart items
    const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error || !cartItems) {
        console.error('Error fetching cart:', error);
        return { items: [], total: 0 };
    }

    if (cartItems.length === 0) {
        return { items: [], total: 0 };
    }

    // Get game details for each cart item
    const appIds = cartItems.map(item => item.game_appid);
    const { data: games } = await supabase
        .from('offlineShop_gamedata')
        .select('*')
        .in('appid', appIds);

    // Merge cart items with game data
    const itemsWithGames = cartItems.map(item => ({
        ...item,
        game: games?.find(g => g.appid === item.game_appid),
    }));

    // Calculate total (use discount_price if available, else original_price)
    const total = itemsWithGames.reduce((sum, item) => {
        if (item.game) {
            const price = item.game.discount_price || item.game.original_price || 0;
            return sum + price;
        }
        return sum;
    }, 0);

    return { items: itemsWithGames, total };
}

/**
 * Get cart item count for Navbar badge
 */
export async function getCartCount(): Promise<number> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return 0;
    }

    const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error counting cart:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Check if user owns a game (has purchased it)
 */
export async function isGameOwned(appid: number): Promise<boolean> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return false;
    }

    const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_appid', appid)
        .limit(1);

    return data !== null && data.length > 0;
}

/**
 * Check if game is in cart
 */
export async function isGameInCart(appid: number): Promise<boolean> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return false;
    }

    const { data } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_appid', appid)
        .single();

    return !!data;
}

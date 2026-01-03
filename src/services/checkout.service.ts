import { createClient } from '@/lib/supabase-browser';
import { generateGameKey } from '@/utils/generator';

export interface OrderItem {
    game_appid: number;
    game_key: string;
    purchase_price: number;
}

export interface CheckoutResult {
    success: boolean;
    error?: string;
    orders?: OrderItem[];
}

/**
 * Process checkout - deduct wallet, generate keys, add to orders, clear cart
 */
export async function processCheckout(): Promise<CheckoutResult> {
    const supabase = createClient();

    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Vui lòng đăng nhập' };
    }

    // 2. Get cart items
    const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

    if (cartError || !cartItems || cartItems.length === 0) {
        return { success: false, error: 'Giỏ hàng trống' };
    }

    // 3. Get game prices
    const appIds = cartItems.map(item => item.game_appid);
    const { data: games, error: gamesError } = await supabase
        .from('offlineShop_gamedata')
        .select('appid, original_price, discount_price')
        .in('appid', appIds);

    if (gamesError || !games) {
        return { success: false, error: 'Không thể lấy thông tin game' };
    }

    // 4. Calculate total
    const total = games.reduce((sum, game) => {
        const price = game.discount_price || game.original_price || 0;
        return sum + price;
    }, 0);

    // 5. Get user's wallet balance
    const { data: profile, error: profileError } = await supabase
        .from('user_account')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return { success: false, error: 'Không thể lấy thông tin ví' };
    }

    const walletBalance = profile.wallet_balance || 0;

    // 6. Validate sufficient funds
    if (walletBalance < total) {
        return {
            success: false,
            error: `Số dư không đủ. Cần ${total.toLocaleString('vi-VN')}₫, có ${walletBalance.toLocaleString('vi-VN')}₫`
        };
    }

    // 7. Generate keys and create order items
    const orderItems: OrderItem[] = games.map(game => ({
        game_appid: game.appid,
        game_key: generateGameKey(),
        purchase_price: game.discount_price || game.original_price || 0,
    }));

    // 8. Deduct wallet balance
    const { error: updateError } = await supabase
        .from('user_account')
        .update({ wallet_balance: walletBalance - total })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating wallet:', updateError);
        return { success: false, error: 'Không thể trừ tiền từ ví' };
    }

    // 9. Insert orders with keys
    const ordersToInsert = orderItems.map(item => ({
        user_id: user.id,
        game_appid: item.game_appid,
        game_key: item.game_key,
        purchase_price: item.purchase_price,
    }));

    const { error: orderError } = await supabase
        .from('orders')
        .insert(ordersToInsert);

    if (orderError) {
        console.error('Error creating orders:', orderError);
        // Rollback: restore wallet balance
        await supabase
            .from('user_account')
            .update({ wallet_balance: walletBalance })
            .eq('id', user.id);
        return { success: false, error: 'Không thể tạo đơn hàng' };
    }

    // 10. Clear cart
    const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

    if (clearError) {
        console.error('Error clearing cart:', clearError);
    }

    return { success: true, orders: orderItems };
}

/**
 * Get user's order history
 */
export async function getOrders(): Promise<{ orders: any[]; error?: string }> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { orders: [], error: 'Vui lòng đăng nhập' };
    }

    // Get orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], error: 'Không thể lấy đơn hàng' };
    }

    if (!orders || orders.length === 0) {
        return { orders: [] };
    }

    // Get game details
    const appIds = orders.map(order => order.game_appid);
    const { data: games } = await supabase
        .from('offlineShop_gamedata')
        .select('appid, name, header_image')
        .in('appid', appIds);

    // Merge orders with game data
    const ordersWithGames = orders.map(order => ({
        ...order,
        game: games?.find(g => g.appid === order.game_appid),
    }));

    return { orders: ordersWithGames };
}

/**
 * Check if user has purchased a game
 */
export async function hasUserPurchased(appid: number): Promise<boolean> {
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

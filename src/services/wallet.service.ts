import { createClient } from '@/lib/supabase-browser';

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'deposit' | 'purchase';
    description: string | null;
    created_at: string;
}

export interface WalletResult {
    success: boolean;
    error?: string;
    newBalance?: number;
}

/**
 * Add funds to wallet (server-side logic simulated)
 * In production, this would be a Server Action
 */
export async function addFunds(amount: number): Promise<WalletResult> {
    const supabase = createClient();

    // 1. Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Vui lòng đăng nhập' };
    }

    // Validate amount
    if (amount <= 0) {
        return { success: false, error: 'Số tiền không hợp lệ' };
    }

    // 2. Get current balance
    const { data: profile, error: profileError } = await supabase
        .from('user_account')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return { success: false, error: 'Không thể lấy thông tin ví' };
    }

    const currentBalance = profile.wallet_balance || 0;
    const newBalance = currentBalance + amount;

    // 3. Update wallet balance
    const { error: updateError } = await supabase
        .from('user_account')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating wallet:', updateError);
        return { success: false, error: 'Không thể nạp tiền' };
    }

    // 4. Insert transaction record
    const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            amount: amount,
            type: 'deposit',
            description: 'Nạp tiền vào ví',
        });

    if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        // Note: Wallet already updated, just log error
    }

    return { success: true, newBalance };
}

/**
 * Get transaction history for current user
 */
export async function getTransactionHistory(): Promise<{ transactions: Transaction[]; error?: string }> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { transactions: [], error: 'Vui lòng đăng nhập' };
    }

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching transactions:', error);
        return { transactions: [], error: 'Không thể lấy lịch sử giao dịch' };
    }

    return { transactions: data || [] };
}

/**
 * Get wallet balance for current user
 */
export async function getWalletBalance(): Promise<number> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return 0;
    }

    const { data } = await supabase
        .from('user_account')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

    return data?.wallet_balance || 0;
}

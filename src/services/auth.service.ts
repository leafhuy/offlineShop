import { createClient } from '@/lib/supabase-browser';

export interface Profile {
    id: string;
    username: string | null;
    avatar_url: string | null;
    wallet_balance: number;
    created_at: string;
}

export interface AuthResult {
    success: boolean;
    error?: string;
}

// Sign up with email, password, and username
export async function signUp(
    email: string,
    password: string,
    username: string
): Promise<AuthResult> {
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
            },
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Sign in with email and password
export async function signIn(
    email: string,
    password: string
): Promise<AuthResult> {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Sign out
export async function signOut(): Promise<AuthResult> {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Get current user
export async function getUser() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    return user;
}

// Get user profile from public.profiles
export async function getProfile(): Promise<Profile | null> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('user_account')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile;
}

// Subscribe to auth changes
export function onAuthStateChange(callback: (user: any) => void) {
    const supabase = createClient();

    return supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user ?? null);
    });
}

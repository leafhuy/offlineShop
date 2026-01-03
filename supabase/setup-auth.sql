-- =============================================
-- SQL Script: User Authentication Setup
-- offlineShop Project
-- =============================================

-- 0. Drop existing trigger and function if exists (for re-running)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 1. Create user_account table
-- This table extends auth.users with additional user data
CREATE TABLE IF NOT EXISTS public.user_account (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    wallet_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_account ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (drop if exists to avoid duplicates)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_account;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_account;

CREATE POLICY "Users can view own profile" 
    ON public.user_account
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.user_account
    FOR UPDATE 
    USING (auth.uid() = id);

-- 4. Trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_account (id, username)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger - runs after new user is created in auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Mở Supabase Dashboard
-- 2. Vào Database → SQL Editor
-- 3. Paste toàn bộ script này
-- 4. Click "Run" để thực thi
-- =============================================

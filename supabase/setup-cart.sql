-- =============================================
-- SQL Script: Cart and Orders Tables
-- offlineShop Project
-- =============================================

-- Drop existing tables if re-running
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.library;
DROP TABLE IF EXISTS public.cart_items;

-- =============================================
-- 1. Cart Items Table
-- =============================================
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_account(id) ON DELETE CASCADE NOT NULL,
    game_appid BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, game_appid)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own cart" 
    ON public.cart_items
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart" 
    ON public.cart_items
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart" 
    ON public.cart_items
    FOR DELETE 
    USING (auth.uid() = user_id);

-- =============================================
-- 2. Orders Table (Purchase History with Game Keys)
-- =============================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_account(id) ON DELETE CASCADE NOT NULL,
    game_appid BIGINT NOT NULL,
    game_key TEXT NOT NULL,
    purchase_price NUMERIC NOT NULL,
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own orders" 
    ON public.orders
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own orders" 
    ON public.orders
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- =============================================
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Mở Supabase Dashboard
-- 2. Vào Database → SQL Editor
-- 3. Paste toàn bộ script này
-- 4. Click "Run" để thực thi
-- =============================================

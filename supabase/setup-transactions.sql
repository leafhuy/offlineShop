-- =============================================
-- SQL Script: Transactions Table
-- offlineShop Project
-- =============================================

-- Drop if re-running
DROP TABLE IF EXISTS public.transactions;

-- =============================================
-- Transactions Table (Wallet History)
-- =============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_account(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own transactions" 
    ON public.transactions
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
    ON public.transactions
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- =============================================
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Mở Supabase Dashboard
-- 2. Vào Database → SQL Editor
-- 3. Paste toàn bộ script này
-- 4. Click "Run" để thực thi
-- =============================================

-- =========================================================================
--             BONG TECH STORE - SUPABASE ORDERS / CHECKOUT TABLE SETUP
-- =========================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com)
-- This script safely creates the 'orders' table, configures Row Level Security 
-- (RLS) for customers & staff, and sets up Storage Buckets for receipt proofs.
-- =========================================================================

-- Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id text DEFAULT gen_random_uuid()::text PRIMARY KEY,      -- Custom Order ID (supports uuid or random generated tags)
    customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Customer account connection
    customer_name text NOT NULL,                              -- Contact name for invoice/shipping
    customer_email text NOT NULL,                             -- Contact email
    customer_phone text NOT NULL,                             -- Phone number for courier service
    items jsonb DEFAULT '[]'::jsonb NOT NULL,                 -- List of order items (product id, name, price, quantity, color)
    total_price text NOT NULL,                                -- Total amount matching display price (e.g. '$30.00')
    status text DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    receipt_path text,                                        -- Path to uploaded bank wire/payment remittance receipt
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe migration check: ensure columns matching our model mapping exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_path text;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Set up order security policies
-- Allow logged-in customers to view only their own orders
DROP POLICY IF EXISTS "Allow users to read their own orders" ON public.orders;
CREATE POLICY "Allow users to read their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid()::text = customer_id::text);

-- Allow logged-in customers to place their own orders
DROP POLICY IF EXISTS "Allow users to create their own orders" ON public.orders;
CREATE POLICY "Allow users to create their own orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = customer_id::text);

-- Allow admins/staff to have full overrides (view all orders, update status to confirmed/cancelled, delete)
DROP POLICY IF EXISTS "Allow admin/staff access to all orders" ON public.orders;
CREATE POLICY "Allow admin/staff access to all orders" ON public.orders
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
        auth.jwt() ->> 'email' = 'developer@bongtech.cc'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
        auth.jwt() ->> 'email' = 'developer@bongtech.cc'
    );


-- =========================================================================
-- 4. STORAGE BUCKET CONFIGURATION (FOR CUSTOMER PAYMENT RECEIPT UPLOADS)
-- =========================================================================

-- Register the 'app-files' bucket in Supabase Storage if it hasn't been created
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-files', 'app-files', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Storage Object policies
-- Allow authenticated users to upload receipts in their own designated paths
DROP POLICY IF EXISTS "Allow users to upload files to their folder" ON storage.objects;
CREATE POLICY "Allow users to upload files to their folder" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to retrieve/read their own receipts
DROP POLICY IF EXISTS "Allow users select privilege on their own folder" ON storage.objects;
CREATE POLICY "Allow users select privilege on their own folder" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to remove their uploaded receipts if needed
DROP POLICY IF EXISTS "Allow users delete privilege on their own folder" ON storage.objects;
CREATE POLICY "Allow users delete privilege on their own folder" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Give store admins/staff permission to review all payment proof files
DROP POLICY IF EXISTS "Allow staff and admin full override access to files" ON storage.objects;
CREATE POLICY "Allow staff and admin full override access to files" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'app-files' AND (
            auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
            auth.jwt() ->> 'email' = 'developer@bongtech.cc'
        )
    );

-- 5. Seeding example test order (uncomment to test table structure)
-- INSERT INTO public.orders (customer_name, customer_email, customer_phone, items, total_price, status) VALUES
-- ('Test Customer', 'customer@example.com', '+85512345678', '[{"productId": "iine-mini-retro", "productName": "IINE Mini Retro Wireless Controller", "price": "$15.00", "quantity": 1}]'::jsonb, '$15.00', 'pending');

-- 6. Successful creation check
SELECT 'Orders & Storage policies successfully deployed! Customers can now checkout safely. 🛍️' AS status;

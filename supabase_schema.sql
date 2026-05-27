-- =========================================================================
--              BONG TECH STORE - SUPABASE SCHEMA SETUP SCRIPT
-- =========================================================================
-- Copy and paste this script directly into Supabase's SQL Editor (https://supabase.com)
-- and click "Run" to set up your entire Postgres database tables, security policies, 
-- and storage folder system in 1 second.
-- =========================================================================

-- Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL CHECK (category IN ('Device', 'Gaming PC', 'Accessories', 'Smartphone', 'Product')),
    price text NOT NULL,
    colors text[] DEFAULT '{}'::text[],
    image text NOT NULL,
    specs jsonb DEFAULT '{}'::jsonb,
    description text NOT NULL,
    is_new boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product Policies
-- Customers / Public can view products
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- Staff and Admin can write / write / modify products
CREATE POLICY "Allow admin/staff write access to products" ON public.products
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
        auth.jwt() ->> 'email' = 'developer@bongtech.cc'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
        auth.jwt() ->> 'email' = 'developer@bongtech.cc'
    );


-- 2. STORE BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    excerpt text NOT NULL,
    date text DEFAULT to_char(now(), 'Mon DD, YYYY') NOT NULL,
    image text NOT NULL,
    author text NOT NULL DEFAULT 'Bong Tech Staff',
    category text NOT NULL,
    video_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Blog Posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog Policies
CREATE POLICY "Allow public read access to blogs" ON public.blog_posts
    FOR SELECT USING (true);

CREATE POLICY "Allow admin/staff write access to blogs" ON public.blog_posts
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
        auth.jwt() ->> 'email' = 'developer@bongtech.cc'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
        auth.jwt() ->> 'email' = 'developer@bongtech.cc'
    );


-- 3. CUSTOMER ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    total_price text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    receipt_path text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order Policies
-- Users can see their own orders
CREATE POLICY "Allow users to read their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = customer_id);

-- Users can place their own orders
CREATE POLICY "Allow users to create their own orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = customer_id);

-- Staff/Admin can view all orders & update status
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


-- 4. USER DIARY NOTES TABLE
CREATE TABLE IF NOT EXISTS public.notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Notes Policies
-- Users can completely manage their own notes
CREATE POLICY "Allow users full control of their own notes" ON public.notes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- =========================================================================
-- 5. STORAGE BUCKET CONFIGURATION FOR PROFILES & ORDER RECEIPTS
-- =========================================================================
-- Use the code below to auto-provision the 'app-files' bucket and access rules
-- =========================================================================

-- Insert bucket config if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-files', 'app-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket RLS Policies
-- Allow users to upload files inside their own user folder (auth.uid())
CREATE POLICY "Allow users to upload files to their folder" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to read files in their own folder
CREATE POLICY "Allow users select privilege on their own folder" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete files in their own folder
CREATE POLICY "Allow users delete privilege on their own folder" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow Admin and Staff complete override access to storage folder to view order proofs / avatars
CREATE POLICY "Allow staff and admin full override access to files" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'app-files' AND (
            auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
            auth.jwt() ->> 'email' = 'developer@bongtech.cc'
        )
    );

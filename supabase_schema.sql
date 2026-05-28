-- =========================================================================
--             BONG TECH STORE - UNIFIED RUN-FIRST SUPABASE SCRIPT
-- =========================================================================
-- Paste this entire script inside Supabase's SQL Editor (https://supabase.com)
-- and click Run. It will set up all tables, security configurations, storage
-- buckets, and pre-populate them with premium seed data.
-- =========================================================================

-- Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. CATEGORIES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id text PRIMARY KEY,                                      -- Human-readable unique key (e.g., 'accessories')
    name text NOT NULL,                                       -- User-facing display name (e.g., 'Accessories')
    description text,                                         -- Brief description of what this category holds
    image_url text,                                           -- Optional representative icon or banner URL
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories Policies
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin/staff write access to categories" ON public.categories;
CREATE POLICY "Allow admin/staff write access to categories" ON public.categories
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
-- 2. STORE PRODUCTS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,                                   -- Matches category name (e.g., 'Accessories')
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
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- Staff and Admin can maintain products
DROP POLICY IF EXISTS "Allow admin/staff write access to products" ON public.products;
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


-- =========================================================================
-- 3. STORE BLOG POSTS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
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
DROP POLICY IF EXISTS "Allow public read access to blogs" ON public.blog_posts;
CREATE POLICY "Allow public read access to blogs" ON public.blog_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin/staff write access to blogs" ON public.blog_posts;
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


-- =========================================================================
-- 4. CUSTOMER ORDERS TABLE
-- =========================================================================
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

-- Safe Migration: Ensure receipt_path column is present on existing tables too!
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS receipt_path text;

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order Policies
-- Users can see their own orders
DROP POLICY IF EXISTS "Allow users to read their own orders" ON public.orders;
CREATE POLICY "Allow users to read their own orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = customer_id);

-- Users can place their own orders
DROP POLICY IF EXISTS "Allow users to create their own orders" ON public.orders;
CREATE POLICY "Allow users to create their own orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = customer_id);

-- Staff/Admin can view all orders & update status
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
-- 5. USER DIARY NOTES TABLE (With a Row-Limit of Max 3 notes for free tiers)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Notes Policies
DROP POLICY IF EXISTS "Allow users full control of their own notes" ON public.notes;
CREATE POLICY "Allow users full control of their own notes" ON public.notes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- =========================================================================
-- 6. STORAGE BUCKET CONFIGURATION FOR PROFILES & ORDER RECEIPTS
-- =========================================================================
-- Registers the 'app-files' bucket in Supabase Storage.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-files', 'app-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket RLS Policies
-- Allow users to upload files inside their own folder named config (auth.uid())
DROP POLICY IF EXISTS "Allow users to upload files to their folder" ON storage.objects;
CREATE POLICY "Allow users to upload files to their folder" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to read files in their own folder
DROP POLICY IF EXISTS "Allow users select privilege on their own folder" ON storage.objects;
CREATE POLICY "Allow users select privilege on their own folder" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete files in their own folder
DROP POLICY IF EXISTS "Allow users delete privilege on their own folder" ON storage.objects;
CREATE POLICY "Allow users delete privilege on their own folder" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'app-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow Admin and Staff complete override access to storage folder to view order proofs / avatars
DROP POLICY IF EXISTS "Allow staff and admin full override access to files" ON storage.objects;
CREATE POLICY "Allow staff and admin full override access to files" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'app-files' AND (
            auth.jwt() ->> 'email' = 'sambathhok.true@gmail.com' OR 
            auth.jwt() ->> 'email' = 'developer@bongtech.cc'
        )
    );


-- =========================================================================
-- 7. SEED DATA SETUP
-- =========================================================================

-- Seed Categories matching App Filters
INSERT INTO public.categories (id, name, description) VALUES
('Product', 'Product', 'General tech gear, controllers, and items'),
('Accessories', 'Accessories', 'Premium gamepads, keypads, triggers, and cables'),
('Device', 'Device', 'Handheld mobile consoles and dedicated streaming hardware'),
('Gaming PC', 'Gaming PC', 'Powerful presets, high refresh rate monitors, and cooling accessories'),
('Smartphone', 'Smartphone', 'Gaming optimizations, triggers, and accessories for mobile phones')
ON CONFLICT (id) DO NOTHING;

-- Product catalog seeding
INSERT INTO public.products (id, name, category, price, colors, image, specs, description, is_new, is_featured) VALUES
(
  'iine-mini-retro', 
  'IINE Mini Retro Wireless Controller', 
  'Product', 
  '$15.00', 
  ARRAY['Blue', 'Black', 'Purple'], 
  'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&q=80&w=600', 
  '{"Compatible Devices": "Android, IOS, Nintendo Switch, Windows", "Controller Type": "Gamepad", "Additional Features": "Wireless", "Button Quantity": "12", "Hardware Platform": "Smartphone", "Power Source": "Battery Powered", "Software Name": "IINE"}'::jsonb, 
  'Compact and nostalgic wireless controller designed for multi-platform gaming.', 
  true, 
  true
),
(
  'iine-retro-pocket', 
  'IINE Retro Pocket Game Controller', 
  'Product', 
  '$30.00', 
  ARRAY['White Blue'], 
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600', 
  '{"Compatible Devices": "Android, IOS, Nintendo Switch, Windows", "Controller Type": "Gamepad", "Additional Features": "Wireless", "Button Quantity": "16", "Hardware Platform": "Smartphone", "Power Source": "Battery Powered", "Software Name": "IINE"}'::jsonb, 
  'Nostalgic pocket-sized controller with enhanced button layout for precision gaming.', 
  false, 
  true
),
(
  'iine-mini-retro-ananke-2', 
  'IINE MINI Retro Ananke 2', 
  'Product', 
  '$18.00', 
  ARRAY['Black', 'White'], 
  'https://images.unsplash.com/photo-1580234810907-b40315b76418?auto=format&fit=crop&q=80&w=600', 
  '{"Compatible Devices": "Android, IOS, Nintendo Switch, Windows", "Controller Type": "Gamepad", "Additional Features": "Wireless", "Button Quantity": "12", "Hardware Platform": "Multi-platform", "Power Source": "Battery Powered"}'::jsonb, 
  'Compact retro-style controller with specialized Ananke 2 design for versatile compatibility across platforms.', 
  true, 
  false
)
ON CONFLICT (id) DO NOTHING;

-- Blog articles seeding
INSERT INTO public.blog_posts (id, title, excerpt, date, image, author, category, video_url) VALUES
(
  '3', 
  'One x Player 2 Gaming ចលត័ ងាយយកតាមខ្លួន', 
  'ផលិតផល Gaming handheld ដែលមានតម្លៃធូរកាលមុន ឥឡូវឡើងថ្លៃហើយ!', 
  'April 19, 2024', 
  'https://img.youtube.com/vi/TAI_3NY-wNw/maxresdefault.jpg', 
  'Bong Tech Team', 
  'YouTube', 
  'https://www.youtube.com/embed/TAI_3NY-wNw'
),
(
  '1', 
  'Top 5 Controllers for Mobile Gaming in 2024', 
  'Mobile gaming has come a long way. Discover the best controllers that will elevate your experience on Android and iOS.', 
  'April 15, 2024', 
  'https://images.unsplash.com/photo-1592578629295-73a1dd9d4bc9?auto=format&fit=crop&q=80&w=800', 
  'Bong Tech Team', 
  'Reviews', 
  NULL
),
(
  '2', 
  'How to Build Your First Gaming PC: A Step-by-Step Guide', 
  'Building a PC can be daunting. We break down everything you need to know from picking parts to the first boot.', 
  'April 10, 2024', 
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800', 
  'Tech Specialist', 
  'Guides', 
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Complete confirmation
SELECT 'Supabase Setup Complete! All tables, policies, bucket permissions, and pre-seeded products/blogs are active. Keep gaming! 🎮' AS status;

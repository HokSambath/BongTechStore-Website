-- =========================================================================
--             BONG TECH STORE - SUPABASE BLOG POSTS TABLE SETUP
-- =========================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com)
-- This script creates the 'blog_posts' table, configures Row Level Security 
-- (RLS), and seeds it with default articles.
-- =========================================================================

-- Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create the blog posts table
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 3. Set up read/write policies
-- Allow everyone (including guests & logged-in customers) to read blog posts
DROP POLICY IF EXISTS "Allow public read access to blogs" ON public.blog_posts;
CREATE POLICY "Allow public read access to blogs" ON public.blog_posts
    FOR SELECT USING (true);

-- Allow admins/staff to write & manage blog posts
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

-- 4. Seed default articles matching the application presets
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

-- 5. Complete! Let's verify that the table has been successfully populated
SELECT * FROM public.blog_posts;

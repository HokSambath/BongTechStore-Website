-- ==========================================
-- SUPABASE DDL FOR BONG TECH STORE BLOG POSTS
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create the blog_posts table
create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  excerpt text not null,
  date text not null,
  image text not null default 'https://picsum.photos/seed/gaming-blog/800/400',
  author text not null,
  category text not null,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.blog_posts enable row level security;

-- 3. Policy: Public read access
create policy "Allow public read access to blog_posts"
  on public.blog_posts for select
  using (true);

-- 4. Policy: Allow authenticated admin and staff to insert
create policy "Allow admin and staff to insert blog_posts"
  on public.blog_posts for insert
  with check (
    auth.role() = 'authenticated'
  );

-- 5. Policy: Allow authenticated admin and staff to update
create policy "Allow admin and staff to update blog_posts"
  on public.blog_posts for update
  using (
    auth.role() = 'authenticated'
  );

-- 6. Policy: Allow authenticated admin and staff to delete
create policy "Allow admin and staff to delete blog_posts"
  on public.blog_posts for delete
  using (
    auth.role() = 'authenticated'
  );

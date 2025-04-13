/*
  # Initial Schema Setup

  1. New Tables
    - users (extends auth.users)
    - posts
    - comments
    - login_history
    - subscriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for data access
*/

-- Users table extending auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  browser_info jsonb,
  ip_address text,
  location jsonb,
  friend_count int DEFAULT 0,
  subscription_plan text,
  subscription_end_date timestamptz,
  language_preference text DEFAULT 'en',
  password_reset_count int DEFAULT 0,
  password_reset_last_date date
);

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  content text,
  media_url text,
  media_type text,
  created_at timestamptz DEFAULT now(),
  likes int DEFAULT 0
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id),
  user_id uuid REFERENCES public.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Login history table
CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  login_time timestamptz DEFAULT now(),
  browser_info jsonb,
  ip_address text,
  location jsonb
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own posts"
  ON public.posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see their login history"
  ON public.login_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
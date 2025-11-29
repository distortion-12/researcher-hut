-- Researcher.Hut Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Users table for regular users
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    profile_picture TEXT,
    username_changed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table for research articles
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT DEFAULT 'Admin',
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table for post comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table for post ratings
CREATE TABLE IF NOT EXISTS ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Admin settings table for admin authentication
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_email TEXT UNIQUE NOT NULL,
    admin_username TEXT NOT NULL,
    admin_password_hash TEXT NOT NULL,
    otp TEXT,
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update themselves" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Posts policies (public read, admin write)
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Service role can manage posts" ON posts FOR ALL USING (true);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid()::text = user_id::text);

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add ratings" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Admin settings policies (service role only)
CREATE POLICY "Service role can manage admin_settings" ON admin_settings FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_ratings_post_id ON ratings(post_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for admin_settings updated_at
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

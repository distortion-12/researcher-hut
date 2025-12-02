-- Stories table for user experiences and trauma sharing
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'experience', -- 'experience', 'trauma', 'journey', 'recovery', 'other'
    is_anonymous BOOLEAN DEFAULT false,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT, -- Store name for display (or 'Anonymous')
    is_published BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story helpful votes (like reactions)
CREATE TABLE IF NOT EXISTS story_helpful (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Story comments for support
CREATE TABLE IF NOT EXISTS story_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Anyone can view published stories" ON stories FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can add stories" ON stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own stories" ON stories FOR UPDATE USING (auth.uid()::text = author_id::text);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid()::text = author_id::text);

-- Story helpful policies
CREATE POLICY "Anyone can view helpful counts" ON story_helpful FOR SELECT USING (true);
CREATE POLICY "Authenticated users can mark helpful" ON story_helpful FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove their helpful mark" ON story_helpful FOR DELETE USING (auth.uid()::text = user_id::text);

-- Story comments policies
CREATE POLICY "Anyone can view story comments" ON story_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add comments" ON story_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON story_comments FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_story_helpful_story_id ON story_helpful(story_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);

-- Trigger for stories updated_at
CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

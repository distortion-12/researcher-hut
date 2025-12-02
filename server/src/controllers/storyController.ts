import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

// Get all published stories
export const getAllStories = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('stories')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get single story by ID
export const getStoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get stories by user
export const getUserStories = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new story
export const createStory = async (req: Request, res: Response) => {
  try {
    const { title, content, category, is_anonymous, author_id, author_name } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const displayName = is_anonymous ? 'Anonymous' : author_name;
    
    // Check if author exists in users table, if not set to null
    let validAuthorId = null;
    if (author_id) {
      const { data: userExists } = await supabase
        .from('users')
        .select('id')
        .eq('id', author_id)
        .single();
      
      if (userExists) {
        validAuthorId = author_id;
      }
    }
    
    const { data, error } = await supabase
      .from('stories')
      .insert({
        title,
        content,
        category: category || 'experience',
        is_anonymous: is_anonymous || false,
        author_id: validAuthorId,
        author_name: displayName,
        is_published: true,
        helpful_count: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update a story
export const updateStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, is_anonymous, author_name } = req.body;
    
    const displayName = is_anonymous ? 'Anonymous' : author_name;
    
    const { data, error } = await supabase
      .from('stories')
      .update({
        title,
        content,
        category,
        is_anonymous,
        author_name: displayName,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a story
export const deleteStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Story deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle helpful mark on a story
export const toggleHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if user already marked as helpful
    const { data: existing } = await supabase
      .from('story_helpful')
      .select('id')
      .eq('story_id', id)
      .eq('user_id', user_id)
      .single();
    
    if (existing) {
      // Remove helpful mark
      await supabase
        .from('story_helpful')
        .delete()
        .eq('story_id', id)
        .eq('user_id', user_id);
      
      // Decrement count
      await supabase.rpc('decrement_helpful_count', { story_id: id });
      
      res.json({ helpful: false, message: 'Helpful mark removed' });
    } else {
      // Add helpful mark
      await supabase
        .from('story_helpful')
        .insert({ story_id: id, user_id });
      
      // Increment count
      await supabase.rpc('increment_helpful_count', { story_id: id });
      
      res.json({ helpful: true, message: 'Marked as helpful' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Check if user marked story as helpful
export const checkHelpful = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    
    const { data } = await supabase
      .from('story_helpful')
      .select('id')
      .eq('story_id', id)
      .eq('user_id', userId)
      .single();
    
    res.json({ helpful: !!data });
  } catch (error: any) {
    res.json({ helpful: false });
  }
};

// Get comments for a story
export const getStoryComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('story_comments')
      .select('*')
      .eq('story_id', id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Add comment to a story
export const addStoryComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, user_name, content, is_anonymous } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const displayName = is_anonymous ? 'Anonymous' : user_name;
    
    const { data, error } = await supabase
      .from('story_comments')
      .insert({
        story_id: id,
        user_id,
        user_name: displayName,
        content,
        is_anonymous: is_anonymous || false
      })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete comment
export const deleteStoryComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    
    const { error } = await supabase
      .from('story_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    res.json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

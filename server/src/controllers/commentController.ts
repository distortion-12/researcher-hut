import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { sanitizeText, sanitizeHtml } from '../lib/validation';

// Get comments for a post
export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'An error occurred' });
    }

    res.json(comments);
  } catch (err: any) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Create comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { user_id, user_name, user_email, content } = req.body;

    // SECURITY FIX: Validate and sanitize all inputs to prevent XSS
    if (!user_id || !user_name || !user_email || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeText(user_name).substring(0, 100);
    const sanitizedEmail = sanitizeText(user_email).substring(0, 254);
    const sanitizedContent = sanitizeHtml(content).substring(0, 5000);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (sanitizedContent.length < 5) {
      return res.status(400).json({ error: 'Comment must be at least 5 characters' });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id,
        user_name: sanitizedName,
        user_email: sanitizedEmail,
        content: sanitizedContent,
      }])
      .select()
      .single();

    if (error) {
      console.error('Comment creation error:', error);
      return res.status(400).json({ error: 'Failed to create comment' });
    }

    res.status(201).json(data);
  } catch (err: any) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Validate ID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Comment deletion error:', error);
      return res.status(400).json({ error: 'Failed to delete comment' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (err: any) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

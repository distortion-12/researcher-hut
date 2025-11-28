import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

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
      return res.status(500).json({ error: error.message });
    }

    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Create comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { user_id, user_name, user_email, content } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id,
        user_name,
        user_email,
        content: content.trim(),
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

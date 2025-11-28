import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

// Get ratings for a post
export const getRatings = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('post_id', postId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Calculate average
    let averageRating = 0;
    let totalRatings = 0;

    if (ratings && ratings.length > 0) {
      const total = ratings.reduce((sum, r) => sum + r.rating, 0);
      averageRating = total / ratings.length;
      totalRatings = ratings.length;
    }

    res.json({ ratings, averageRating, totalRatings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get user rating for a post
export const getUserRating = async (req: Request, res: Response) => {
  try {
    const { postId, userId } = req.params;

    const { data: rating, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    res.json(rating || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Create or update rating
export const upsertRating = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { user_id, rating } = req.body;

    // Check if rating exists
    const { data: existing } = await supabase
      .from('ratings')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data);
    } else {
      // Insert new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert([{ post_id: postId, user_id, rating }])
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json(data);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

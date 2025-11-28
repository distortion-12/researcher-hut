import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { Post } from '../types';

// Get all published posts
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get all posts (admin)
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get post by slug
export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Create post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, slug, content, is_published = true } = req.body;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, slug, content, is_published }])
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

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, content, is_published } = req.body;

    const { data, error } = await supabase
      .from('posts')
      .update({ title, slug, content, is_published })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle publish status
export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    const { data, error } = await supabase
      .from('posts')
      .update({ is_published })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

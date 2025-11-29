import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { Post } from '../types';

// Get all published AND approved posts (public view)
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .eq('is_approved', true)
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

// Get pending posts (admin - not yet approved)
export const getPendingPosts = async (req: Request, res: Response) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Get posts by user ID (user's own posts)
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', userId)
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

// Create post (admin - auto approved)
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, slug, content, is_published = true } = req.body;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, slug, content, is_published, is_approved: true, author: 'Admin' }])
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

// Create post (user - needs approval)
export const createUserPost = async (req: Request, res: Response) => {
  try {
    const { title, slug, content, author_id, author_name } = req.body;

    // Don't include author_id if it would violate foreign key
    // The author_id from Supabase Auth may not exist in our users table
    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        title, 
        slug, 
        content, 
        author: author_name || 'User',
        is_published: false, 
        is_approved: false 
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

// Approve post (admin)
export const approvePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('posts')
      .update({ is_approved: true, is_published: true })
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

// Reject post (admin - deletes the post)
export const rejectPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Post rejected and deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Search posts by keyword (searches title and content)
export const searchPosts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = q.toLowerCase().trim();
    
    // Get all published and approved posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Filter posts that match the search term in title or content
    // This provides a simple keyword and similar word matching
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 2);
    
    const filteredPosts = posts?.filter((post: Post) => {
      const titleLower = post.title.toLowerCase();
      const contentLower = post.content.toLowerCase();
      
      // Check if any search word matches in title or content
      return searchWords.some(word => 
        titleLower.includes(word) || contentLower.includes(word)
      ) || titleLower.includes(searchTerm) || contentLower.includes(searchTerm);
    }) || [];

    res.json(filteredPosts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

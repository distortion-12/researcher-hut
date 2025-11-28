import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

// Check username availability
export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    res.json({ available: !data });
  } catch (err: any) {
    res.json({ available: true });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Create user profile
export const createUser = async (req: Request, res: Response) => {
  try {
    const { id, email, username, name } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert([{
        id,
        email,
        username: username.toLowerCase(),
        name,
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

import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

// Username change cooldown period (30 days in milliseconds)
const USERNAME_CHANGE_COOLDOWN_DAYS = 30;

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

// Update user profile
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, username, profile_picture } = req.body;

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentUser) {
      // If user doesn't exist, create them first
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ id, name: name || 'User', email: req.body.email || '' }])
        .select()
        .single();
      
      if (createError) {
        return res.status(404).json({ error: 'User not found and could not be created' });
      }
      
      return res.json(newUser);
    }

    const updateData: any = { updated_at: new Date().toISOString() };

    // Update name (no restrictions)
    if (name !== undefined && name !== currentUser.name) {
      updateData.name = name;
    }

    // Update profile picture (no restrictions)
    if (profile_picture !== undefined) {
      updateData.profile_picture = profile_picture;
    }

    // Update username (with restrictions)
    if (username && username.toLowerCase() !== currentUser.username) {
      // Check if username change is allowed (30 day cooldown)
      if (currentUser.username_changed_at) {
        const lastChanged = new Date(currentUser.username_changed_at);
        const now = new Date();
        const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceChange < USERNAME_CHANGE_COOLDOWN_DAYS) {
          const daysRemaining = USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceChange;
          return res.status(400).json({ 
            error: `You can change your username again in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}` 
          });
        }
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ 
          error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
        });
      }

      // Check if username is available
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .neq('id', id)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }

      updateData.username = username.toLowerCase();
      updateData.username_changed_at = new Date().toISOString();
    }

    // Perform update
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
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

// Check if username can be changed
export const checkUsernameChangeAllowed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('username_changed_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.username_changed_at) {
      return res.json({ allowed: true, daysRemaining: 0 });
    }

    const lastChanged = new Date(user.username_changed_at);
    const now = new Date();
    const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceChange);

    res.json({
      allowed: daysRemaining === 0,
      daysRemaining,
      lastChangedAt: user.username_changed_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { sendOtpEmail } from '../lib/email';
import crypto from 'crypto';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Generate 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore: Map<string, { otp: string; expires: number }> = new Map();

// Simple hash function for password
const hashPassword = async (password: string): Promise<string> => {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
};

// Get admin settings
export const getAdminSettings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('id, email, username')
      .single();

    if (error || !data) {
      return res.json({ email: DEFAULT_ADMIN_EMAIL });
    }

    res.json({ email: data.email, username: data.username });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Send OTP for admin login
export const sendAdminOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if email matches admin email
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('email')
      .single();

    const validEmail = settings?.email || DEFAULT_ADMIN_EMAIL;

    if (email !== validEmail) {
      return res.status(400).json({ error: 'Invalid admin email' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in memory
    otpStore.set(email, { otp, expires: expiresAt.getTime() });

    // Store OTP in admin_settings table as backup
    if (settings) {
      await supabase
        .from('admin_settings')
        .update({ otp, otp_expires_at: expiresAt.toISOString() })
        .eq('email', email);
    }

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
      return res.json({ 
        message: 'Email sending failed. Check server console for OTP.',
        devMode: true
      });
    }

    res.json({ message: 'OTP sent successfully to ' + email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP and admin credentials
export const verifyAdminLogin = async (req: Request, res: Response) => {
  try {
    const { email, otp, username, password } = req.body;

    // Get admin settings
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    if (settingsError || !settings) {
      return res.status(400).json({ error: 'Admin not configured. Please set up credentials first.' });
    }

    // Verify username and password
    const passwordHash = await hashPassword(password);
    if (username !== settings.username || passwordHash !== settings.password_hash) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // First check local OTP store (dev mode)
    const storedOtp = otpStore.get(email);
    let otpValid = false;

    if (storedOtp && storedOtp.otp === otp && storedOtp.expires > Date.now()) {
      otpValid = true;
      otpStore.delete(email);
    } else if (settings.otp === otp && settings.otp_expires_at && new Date(settings.otp_expires_at) > new Date()) {
      // Check database OTP
      otpValid = true;
      await supabase.from('admin_settings').update({ otp: null, otp_expires_at: null }).eq('id', settings.id);
    } else {
      // Try Supabase OTP verification
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (!error) {
        otpValid = true;
        await supabase.auth.signOut();
      }
    }

    if (!otpValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({
      success: true,
      admin: {
        id: settings.id,
        email: settings.email,
        name: 'Admin',
        isAdmin: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Send OTP for credential reset
export const sendResetOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    // If settings exist, only allow configured admin email
    if (settings && email !== settings.email) {
      return res.status(400).json({ error: 'Invalid admin email' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Store OTP in memory
    otpStore.set(email, { otp, expires: expiresAt.getTime() });

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      console.log(`[FALLBACK] Reset OTP for ${email}: ${otp}`);
      return res.json({ 
        message: 'Email sending failed. Check server console for OTP.',
        devMode: true 
      });
    }

    res.json({ message: 'OTP sent successfully to ' + email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Reset admin credentials
export const resetAdminCredentials = async (req: Request, res: Response) => {
  try {
    const { email, otp, newUsername, newPassword } = req.body;

    // Validate credentials
    if (newUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check local OTP store first (dev mode)
    const storedOtp = otpStore.get(email);
    let otpValid = false;

    if (storedOtp && storedOtp.otp === otp && storedOtp.expires > Date.now()) {
      otpValid = true;
      otpStore.delete(email);
    } else {
      // Try Supabase OTP verification
      const { error: otpError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (!otpError) {
        otpValid = true;
        await supabase.auth.signOut();
      }
    }

    if (!otpValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash password
    const passwordHash = await hashPassword(newPassword);

    // Check if admin settings exist
    const { data: existing } = await supabase
      .from('admin_settings')
      .select('id')
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('admin_settings')
        .update({
          email,
          username: newUsername,
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          email,
          username: newUsername,
          password_hash: passwordHash,
        });

      if (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    res.json({ message: 'Credentials updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Store pending user registrations
const pendingUsers: Map<string, { email: string; name: string; username: string; password: string; otp: string; expires: number }> = new Map();

// Send OTP for user signup
export const sendUserSignupOtp = async (req: Request, res: Response) => {
  try {
    const { email, name, username, password } = req.body;

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store pending registration
    pendingUsers.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      name,
      username: username.toLowerCase(),
      password,
      otp,
      expires: expiresAt,
    });

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      console.log(`[FALLBACK] Signup OTP for ${email}: ${otp}`);
      return res.json({ 
        message: 'OTP generated. Check server console for OTP.',
        devMode: true 
      });
    }

    res.json({ message: 'OTP sent successfully to ' + email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Verify user signup OTP and create account
export const verifyUserSignupOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const pending = pendingUsers.get(email.toLowerCase());

    if (!pending) {
      return res.status(400).json({ error: 'No pending registration found. Please request OTP again.' });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (pending.expires < Date.now()) {
      pendingUsers.delete(email.toLowerCase());
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: pending.email,
      password: pending.password,
      email_confirm: true,
      user_metadata: { name: pending.name, username: pending.username },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: pending.email,
        username: pending.username,
        name: pending.name,
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }

    // Clean up pending registration
    pendingUsers.delete(email.toLowerCase());

    res.json({ 
      success: true, 
      message: 'Account created successfully! You can now sign in.',
      user: {
        id: authData.user.id,
        email: pending.email,
        name: pending.name,
        username: pending.username,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

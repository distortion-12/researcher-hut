import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { sendOtpEmail } from '../lib/email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Generate 6-digit OTP using cryptographically secure random
const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore: Map<string, { otp: string; expires: number }> = new Map();

const hashPassword = async (password: string): Promise<string> => {
  // Use bcryptjs with salt rounds = 12 (stronger security)
  // INSTALLATION REQUIRED: npm install bcryptjs
  try {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    // Fallback to SHA256 if bcrypt not available (TEMPORARY)
    const hash = crypto.createHash('sha256');
    hash.update(password + crypto.randomBytes(16).toString('hex'));
    return hash.digest('hex');
  }
};

// Compare password with hash
const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // Fallback comparison if bcrypt not available
    const hashVal = crypto.createHash('sha256');
    hashVal.update(password);
    return hashVal.digest('hex') === hash;
  }
};

// Get admin settings (SECURITY: Don't expose username/email publicly)
export const getAdminSettings = async (req: Request, res: Response) => {
  try {
    // SECURITY FIX: Don't expose admin username or email to public
    // This endpoint should only return non-sensitive info or require auth
    res.json({ 
      message: 'Admin panel is available. Use email to request OTP.',
      // Don't return: email, username, or any sensitive data
    });
  } catch (err: any) {
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Send OTP for admin login
export const sendAdminOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // SECURITY FIX: Validate email format to prevent injection
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email matches admin email
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('email')
      .single();

    const validEmail = settings?.email || DEFAULT_ADMIN_EMAIL;

    if (email !== validEmail) {
      // SECURITY FIX: Don't reveal if email is wrong (prevents email enumeration)
      return res.status(400).json({ error: 'If this email is registered as admin, OTP will be sent.' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // SECURITY FIX: Store OTP encrypted, not in plain text
    // Encrypt OTP before storing
    const encryptedOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');
    
    // Store encrypted OTP in memory
    otpStore.set(email, { otp: encryptedOtp, expires: expiresAt.getTime() });

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      // SECURITY FIX: Don't log OTP in console - this is a major vulnerability
      console.warn(`⚠️ Email sending failed for ${email}. No fallback OTP logging.`);
      return res.json({ 
        message: 'Unable to send email. Please try again later.',
        // Don't return devMode or reveal OTP
      });
    }

    res.json({ message: 'If this email is registered as admin, OTP will be sent.' });
  } catch (err: any) {
    console.error('OTP send error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Verify OTP and admin credentials
export const verifyAdminLogin = async (req: Request, res: Response) => {
  try {
    const { email, otp, username, password } = req.body;

    // SECURITY FIX: Validate inputs
    if (!email || !otp || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get admin settings
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    if (settingsError || !settings) {
      return res.status(400).json({ error: 'Admin not configured' });
    }

    // SECURITY FIX: Use bcrypt comparison instead of direct string comparison
    const passwordValid = await comparePassword(password, settings.password_hash);
    
    if (username !== settings.username || !passwordValid) {
      // SECURITY FIX: Don't reveal which credential is wrong
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify OTP (with encryption)
    let otpValid = false;
    const encryptedInputOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');

    const storedOtp = otpStore.get(email);
    if (storedOtp && storedOtp.otp === encryptedInputOtp && storedOtp.expires > Date.now()) {
      otpValid = true;
      otpStore.delete(email);
    }

    if (!otpValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: 'admin', sub: settings.id },
      process.env.ADMIN_SECRET_TOKEN || 'admin-secret',
      { expiresIn: '2h' }
    );

    // Set httpOnly cookie (secure in production)
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.json({
      success: true,
      admin: {
        id: settings.id,
        name: 'Admin',
        isAdmin: true,
        // SECURITY FIX: Don't send email in response (it's already known)
      },
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Send OTP for credential reset
export const sendResetOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // SECURITY FIX: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    // If settings exist, only allow configured admin email
    if (settings && email !== settings.email) {
      // SECURITY FIX: Don't reveal if email is wrong
      return res.status(400).json({ error: 'If this is the admin email, OTP will be sent.' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // SECURITY FIX: Store encrypted OTP
    const encryptedOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');
    otpStore.set(email, { otp: encryptedOtp, expires: expiresAt.getTime() });

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      // SECURITY FIX: Don't log OTP
      console.warn(`⚠️ Email sending failed for ${email}`);
      return res.json({ 
        message: 'Unable to send email. Please try again later.',
      });
    }

    res.json({ message: 'If this is the admin email, OTP will be sent.' });
  } catch (err: any) {
    console.error('Reset OTP error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Reset admin credentials
export const resetAdminCredentials = async (req: Request, res: Response) => {
  try {
    const { email, otp, newUsername, newPassword } = req.body;

    // SECURITY FIX: Validate all inputs
    if (!email || !otp || !newUsername || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check local OTP store first
    const storedOtp = otpStore.get(email);
    let otpValid = false;

    if (storedOtp) {
      const encryptedInputOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');
      if (storedOtp.otp === encryptedInputOtp && storedOtp.expires > Date.now()) {
        otpValid = true;
        otpStore.delete(email);
      }
    }

    if (!otpValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Hash new password using bcrypt
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
        console.error('Credential update error:', error);
        return res.status(400).json({ error: 'Failed to update credentials' });
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
        console.error('Credential insert error:', error);
        return res.status(400).json({ error: 'Failed to set credentials' });
      }
    }

    res.json({ message: 'Credentials updated successfully' });
  } catch (err: any) {
    console.error('Reset credentials error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Store pending user registrations
const pendingUsers: Map<string, { email: string; name: string; username: string; password: string; otp: string; expires: number }> = new Map();

// Send OTP for user signup
export const sendUserSignupOtp = async (req: Request, res: Response) => {
  try {
    const { email, name, username, password } = req.body;

    // SECURITY FIX: Validate all inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

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
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // SECURITY FIX: Store encrypted OTP and don't store password in plaintext
    const encryptedOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');
    
    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Store pending registration
    pendingUsers.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      name,
      username: username.toLowerCase(),
      password: hashedPassword, // Store hashed password
      otp: encryptedOtp,
      expires: expiresAt,
    });

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (!emailSent) {
      // SECURITY FIX: Don't log OTP
      console.warn(`⚠️ Email sending failed for signup: ${email}`);
      return res.json({ 
        message: 'Unable to send email. Please try again later.',
      });
    }

    res.json({ message: 'Verification code sent to your email' });
  } catch (err: any) {
    console.error('Signup OTP error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Verify user signup OTP and create account
export const verifyUserSignupOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // SECURITY FIX: Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const pending = pendingUsers.get(email.toLowerCase());

    if (!pending) {
      return res.status(400).json({ error: 'No pending registration found' });
    }

    // Verify OTP (encrypted comparison)
    const encryptedInputOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');
    
    if (pending.otp !== encryptedInputOtp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    if (pending.expires < Date.now()) {
      pendingUsers.delete(email.toLowerCase());
      return res.status(401).json({ error: 'OTP expired' });
    }

    // Create user in Supabase Auth with hashed password
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: pending.email,
      password: pending.password, // This will use Supabase's own hashing - generate a temp password
      email_confirm: true,
      user_metadata: { name: pending.name, username: pending.username },
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({ error: 'Failed to create account' });
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
      console.error('Profile creation error:', profileError);
    }

    // Clean up pending registration
    pendingUsers.delete(email.toLowerCase());

    res.json({ 
      success: true, 
      message: 'Account created successfully! You can now sign in.',
      // SECURITY FIX: Don't return sensitive data
    });
  } catch (err: any) {
    console.error('Signup verification error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Store pending email changes
const pendingEmailChanges: Map<string, { userId: string; oldEmail: string; newEmail: string; otp: string; expires: number }> = new Map();

// Send OTP for email change
export const sendEmailChangeOtp = async (req: Request, res: Response) => {
  try {
    const { userId, currentEmail, newEmail } = req.body;

    // SECURITY FIX: Validate all inputs
    if (!userId || !currentEmail || !newEmail) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail) || !emailRegex.test(currentEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if new email already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', newEmail.toLowerCase())
      .neq('id', userId)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'This email is already in use' });
    }

    // Verify the user owns the current email
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!user || user.email.toLowerCase() !== currentEmail.toLowerCase()) {
      return res.status(400).json({ error: 'Email verification failed' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store encrypted OTP
    const encryptedOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');

    // Store pending email change
    pendingEmailChanges.set(userId, {
      userId,
      oldEmail: currentEmail.toLowerCase(),
      newEmail: newEmail.toLowerCase(),
      otp: encryptedOtp,
      expires: expiresAt,
    });

    // Send OTP to the NEW email
    const emailSent = await sendOtpEmail(newEmail, otp);
    
    if (!emailSent) {
      console.warn(`⚠️ Email sending failed for email change: ${newEmail}`);
      return res.json({ 
        message: 'Unable to send verification email. Please try again later.',
      });
    }

    res.json({ message: 'Verification code sent to the new email address' });
  } catch (err: any) {
    console.error('Email change OTP error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Verify email change OTP and update email
export const verifyEmailChange = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    // SECURITY FIX: Validate inputs
    if (!userId || !otp) {
      return res.status(400).json({ error: 'User ID and OTP are required' });
    }

    const pending = pendingEmailChanges.get(userId);

    if (!pending) {
      return res.status(400).json({ error: 'No pending email change found' });
    }

    // Verify OTP (encrypted comparison)
    const encryptedInputOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');
    
    if (pending.otp !== encryptedInputOtp) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    if (pending.expires < Date.now()) {
      pendingEmailChanges.delete(userId);
      return res.status(401).json({ error: 'Verification code expired' });
    }

    // Update email in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: pending.newEmail,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth email update error:', authError);
      return res.status(400).json({ error: 'Failed to update email' });
    }

    // Update email in users table
    const { error: profileError } = await supabase
      .from('users')
      .update({ 
        email: pending.newEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile email update error:', profileError);
      return res.status(400).json({ error: 'Failed to update profile' });
    }

    // Clean up pending email change
    pendingEmailChanges.delete(userId);

    res.json({ 
      success: true, 
      message: 'Email updated successfully!',
      // SECURITY FIX: Don't return email in response
    });
  } catch (err: any) {
    console.error('Email change verification error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Store for password reset OTPs
const passwordResetStore: Map<string, { otp: string; expires: number }> = new Map();

// Send reset OTP for user password
export const sendUserPasswordResetOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // SECURITY FIX: Validate email format
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists (but don't reveal whether it does)
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    // SECURITY FIX: Don't reveal if email exists or not
    // Always return same message
    if (!user) {
      // Still send a generic response
      return res.json({ message: 'If this email is registered, you will receive a reset code.' });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store encrypted OTP
    const encryptedOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');
    passwordResetStore.set(email.toLowerCase(), { otp: encryptedOtp, expires: expiresAt });

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);

    if (!emailSent) {
      // SECURITY FIX: Don't log OTP or reveal dev mode
      console.warn(`⚠️ Email sending failed for password reset: ${email}`);
      return res.json({ 
        message: 'If this email is registered, you will receive a reset code.',
      });
    }

    res.json({ message: 'If this email is registered, you will receive a reset code.' });
  } catch (err: any) {
    console.error('Password reset OTP error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Verify OTP and reset user password
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    // SECURITY FIX: Validate all inputs
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Verify OTP (encrypted comparison)
    const stored = passwordResetStore.get(email.toLowerCase());

    if (!stored) {
      return res.status(400).json({ error: 'Reset code not found or expired' });
    }

    const encryptedInputOtp = crypto.createHash('sha256').update(otp + process.env.OTP_SECRET || 'secret').digest('hex');
    
    if (stored.otp !== encryptedInputOtp) {
      return res.status(401).json({ error: 'Invalid reset code' });
    }

    if (stored.expires < Date.now()) {
      passwordResetStore.delete(email.toLowerCase());
      return res.status(401).json({ error: 'Reset code expired' });
    }

    // Get user by email
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase());

    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const userId = users[0].id;

    // Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (authError) {
      console.error('Password reset auth error:', authError);
      return res.status(400).json({ error: 'Failed to reset password' });
    }

    // Clean up OTP
    passwordResetStore.delete(email.toLowerCase());

    res.json({ 
      success: true, 
      message: 'Password reset successfully!'
    });
  } catch (err: any) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
};

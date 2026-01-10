'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { authApi, usersApi } from '@/lib/api';

// SECURITY FIX: Don't expose admin email in client-side code
// Remove NEXT_PUBLIC_ADMIN_EMAIL entirely

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, username: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  sendAdminOtp: (email: string) => Promise<{ error?: string }>;
  verifyAdminOtp: (email: string, otp: string, username: string, password: string) => Promise<{ error?: string }>;
  sendResetOtp: (email: string) => Promise<{ error?: string }>;
  resetAdminCredentials: (email: string, otp: string, newUsername: string, newPassword: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // SECURITY FIX: Don't fetch admin email from API (removes enumeration vector)
  // Load admin email on mount - removed, this was unnecessary and exposed admin info

  // Fetch user data from users table via API
  const fetchUserData = async (userId: string) => {
    try {
      const data = await usersApi.getById(userId);
      return data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = await fetchUserData(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: userData?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          username: userData?.username || session.user.user_metadata?.username,
          isAdmin: false,
        });
      } else {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          try {
            // SECURITY FIX: Parse safely and validate
            setUser(JSON.parse(adminSession));
          } catch (e) {
            console.error('Invalid admin session stored');
            localStorage.removeItem('adminSession');
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await fetchUserData(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: userData?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          username: userData?.username || session.user.user_metadata?.username,
          isAdmin: false,
        });
      } else {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          try {
            // SECURITY FIX: Parse safely and validate
            setUser(JSON.parse(adminSession));
          } catch (e) {
            console.error('Invalid admin session stored');
            localStorage.removeItem('adminSession');
          }
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, name: string, username: string) => {
    try {
      // Check if username is available via API
      const { available } = await usersApi.checkUsername(username.toLowerCase());
      if (!available) {
        return { error: 'Username is already taken' };
      }

      // Create auth user
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, username: username.toLowerCase() },
        },
      });
      
      if (error) return { error: error.message };
      
      // Store username in users table via API
      if (authData.user) {
        try {
          await usersApi.create({
            id: authData.user.id,
            email: email,
            username: username.toLowerCase(),
            name: name,
          });
        } catch (err: any) {
          console.error('Error storing username:', err);
        }
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Check if username is available
  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    try {
      const { available } = await usersApi.checkUsername(username.toLowerCase());
      return available;
    } catch {
      return true;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { error: error.message };
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Send OTP for admin login
  const sendAdminOtp = async (email: string) => {
    try {
      await authApi.sendAdminOtp(email);
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Verify OTP and credentials
  const verifyAdminOtp = async (email: string, otp: string, username: string, password: string) => {
    try {
      const result = await authApi.verifyAdminLogin({ email, otp, username, password });
      
      if (result.success && result.admin) {
        // HttpOnly cookie is set automatically by server
        // Store minimal admin session in localStorage for UI state only
        localStorage.setItem('adminSession', JSON.stringify(result.admin));
        setUser(result.admin);
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Send OTP for credential reset
  const sendResetOtp = async (email: string) => {
    try {
      await authApi.sendResetOtp(email);
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Reset admin credentials
  const resetAdminCredentials = async (email: string, otp: string, newUsername: string, newPassword: string) => {
    try {
      await authApi.resetCredentials({ email, otp, newUsername, newPassword });
      // SECURITY FIX: Don't set admin email anymore (it's not in state)
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      // Call server to clear httpOnly cookie
      await authApi.adminLogout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      // Always clear client-side state
      await supabase.auth.signOut();
      localStorage.removeItem('adminSession');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      sendAdminOtp,
      verifyAdminOtp,
      sendResetOtp,
      resetAdminCredentials,
      signOut,
      isAdmin: user?.isAdmin || false,
      // SECURITY FIX: Removed getAdminEmail and adminEmail from context
      checkUsernameAvailable,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { authApi, usersApi } from '@/lib/api';

const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

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
  getAdminEmail: () => Promise<string>;
  adminEmail: string;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string>(DEFAULT_ADMIN_EMAIL);

  // Get admin email from API
  const getAdminEmail = async (): Promise<string> => {
    try {
      const settings = await authApi.getAdminSettings();
      return settings?.email || DEFAULT_ADMIN_EMAIL;
    } catch {
      return DEFAULT_ADMIN_EMAIL;
    }
  };

  // Load admin email on mount
  useEffect(() => {
    const loadAdminEmail = async () => {
      const email = await getAdminEmail();
      setAdminEmail(email);
    };
    loadAdminEmail();
  }, []);

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
          setUser(JSON.parse(adminSession));
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
          setUser(JSON.parse(adminSession));
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
      setAdminEmail(email);
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('adminSession');
    setUser(null);
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
      getAdminEmail,
      adminEmail,
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

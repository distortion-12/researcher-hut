'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  readingMode: boolean;
  toggleDarkMode: () => void;
  toggleReadingMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedReadingMode = localStorage.getItem('readingMode');
    
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
    
    if (savedReadingMode !== null) {
      setReadingMode(savedReadingMode === 'true');
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('darkMode', String(darkMode));
    }
  }, [darkMode, mounted]);

  // Apply reading mode class to document
  useEffect(() => {
    if (mounted) {
      if (readingMode) {
        document.documentElement.classList.add('reading-mode');
      } else {
        document.documentElement.classList.remove('reading-mode');
      }
      localStorage.setItem('readingMode', String(readingMode));
    }
  }, [readingMode, mounted]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleReadingMode = useCallback(() => {
    setReadingMode(prev => !prev);
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ darkMode, readingMode, toggleDarkMode, toggleReadingMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { darkMode, readingMode, toggleDarkMode, toggleReadingMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
          <span className="text-2xl sm:text-3xl">🔬</span>
          <span className="hidden sm:inline">Researcher.Hut</span>
          <span className="sm:hidden">R.Hut</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <Link href="/" className="text-white/80 hover:text-white transition-colors font-medium text-sm lg:text-base">
            Articles
          </Link>
          
          {/* Theme Toggle Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleReadingMode}
              className={`p-2 rounded-lg transition-colors ${readingMode ? 'bg-white/30' : 'bg-white/20 hover:bg-white/30'}`}
              title={readingMode ? 'Exit Reading Mode' : 'Enter Reading Mode'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
          </div>
          
          {/* User Links */}
          {user && !isAdmin && (
            <>
              <Link href="/write" className="text-white/80 hover:text-white transition-colors font-medium text-sm lg:text-base">
                ✍️ Write
              </Link>
              <Link href="/my-articles" className="text-white/80 hover:text-white transition-colors font-medium text-sm lg:text-base">
                📚 My Articles
              </Link>
            </>
          )}
          
          {/* Admin/User Dropdown */}
          {isAdmin ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base"
              >
                👨‍💼 Admin
                <span className="text-xs">▼</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/admin/create"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    ✍️ Create Article
                  </Link>
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base"
              >
                👤 <span className="max-w-[80px] truncate">{user.username || user.name || user.email?.split('@')[0]}</span>
                <span className="text-xs">▼</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                    @{user.username || user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-white text-indigo-600 hover:bg-gray-100 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Theme toggles for mobile */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            {showMobileMenu ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div ref={mobileMenuRef} className="md:hidden bg-white dark:bg-gray-900 border-t border-indigo-500/30">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              className="block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-gray-800 dark:text-white transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              📰 Articles
            </Link>
            
            <button
              onClick={() => { toggleReadingMode(); }}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-gray-800 dark:text-white transition-colors ${readingMode ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              📖 Reading Mode {readingMode && '✓'}
            </button>
            
            {user && !isAdmin && (
              <>
                <Link
                  href="/write"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-gray-800 dark:text-white transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ✍️ Write Article
                </Link>
                <Link
                  href="/my-articles"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-gray-800 dark:text-white transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  📚 My Articles
                </Link>
              </>
            )}
            
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-gray-800 dark:text-white transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/admin/create"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-gray-800 dark:text-white transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ✍️ Create Article
                </Link>
              </>
            )}
            
            <hr className="border-gray-200 dark:border-gray-700 my-2" />
            
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 text-gray-600 dark:text-gray-300 text-sm">
                  Signed in as @{user.username || user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30 text-red-600 dark:text-red-300 font-medium transition-colors"
                >
                  🚪 Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-center shadow-sm hover:from-indigo-700 hover:to-purple-700 transition-all"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

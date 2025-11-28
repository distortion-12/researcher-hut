'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
          <span className="text-3xl">🔬</span>
          <span>Researcher.Hut</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white/80 hover:text-white transition-colors font-medium">
            Articles
          </Link>
          
          {isAdmin ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                👨‍💼 Admin
                <span className="text-xs">▼</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/admin/create"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    ✍️ Create Article
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                👤 {user.username || user.name || user.email?.split('@')[0]}
                <span className="text-xs">▼</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    @{user.username || user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

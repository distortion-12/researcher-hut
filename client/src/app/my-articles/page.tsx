'use client';

import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MyArticles() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!user) return;
    try {
      const data = await postsApi.getUserPosts(user.id);
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Redirect if not logged in
  if (!user && !loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10 sm:py-16 md:py-20">
        <div className="card-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-float">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text mb-3 sm:mb-4">📚 My Articles</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">You need to sign in to view your articles.</p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm sm:text-base liquid-btn shadow-lg"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 glass rounded-xl w-1/3 shimmer"></div>
          <div className="h-32 glass rounded-2xl shimmer"></div>
          <div className="h-32 glass rounded-2xl shimmer"></div>
        </div>
      </div>
    );
  }

  const pendingPosts = posts.filter(p => !p.is_approved);
  const approvedPosts = posts.filter(p => p.is_approved);
  const publishedPosts = posts.filter(p => p.is_approved && p.is_published);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">📚 My Articles</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your submitted articles</p>
        </div>
        <Link
          href="/write"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base liquid-btn"
        >
          ✍️ Write New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center hover-float">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{posts.length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total</p>
        </div>
        <div className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center hover-float">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{publishedPosts.length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Published</p>
        </div>
        <div className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center hover-float">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingPosts.length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Under Review</p>
        </div>
      </div>

      {/* Articles List */}
      <div className="card-glass rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-white/5">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">Your Articles</h2>
        </div>
        
        {posts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm sm:text-base">You haven't written any articles yet.</p>
            <Link
              href="/write"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm sm:text-base"
            >
              Write your first article →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/20 dark:divide-white/10">
            {posts.map((post) => (
              <div key={post.id} className="p-4 sm:p-6 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{post.title}</h3>
                      {!post.is_approved ? (
                        <span className="glass px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700/50 whitespace-nowrap">
                          🔍 Under Review
                        </span>
                      ) : post.is_published ? (
                        <span className="glass px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/50 whitespace-nowrap">
                          ✓ Published
                        </span>
                      ) : (
                        <span className="glass px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700/50 whitespace-nowrap">
                          📝 Draft
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-2 flex flex-wrap items-center gap-1 sm:gap-0">
                      <span>📅 {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                      <span className="mx-1 sm:mx-2">•</span>
                      <span className="truncate max-w-[150px] sm:max-w-none">🔗 /{post.slug}</span>
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {post.is_approved && (
                      <>
                        <Link
                          href={`/${post.slug}`}
                          className="glass px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-all hover:shadow-md"
                          title="View"
                        >
                          👁️ <span className="hidden sm:inline">View</span>
                        </Link>
                        <Link
                          href={`/my-articles/edit/${post.id}`}
                          className="glass px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 rounded-lg transition-all hover:shadow-md"
                          title="Edit"
                        >
                          ✏️ <span className="hidden sm:inline">Edit</span>
                        </Link>
                      </>
                    )}
                    {!post.is_approved && (
                      <span className="glass px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 rounded-lg" title="Under Review">
                        🔍 <span className="hidden sm:inline">Under Review</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to Home */}
      <div className="mt-6 sm:mt-8 text-center">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm sm:text-base gradient-text">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

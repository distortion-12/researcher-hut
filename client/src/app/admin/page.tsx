'use client';

import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/types';
import AdminGuard from '@/components/AdminGuard';

function AdminDashboardContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const data = await postsApi.getAllAdmin();
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId: string, postTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`);
    
    if (!confirmed) return;

    setDeleting(postId);
    
    try {
      await postsApi.delete(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error: any) {
      alert('Error deleting post: ' + error.message);
    }
    
    setDeleting(null);
  };

  const togglePublish = async (postId: string, currentStatus: boolean) => {
    try {
      await postsApi.togglePublish(postId, !currentStatus);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, is_published: !currentStatus } : post
      ));
    } catch (error: any) {
      alert('Error updating post: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔐 Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your articles</p>
        </div>
        <Link
          href="/admin/create"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
        >
          ✍️ Write New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-indigo-600">{posts.length}</p>
          <p className="text-gray-500 text-sm">Total Articles</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-green-600">{posts.filter(p => p.is_published).length}</p>
          <p className="text-gray-500 text-sm">Published</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-yellow-600">{posts.filter(p => !p.is_published).length}</p>
          <p className="text-gray-500 text-sm">Drafts</p>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-700">All Articles</h2>
        </div>
        
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No articles yet. Start writing!</p>
            <Link
              href="/admin/create"
              className="text-indigo-600 hover:underline font-medium"
            >
              Create your first article →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        post.is_published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.is_published ? '✓ Published' : '📝 Draft'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">
                      📅 {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      <span className="mx-2">•</span>
                      🔗 /{post.slug}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${post.slug}`}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      👁️ View
                    </Link>
                    <Link
                      href={`/admin/edit/${post.id}`}
                      className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => togglePublish(post.id, post.is_published)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        post.is_published
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                      title={post.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {post.is_published ? '📥 Unpublish' : '📤 Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deleting === post.id}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === post.id ? '⏳' : '🗑️'} Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to Home */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-indigo-600 hover:underline font-medium">
          ← Back to Public Site
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

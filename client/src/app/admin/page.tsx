'use client';

import { useState, useEffect } from 'react';
import { postsApi, storiesApi } from '@/lib/api';
import Link from 'next/link';
import { Post } from '@/types';
import AdminGuard from '@/components/AdminGuard';

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  author_name: string;
  is_published: boolean;
  helpful_count: number;
  created_at: string;
}

function AdminDashboardContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [pendingStories, setPendingStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'stories' | 'pending-stories'>('all');

  const fetchData = async () => {
    try {
      const [allPosts, pendingPostsData, allStories] = await Promise.all([
        postsApi.getAllAdmin(),
        postsApi.getPending(),
        storiesApi.getAllAdmin()
      ]);
      setPosts(allPosts || []);
      setPendingPosts(pendingPostsData || []);
      setStories((allStories || []).filter((s: Story) => s.is_published));
      setPendingStories((allStories || []).filter((s: Story) => !s.is_published));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (postId: string, postTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`);
    
    if (!confirmed) return;

    setDeleting(postId);
    
    try {
      await postsApi.delete(postId);
      setPosts(posts.filter(post => post.id !== postId));
      setPendingPosts(pendingPosts.filter(post => post.id !== postId));
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

  const handleApprove = async (postId: string) => {
    setApproving(postId);
    try {
      await postsApi.approvePost(postId);
      // Move from pending to approved
      const approvedPost = pendingPosts.find(p => p.id === postId);
      if (approvedPost) {
        setPendingPosts(pendingPosts.filter(post => post.id !== postId));
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, is_approved: true, is_published: true } : post
        ));
      }
    } catch (error: any) {
      alert('Error approving post: ' + error.message);
    }
    setApproving(null);
  };

  const handleReject = async (postId: string, postTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to reject "${postTitle}"? This will delete the article.`);
    if (!confirmed) return;

    setDeleting(postId);
    try {
      await postsApi.rejectPost(postId);
      setPendingPosts(pendingPosts.filter(post => post.id !== postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error: any) {
      alert('Error rejecting post: ' + error.message);
    }
    setDeleting(null);
  };

  // Story handlers
  const handleApproveStory = async (storyId: string) => {
    setApproving(storyId);
    try {
      await storiesApi.approve(storyId);
      const approvedStory = pendingStories.find(s => s.id === storyId);
      if (approvedStory) {
        setPendingStories(pendingStories.filter(s => s.id !== storyId));
        setStories([...stories, { ...approvedStory, is_published: true }]);
      }
    } catch (error: any) {
      alert('Error approving story: ' + error.message);
    }
    setApproving(null);
  };

  const handleRejectStory = async (storyId: string, storyTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to reject "${storyTitle}"? This will delete the story.`);
    if (!confirmed) return;

    setDeleting(storyId);
    try {
      await storiesApi.reject(storyId);
      setPendingStories(pendingStories.filter(s => s.id !== storyId));
      setStories(stories.filter(s => s.id !== storyId));
    } catch (error: any) {
      alert('Error rejecting story: ' + error.message);
    }
    setDeleting(null);
  };

  const handleDeleteStory = async (storyId: string, storyTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${storyTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeleting(storyId);
    try {
      await storiesApi.delete(storyId);
      setStories(stories.filter(s => s.id !== storyId));
      setPendingStories(pendingStories.filter(s => s.id !== storyId));
    } catch (error: any) {
      alert('Error deleting story: ' + error.message);
    }
    setDeleting(null);
  };

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

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">🔐 Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your articles</p>
        </div>
        <Link
          href="/admin/create"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base liquid-btn"
        >
          ✍️ Write New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center hover-float">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">{posts.length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Articles</p>
        </div>
        <div className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center hover-float cursor-pointer" onClick={() => setActiveTab('pending')}>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingPosts.length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Pending Articles</p>
        </div>
        <div className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center hover-float cursor-pointer" onClick={() => setActiveTab('stories')}>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">{stories.length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Stories</p>
        </div>
        <div className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center cursor-pointer hover-float" onClick={() => setActiveTab('pending-stories')}>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-600 dark:text-pink-400">{pendingStories.length}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Pending Stories</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'all' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'glass text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
          }`}
        >
          📚 Articles
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'pending' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
              : 'glass text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
          }`}
        >
          ⏳ Pending
          {pendingPosts.length > 0 && (
            <span className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'pending' ? 'bg-white text-orange-600' : 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300'
            }`}>
              {pendingPosts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'stories' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
              : 'glass text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
          }`}
        >
          💜 Stories
        </button>
        <button
          onClick={() => setActiveTab('pending-stories')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap ${
            activeTab === 'pending-stories' 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' 
              : 'glass text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
          }`}
        >
          💜 Pending Stories
          {pendingStories.length > 0 && (
            <span className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'pending-stories' ? 'bg-white text-pink-600' : 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300'
            }`}>
              {pendingStories.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending Articles Section */}
      {activeTab === 'pending' && (
        <div className="card-glass rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 border border-orange-200/50 dark:border-orange-800/50">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-orange-200/50 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-900/20">
            <h2 className="font-semibold text-orange-700 dark:text-orange-300 text-sm sm:text-base">⏳ Pending User Submissions</h2>
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1">Review and approve articles submitted by users</p>
          </div>
          
          {pendingPosts.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No pending articles to review! 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-orange-100/50 dark:divide-orange-800/50">
              {pendingPosts.map((post) => (
                <div key={post.id} className="p-4 sm:p-6 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{post.title}</h3>
                        <span className="px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium bg-orange-100/80 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                          ⏳ Pending
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-2 flex flex-wrap gap-1">
                        <span>👤 By: {post.author || 'Unknown'}</span>
                        <span className="mx-1 sm:mx-2">•</span>
                        <span>📅 {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Link
                        href={`/${post.slug}`}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Preview"
                      >
                        👁️ <span className="hidden sm:inline">Preview</span>
                      </Link>
                      <button
                        onClick={() => handleApprove(post.id)}
                        disabled={approving === post.id}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
                        title="Approve"
                      >
                        {approving === post.id ? '⏳' : '✅'} <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(post.id, post.title)}
                        disabled={deleting === post.id}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
                        title="Reject"
                      >
                        {deleting === post.id ? '⏳' : '❌'} <span className="hidden sm:inline">Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Articles List */}
      {activeTab === 'all' && (
        <div className="card-glass rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base">All Articles</h2>
          </div>
          
          {posts.filter(p => p.is_approved).length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm sm:text-base">No articles yet. Start writing!</p>
              <Link
                href="/admin/create"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm sm:text-base"
              >
                Create your first article →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {posts.filter(p => p.is_approved).map((post) => (
                <div key={post.id} className="p-4 sm:p-6 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{post.title}</h3>
                        <span className={`px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium ${
                          post.is_published 
                            ? 'bg-green-100/80 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                            : 'bg-yellow-100/80 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {post.is_published ? '✓ Published' : '📝 Draft'}
                        </span>
                        {post.author && post.author !== 'Admin' && (
                          <span className="px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            👤 {post.author}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-2 flex flex-wrap gap-1">
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
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <Link
                        href={`/${post.slug}`}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 glass hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all"
                        title="View"
                      >
                        👁️ <span className="hidden sm:inline">View</span>
                      </Link>
                      <Link
                        href={`/admin/edit/${post.id}`}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 glass hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                        title="Edit"
                      >
                        ✏️ <span className="hidden sm:inline">Edit</span>
                      </Link>
                      <button
                        onClick={() => togglePublish(post.id, post.is_published)}
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl transition-all glass ${
                          post.is_published
                            ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/30'
                            : 'text-green-600 dark:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/30'
                        }`}
                        title={post.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {post.is_published ? '📥' : '📤'} <span className="hidden sm:inline">{post.is_published ? 'Unpublish' : 'Publish'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deleting === post.id}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 glass hover:bg-red-50/50 dark:hover:bg-red-900/30 rounded-xl transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === post.id ? '⏳' : '🗑️'} <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Stories Section */}
      {activeTab === 'pending-stories' && (
        <div className="card-glass rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 border border-pink-200/50 dark:border-pink-800/50">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-pink-200/50 dark:border-pink-800/50 bg-pink-50/50 dark:bg-pink-900/20">
            <h2 className="font-semibold text-pink-700 dark:text-pink-300 text-sm sm:text-base">💜 Pending Stories</h2>
            <p className="text-xs sm:text-sm text-pink-600 dark:text-pink-400 mt-1">Review user stories before publishing</p>
          </div>
          
          {pendingStories.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No pending stories to review! 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-pink-100/50 dark:divide-pink-800/50">
              {pendingStories.map((story) => (
                <div key={story.id} className="p-4 sm:p-6 hover:bg-pink-50/30 dark:hover:bg-pink-900/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{story.title}</h3>
                        <span className="px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium bg-pink-100/80 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
                          💜 Story
                        </span>
                        <span className="px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium bg-gray-100/80 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                          {story.category}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 line-clamp-2">{story.content.substring(0, 150)}...</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm flex flex-wrap gap-1">
                        <span>{story.is_anonymous ? '🙈 Anonymous' : `👤 ${story.author_name}`}</span>
                        <span className="mx-1 sm:mx-2">•</span>
                        <span>📅 {new Date(story.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Link
                        href={`/stories/${story.id}`}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        👁️ <span className="hidden sm:inline">Preview</span>
                      </Link>
                      <button
                        onClick={() => handleApproveStory(story.id)}
                        disabled={approving === story.id}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
                      >
                        {approving === story.id ? '⏳' : '✅'} <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectStory(story.id, story.title)}
                        disabled={deleting === story.id}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
                      >
                        {deleting === story.id ? '⏳' : '❌'} <span className="hidden sm:inline">Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Stories Section */}
      {activeTab === 'stories' && (
        <div className="card-glass rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 border border-purple-200/50 dark:border-purple-800/50">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-200/50 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-900/20">
            <h2 className="font-semibold text-purple-700 dark:text-purple-300 text-sm sm:text-base">💜 Published Stories</h2>
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 mt-1">Manage approved user stories</p>
          </div>
          
          {stories.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No published stories yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-purple-100/50 dark:divide-purple-800/50">
              {stories.map((story) => (
                <div key={story.id} className="p-4 sm:p-6 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{story.title}</h3>
                        <span className="px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium bg-green-100/80 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                          ✓ Published
                        </span>
                        <span className="px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium bg-gray-100/80 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                          {story.category}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm flex flex-wrap gap-1">
                        <span>{story.is_anonymous ? '🙈 Anonymous' : `👤 ${story.author_name}`}</span>
                        <span className="mx-1 sm:mx-2">•</span>
                        <span>💜 {story.helpful_count} helpful</span>
                        <span className="mx-1 sm:mx-2">•</span>
                        <span>📅 {new Date(story.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Link
                        href={`/stories/${story.id}`}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 glass hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all"
                      >
                        👁️ <span className="hidden sm:inline">View</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteStory(story.id, story.title)}
                        disabled={deleting === story.id}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 glass hover:bg-red-50/50 dark:hover:bg-red-900/30 rounded-xl transition-all disabled:opacity-50"
                      >
                        {deleting === story.id ? '⏳' : '🗑️'} <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Back to Home */}
      <div className="mt-6 sm:mt-8 text-center">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium text-sm sm:text-base transition-colors">
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

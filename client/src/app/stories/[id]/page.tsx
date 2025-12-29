'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { storiesApi } from '@/lib/api';

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  author_id: string;
  author_name: string;
  helpful_count: number;
  created_at: string;
}

interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  user_name: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  experience: { label: 'Life Experience', icon: '🌟' },
  trauma: { label: 'Trauma & Healing', icon: '💔' },
  journey: { label: 'Personal Journey', icon: '🚶' },
  recovery: { label: 'Recovery Story', icon: '🌱' },
  other: { label: 'Other', icon: '📝' },
};

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadStory();
    loadComments();
    if (user) {
      checkHelpful();
    }
  }, [storyId, user]);

  const loadStory = async () => {
    try {
      const data = await storiesApi.getById(storyId);
      setStory(data);
      setHelpfulCount(data.helpful_count || 0);
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await storiesApi.getComments(storyId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const checkHelpful = async () => {
    if (!user) return;
    try {
      const { helpful } = await storiesApi.checkHelpful(storyId, user.id);
      setIsHelpful(helpful);
    } catch (error) {
      console.error('Error checking helpful:', error);
    }
  };

  const handleToggleHelpful = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const { helpful } = await storiesApi.toggleHelpful(storyId, user.id);
      setIsHelpful(helpful);
      setHelpfulCount(prev => helpful ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling helpful:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await storiesApi.addComment(storyId, {
        user_id: user.id,
        user_name: user.name || user.email?.split('@')[0] || 'User',
        content: newComment.trim(),
        is_anonymous: isAnonymousComment,
      });
      setNewComment('');
      setIsAnonymousComment(false);
      await loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await storiesApi.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Story Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This story may have been removed or doesn't exist.
          </p>
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Browse Stories
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORIES[story.category] || CATEGORIES.other;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Stories
        </Link>

        {/* Story Card */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                <span>{categoryInfo.icon}</span>
                {categoryInfo.label}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(story.created_at)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {story.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                {story.is_anonymous ? '?' : story.author_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {story.author_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Shared their story
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="prose dark:prose-invert max-w-none">
              {story.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleToggleHelpful}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isHelpful
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                }`}
              >
                <span className="text-xl">{isHelpful ? '❣️' : '🤍'}</span>
                <span>{helpfulCount} found this helpful</span>
              </button>

              {user && story.author_id === user.id && (
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete your story?')) {
                      try {
                        await storiesApi.delete(storyId);
                        router.push('/stories');
                      } catch (error) {
                        console.error('Error deleting story:', error);
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Delete Story
                </button>
              )}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              💬 Supportive Comments ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share words of support or encouragement..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none mb-3"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymousComment}
                    onChange={(e) => setIsAnonymousComment(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Comment anonymously
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Login to leave a supportive comment
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Login
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {comments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">💭</div>
                <p className="text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to share support!
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-6 sm:p-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {comment.is_anonymous ? '?' : comment.user_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.is_anonymous ? 'Anonymous' : comment.user_name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                      {user && comment.user_id === user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="mt-2 text-sm text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { commentsApi } from '@/lib/api';
import { Comment } from '@/types';

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const data = await commentsApi.getByPostId(postId);
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const data = await commentsApi.create(postId, {
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        content: newComment.trim(),
      });

      setComments([data, ...comments]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await commentsApi.delete(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
      <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-4 sm:mb-6">
        💬 Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
          <div className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">{user.name}</span>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full p-2.5 sm:p-3 input-glass outline-none resize-none text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            />
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
            <div className="flex justify-end mt-2 sm:mt-3">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all text-sm sm:text-base liquid-btn shadow-lg"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="card-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center mb-6 sm:mb-8">
          <p className="text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 text-sm sm:text-base">Sign in to leave a comment</p>
          <a
            href="/login"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl font-medium hover:opacity-90 transition-all text-sm sm:text-base liquid-btn shadow-lg"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="h-20 sm:h-24 glass rounded-xl sm:rounded-2xl shimmer"></div>
          <div className="h-20 sm:h-24 glass rounded-xl sm:rounded-2xl shimmer"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="card-glass rounded-xl sm:rounded-2xl p-3 sm:p-4 hover-float">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 shadow">
                    {comment.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate block">{comment.user_name}</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                {user && (user.id === comment.user_id || user.isAdmin) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm flex-shrink-0 transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p className="mt-2 sm:mt-3 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

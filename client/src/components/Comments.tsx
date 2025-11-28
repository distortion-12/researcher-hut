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
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        💬 Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-700">{user.name}</span>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-8">
          <p className="text-gray-500 mb-3">Sign in to leave a comment</p>
          <a
            href="/login"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-100 rounded-xl"></div>
          <div className="h-24 bg-gray-100 rounded-xl"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                    {comment.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{comment.user_name}</span>
                    <p className="text-xs text-gray-400">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                {user && (user.id === comment.user_id || user.isAdmin) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p className="mt-3 text-gray-700 leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

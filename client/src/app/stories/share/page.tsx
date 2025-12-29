'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { storiesApi } from '@/lib/api';

const CATEGORIES = [
  { value: 'experience', label: 'Life Experience', icon: '🌟', description: 'General life experiences and learnings' },
  { value: 'trauma', label: 'Trauma & Healing', icon: '💔', description: 'Experiences with trauma and the healing process' },
  { value: 'journey', label: 'Personal Journey', icon: '🚶', description: 'Your personal growth and transformation' },
  { value: 'recovery', label: 'Recovery Story', icon: '🌱', description: 'Stories of recovery and overcoming challenges' },
  { value: 'other', label: 'Other', icon: '📝', description: 'Any other experience you want to share' },
];

export default function ShareStoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'experience',
    is_anonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.content.length < 50) {
      setError('Please write at least 50 characters to share your story');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await storiesApi.create({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        is_anonymous: formData.is_anonymous,
        author_id: user.id,
        author_name: user.name || user.email?.split('@')[0] || 'User',
      });

      // Show success message and redirect
      alert('✅ Your story has been submitted for review! It will appear once approved by an admin.');
      router.push('/stories');
    } catch (err: any) {
      setError(err.message || 'Failed to share story');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to share your story with the community.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Stories
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ✍️ Share Your Story
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your experience can help others feel less alone. Share at your own comfort level.
          </p>
        </div>

        {/* Safety Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💙</span>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Safe Space Guidelines
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Share only what you're comfortable with</li>
                <li>• You can post anonymously if you prefer</li>
                <li>• Be respectful and supportive of others</li>
                <li>• If you're in crisis, please seek professional help</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.category === category.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your story a title..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              maxLength={200}
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-right">
              {formData.title.length}/200
            </p>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your Story *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your experience... Take your time, there's no rush."
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-y"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-right">
              {formData.content.length} characters (minimum 50)
            </p>
          </div>

          {/* Anonymous Toggle */}
          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  formData.is_anonymous ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    formData.is_anonymous ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  Post Anonymously
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your name will be hidden and shown as "Anonymous"
                </p>
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <span>❣️</span>
                  Share Story
                </>
              )}
            </button>
            <Link
              href="/stories"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

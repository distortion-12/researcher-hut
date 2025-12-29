'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { storiesApi } from '@/lib/api';

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  author_name: string;
  helpful_count: number;
  created_at: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Stories', icon: '📖' },
  { value: 'experience', label: 'Life Experiences', icon: '🌟' },
  { value: 'trauma', label: 'Trauma & Healing', icon: '💔' },
  { value: 'journey', label: 'Personal Journeys', icon: '🚶' },
  { value: 'recovery', label: 'Recovery Stories', icon: '🌱' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadStories();
  }, [selectedCategory]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await storiesApi.getAll(selectedCategory);
      setStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              ❣️ Share Your Story
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              A safe space to share your experiences, connect with others, and find support. 
              Your story matters and can help others feel less alone.
            </p>
            {user ? (
              <Link
                href="/stories/share"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg"
              >
                <span>✍️</span>
                Share Your Story
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg"
              >
                <span>🔐</span>
                Login to Share
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No stories yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Be the first to share your story in this category!
            </p>
            {user && (
              <Link
                href="/stories/share"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <span>✍️</span>
                Share Your Story
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {stories.map((story) => {
              const categoryInfo = getCategoryInfo(story.category);
              return (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700"
                >
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        <span>{categoryInfo.icon}</span>
                        {categoryInfo.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(story.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                      {story.title}
                    </h3>

                    {/* Content Preview */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {truncateContent(story.content)}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                          {story.is_anonymous ? '?' : story.author_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {story.author_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-pink-500">
                        <span>❣️</span>
                        <span className="text-sm font-medium">{story.helpful_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Support Resources Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🤝</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Need Support?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                If you're going through a difficult time, remember that professional help is available. 
                You're not alone in this journey.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.nimh.nih.gov/health/find-help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  Find Help Resources →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

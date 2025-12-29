'use client';

import { useState, useEffect } from 'react';
import { postsApi, storiesApi } from '@/lib/api';
import { Post } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import StoryCard from '@/components/StoryCard';

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

async function getPosts() {
  try {
    const posts = await postsApi.getAll();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

async function getStories() {
  try {
    const stories = await storiesApi.getAll();
    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<'articles' | 'stories'>('articles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [postsData, storiesData] = await Promise.all([getPosts(), getStories()]);
      setPosts(postsData);
      setStories(storiesData);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <header className="text-center py-12 sm:py-16 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          Research & Insights
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Deep dives into psychology, human behavior, and the patterns that shape our lives.
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-12 px-4 sm:px-0">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'articles'
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span className="text-lg sm:text-xl">📚</span>
          <span className="text-sm sm:text-base">Articles</span>
          <span className="text-xs sm:text-sm font-normal text-opacity-80">({posts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'stories'
              ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span className="text-lg sm:text-xl">❣️</span>
          <span className="text-sm sm:text-base">Stories</span>
          <span className="text-xs sm:text-sm font-normal text-opacity-80">({stories.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-12 sm:py-16 md:py-20">
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">Loading...</p>
        </div>
      ) : activeTab === 'articles' ? (
        // Articles Tab
        posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {posts.map((post) => (
              <ArticleCard
                key={`article-${post.id}`}
                id={post.id}
                title={post.title}
                slug={post.slug}
                author={post.author}
                created_at={post.created_at}
              />
            ))}
          </div>
        )
      ) : (
        // Stories Tab
        stories.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No stories published yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {stories.map((story) => (
              <StoryCard
                key={`story-${story.id}`}
                id={story.id}
                title={story.title}
                content={story.content}
                category={story.category}
                author_name={story.author_name}
                is_anonymous={story.is_anonymous}
                helpful_count={story.helpful_count}
                created_at={story.created_at}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

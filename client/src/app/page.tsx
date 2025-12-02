import Link from 'next/link';
import { postsApi, storiesApi } from '@/lib/api';
import { Post } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import StoryCard from '@/components/StoryCard';

// This ensures the page refreshes content frequently
export const revalidate = 0;

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

export default async function Home() {
  const [posts, stories] = await Promise.all([getPosts(), getStories()]);

  // Combine and sort by date
  const feedItems = [
    ...posts.map((post: Post) => ({ ...post, type: 'article' as const })),
    ...stories.map((story: Story) => ({ ...story, type: 'story' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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

      {/* Feed Grid */}
      {feedItems.length === 0 ? (
        <div className="text-center py-12 sm:py-16 md:py-20">
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No content published yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {feedItems.map((item) => (
            item.type === 'article' ? (
              <ArticleCard
                key={`article-${item.id}`}
                id={item.id}
                title={item.title}
                slug={(item as Post).slug}
                author={(item as Post).author}
                created_at={item.created_at}
              />
            ) : (
              <StoryCard
                key={`story-${item.id}`}
                id={item.id}
                title={item.title}
                content={(item as Story).content}
                category={(item as Story).category}
                author_name={(item as Story).author_name}
                is_anonymous={(item as Story).is_anonymous}
                helpful_count={(item as Story).helpful_count}
                created_at={item.created_at}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { postsApi } from '@/lib/api';
import { Post } from '@/types';
import ArticleCard from '@/components/ArticleCard';

// This ensures the page refreshes content frequently
export const revalidate = 0;

async function getPosts() {
  try {
    const posts = await postsApi.getAll();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="text-center py-12 sm:py-16 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          Research & Insights
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Deep dives into psychology, human behavior, and the patterns that shape our lives.
        </p>
      </header>

      {/* Articles Grid */}
      {!posts || posts.length === 0 ? (
        <div className="text-center py-12 sm:py-16 md:py-20">
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No articles published yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {posts.map((post: Post) => (
            <ArticleCard
              key={post.id}
              id={post.id}
              title={post.title}
              slug={post.slug}
              author={post.author}
              created_at={post.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}

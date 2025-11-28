import Link from 'next/link';
import { postsApi } from '@/lib/api';
import { Post } from '@/types';

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
            <Link 
              key={post.id} 
              href={`/${post.slug}`}
              className="block group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-5 md:p-6 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 sm:mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    <span>📅</span>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform text-lg sm:text-xl flex-shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <header className="text-center py-16 bg-gradient-to-b from-indigo-50 to-white -mx-4 px-4 mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Research & Insights
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Deep dives into psychology, human behavior, and the patterns that shape our lives.
        </p>
      </header>

      {/* Articles Grid */}
      {!posts || posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No articles published yet.</p>
          <Link href="/admin/create" className="text-indigo-600 hover:underline mt-2 inline-block">
            Write your first article →
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 max-w-4xl mx-auto">
          {posts.map((post: Post) => (
            <Link 
              key={post.id} 
              href={`/${post.slug}`}
              className="block group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <span>📅</span>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform text-xl">
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

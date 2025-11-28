import { postsApi } from '@/lib/api';
import MarkdownView from '@/components/MarkdownView';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Comments from '@/components/Comments';
import Rating from '@/components/Rating';

export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

async function getPost(slug: string) {
  try {
    const post = await postsApi.getBySlug(slug);
    return post;
  } catch (error) {
    return null;
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 font-medium"
      >
        ← Back to Articles
      </Link>

      {/* Article Header */}
      <header className="mb-12 pb-8 border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-gray-500">
          <span className="flex items-center gap-2">
            <span>📅</span>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <span>🔬</span>
            researcher.hut
          </span>
        </div>
      </header>
      
      {/* Article Content */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <MarkdownView content={post.content} />
      </div>

      {/* Rating Section */}
      <div className="mt-8">
        <Rating postId={post.id} />
      </div>

      {/* Comments Section */}
      <Comments postId={post.id} />

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-500">Thanks for reading!</p>
        <Link 
          href="/" 
          className="text-indigo-600 hover:underline mt-2 inline-block"
        >
          ← Read more articles
        </Link>
      </footer>
    </article>
  );
}

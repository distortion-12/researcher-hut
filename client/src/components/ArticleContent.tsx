'use client';

import Link from 'next/link';
import MarkdownView from '@/components/MarkdownView';
import Comments from '@/components/Comments';
import Rating from '@/components/Rating';
import ReadingModeWrapper from '@/components/ReadingModeWrapper';
import DownloadButtons from '@/components/DownloadButtons';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface ArticleContentProps {
  post: Post;
}

export default function ArticleContent({ post }: ArticleContentProps) {
  return (
    <ReadingModeWrapper title={post.title}>
      <article className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 sm:gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 sm:mb-6 md:mb-8 font-medium text-sm sm:text-base bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg hover:shadow-md transition-all"
        >
          ← Back to Articles
        </Link>

        {/* Article Header */}
        <header className="mb-6 sm:mb-8 md:mb-12 pb-4 sm:pb-6 md:pb-8 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-600 dark:text-indigo-400 leading-tight mb-3 sm:mb-4 md:mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4">
            <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
              <span>📅</span>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
              <span>🔬</span>
              researcher.hut
            </span>
          </div>
          
          {/* Download Buttons */}
          <DownloadButtons 
            title={post.title} 
            content={post.content} 
            date={post.created_at} 
          />
        </header>
        
        {/* Article Content */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl p-4 sm:p-6 md:p-8">
          <MarkdownView content={post.content} />
        </div>

        {/* Rating Section */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <Rating postId={post.id} />
        </div>

        {/* Comments Section */}
        <Comments postId={post.id} />

        {/* Footer */}
        <footer className="mt-8 sm:mt-10 md:mt-12 pt-4 sm:pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Thanks for reading!</p>
          <Link 
            href="/" 
            className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block text-sm sm:text-base hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            ← Read more articles
          </Link>
        </footer>
      </article>
    </ReadingModeWrapper>
  );
}

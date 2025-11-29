'use client';

import Link from 'next/link';
import MarkdownView from '@/components/MarkdownView';
import Comments from '@/components/Comments';
import Rating from '@/components/Rating';
import ReadingModeWrapper from '@/components/ReadingModeWrapper';
import DownloadButtons from '@/components/DownloadButtons';
import ShareButton from '@/components/ShareButton';

interface Post {
  id: string;
  title: string;
  slug: string;
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
          <div className="flex flex-wrap items-center gap-3">
            <DownloadButtons 
              title={post.title} 
              content={post.content} 
              date={post.created_at} 
            />
            <ShareButton title={post.title} slug={post.slug} />
          </div>
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

        {/* Footer with Share */}
        <footer className="mt-8 sm:mt-10 md:mt-12 pt-4 sm:pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-2">Thanks for reading!</p>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium">
              Enjoyed this article? Share it with others!
            </p>
          </div>
          
          {/* Share Section */}
          <div className="flex justify-center mb-6">
            <ShareButton title={post.title} slug={post.slug} />
          </div>

          {/* Instagram Follow */}
          <div className="flex justify-center mb-6">
            <a
              href="https://www.instagram.com/research.hut?igsh=b2dzeW56MHM3bjBn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:scale-105 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow @research.hut
            </a>
          </div>
          
          <div className="text-center">
            <Link 
              href="/" 
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm sm:text-base hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              ← Read more articles
            </Link>
          </div>
        </footer>
      </article>
    </ReadingModeWrapper>
  );
}

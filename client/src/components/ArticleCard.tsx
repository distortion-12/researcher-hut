'use client';

import Link from 'next/link';
import ShareButtonSmall from './ShareButtonSmall';

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  created_at: string;
}

export default function ArticleCard({ id, title, slug, created_at }: ArticleCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-5 md:p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <Link href={`/${slug}`} className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 sm:mb-2 line-clamp-2">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
            <span>📅</span>
            {new Date(created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </Link>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ShareButtonSmall title={title} slug={slug} />
          <Link 
            href={`/${slug}`}
            className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform text-lg sm:text-xl"
          >
            →
          </Link>
        </div>
      </div>
    </div>
  );
}

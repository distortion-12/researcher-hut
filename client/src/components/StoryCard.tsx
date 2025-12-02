'use client';

import Link from 'next/link';

interface StoryCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  author_name: string;
  is_anonymous: boolean;
  helpful_count: number;
  created_at: string;
}

const CATEGORY_INFO: Record<string, { label: string; icon: string }> = {
  experience: { label: 'Life Experience', icon: '🌟' },
  trauma: { label: 'Trauma & Healing', icon: '💔' },
  journey: { label: 'Personal Journey', icon: '🚶' },
  recovery: { label: 'Recovery Story', icon: '🌱' },
  other: { label: 'Story', icon: '📝' },
};

export default function StoryCard({ 
  id, 
  title, 
  content, 
  category, 
  author_name, 
  is_anonymous, 
  helpful_count, 
  created_at 
}: StoryCardProps) {
  const categoryInfo = CATEGORY_INFO[category] || CATEGORY_INFO.other;
  const truncatedContent = content.length > 150 ? content.substring(0, 150) + '...' : content;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-5 md:p-6 border border-purple-100 dark:border-purple-900/30">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <Link href={`/stories/${id}`} className="flex-1 min-w-0">
          {/* Story Tag */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
              💜 Story
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
              {categoryInfo.icon} {categoryInfo.label}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2 line-clamp-2">
            {title}
          </h2>

          {/* Content Preview */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {truncatedContent}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              <span>📅</span>
              {new Date(created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              {is_anonymous ? (
                <>
                  <span>🙈</span>
                  Anonymous
                </>
              ) : (
                <>
                  <span>👤</span>
                  {author_name}
                </>
              )}
            </span>
            {helpful_count > 0 && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-pink-500">
                  <span>💜</span>
                  {helpful_count} helpful
                </span>
              </>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link 
            href={`/stories/${id}`}
            className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform text-lg sm:text-xl"
          >
            →
          </Link>
        </div>
      </div>
    </div>
  );
}

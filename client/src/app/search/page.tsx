'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { postsApi } from '@/lib/api';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await postsApi.search(query);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      }
      setLoading(false);
    };

    fetchResults();
    setSearchInput(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  // Function to highlight matching terms in text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let result = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      result = result.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>');
    });
    
    return result;
  };

  // Get a snippet from content around the matching text
  const getContentSnippet = (content: string, searchTerm: string) => {
    // Strip HTML tags for snippet
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    // Find first matching word position
    let matchIndex = -1;
    for (const word of words) {
      const idx = plainText.toLowerCase().indexOf(word);
      if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
        matchIndex = idx;
      }
    }

    if (matchIndex === -1) {
      // No match in content, return first 200 chars
      return plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '');
    }

    // Get snippet around match
    const start = Math.max(0, matchIndex - 80);
    const end = Math.min(plainText.length, matchIndex + 150);
    let snippet = plainText.slice(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < plainText.length) snippet = snippet + '...';
    
    return snippet;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 sm:gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 font-medium text-sm sm:text-base bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg"
        >
          ← Back to Articles
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          🔍 Search Articles
        </h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base sm:text-lg transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg text-sm sm:text-base"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Searching...</p>
        </div>
      ) : query ? (
        <>
          {/* Results Count */}
          <div className="mb-4 sm:mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {results.length === 0 ? (
                <>No articles found for &ldquo;<span className="font-semibold text-gray-900 dark:text-gray-100">{query}</span>&rdquo;</>
              ) : (
                <>Found <span className="font-semibold text-indigo-600 dark:text-indigo-400">{results.length}</span> article{results.length !== 1 ? 's' : ''} for &ldquo;<span className="font-semibold text-gray-900 dark:text-gray-100">{query}</span>&rdquo;</>
              )}
            </p>
          </div>

          {/* Results List */}
          {results.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {results.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/${post.slug}`}
                  className="block group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 
                        className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightText(post.title, query) }}
                      />
                      <p 
                        className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: highlightText(getContentSnippet(post.content, query), query) }}
                      />
                      <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
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
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">No matching articles found.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Try different keywords or check spelling.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-gray-600 dark:text-gray-400">Enter keywords to search for articles</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Search by title, topic, or any relevant keywords</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

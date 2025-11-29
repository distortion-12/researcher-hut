'use client';

import { useState } from 'react';
import { postsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});

export default function WriteArticle() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    authorCredit: '',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({ 
      ...formData, 
      title,
      slug: generateSlug(title)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to submit an article.');
      router.push('/login');
      return;
    }

    if (!formData.content || formData.content === '<p></p>') {
      alert('Please add some content to your article.');
      return;
    }
    
    setLoading(true);

    try {
      // Use custom author credit if provided, otherwise fallback to user info
      const authorName = formData.authorCredit.trim() || user.name || user.username || user.email;
      
      await postsApi.createUserPost({
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        author_id: user.id,
        author_name: authorName,
      });
      setSubmitted(true);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10 sm:py-16 md:py-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">✍️ Write an Article</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">You need to sign in to write and submit articles.</p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm sm:text-base shadow-lg"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10 sm:py-16 md:py-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎉</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Article Submitted!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
            Your article has been submitted for review. Once approved by an admin, 
            it will be published on the site.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm sm:text-base shadow-lg"
            >
              Back to Home
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ title: '', slug: '', content: '', authorCredit: '' });
              }}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm sm:text-base"
            >
              Write Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 sm:gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-2 sm:mb-4 font-medium text-sm sm:text-base bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
        >
          ← Back to Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">✍️ Write an Article</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
          Share your research and insights. Your article will be reviewed by an admin before publishing.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <p className="text-blue-800 dark:text-blue-300 text-xs sm:text-sm">
          <strong>📝 Note:</strong> Your article will be submitted for review. 
          Once approved by an admin, it will be visible to everyone on the site.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Title Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Title</label>
          <input
            type="text"
            required
            placeholder="e.g., The Psychology of Expectations"
            className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-base sm:text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={formData.title}
            onChange={handleTitleChange}
          />
        </div>

        {/* Slug Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL Slug</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">researcher.hut/</span>
            <input
              type="text"
              required
              placeholder="my-article-slug"
              className="flex-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base transition-all"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Auto-generated from title. You can customize it.</p>
        </div>

        {/* Author Credit (Optional) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Author Credit <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="@instagram_handle or Your Name"
            className="w-full p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm sm:text-base transition-all"
            value={formData.authorCredit}
            onChange={(e) => setFormData({ ...formData, authorCredit: e.target.value })}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Want credit for your work? Add your name or Instagram handle. This will be shown with your article.
          </p>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Content</label>
          <RichTextEditor 
            content={formData.content} 
            onChange={(content) => setFormData({ ...formData, content })} 
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Use the toolbar to format text: headings, bold, italic, colors, lists, links, and more.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg text-sm sm:text-base"
          >
            {loading ? '📤 Submitting...' : '📨 Submit for Review'}
          </button>
          <Link 
            href="/"
            className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-center sm:text-left text-sm sm:text-base transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

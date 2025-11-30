'use client';

import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
});

export default function EditUserPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!user) {
        setFetching(false);
        return;
      }
      try {
        const data = await postsApi.getById(postId);
        
        if (data) {
          // Check if user owns this post
          if (data.author_id !== user.id) {
            alert('You can only edit your own articles.');
            router.push('/my-articles');
            return;
          }
          // Check if post is still under review (can't edit during review)
          if (!data.is_approved) {
            alert('You cannot edit articles while they are under review.');
            router.push('/my-articles');
            return;
          }
          setFormData({
            title: data.title,
            slug: data.slug,
            content: data.content,
          });
        }
      } catch (error: any) {
        alert('Error fetching post: ' + error.message);
        router.push('/my-articles');
        return;
      }
      setFetching(false);
    };

    fetchPost();
  }, [postId, router, user]);

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
    
    if (!formData.content || formData.content === '<p></p>') {
      alert('Please add some content to your article.');
      return;
    }
    
    setLoading(true);

    try {
      await postsApi.update(postId, {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
      });
      alert('Article updated successfully!');
      router.push('/my-articles');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  // Redirect if not logged in
  if (!user && !fetching) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10 sm:py-16 md:py-20">
        <div className="card-glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-float">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text mb-3 sm:mb-4">✏️ Edit Article</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">You need to sign in to edit articles.</p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm sm:text-base liquid-btn shadow-lg"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="h-8 glass rounded-xl w-1/3 shimmer"></div>
          <div className="h-64 glass rounded-2xl shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link 
          href="/my-articles" 
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 font-medium glass px-4 py-2 rounded-lg"
        >
          ← Back to My Articles
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">✏️ Edit Article</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">Update your published article.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Title Input */}
        <div className="card-glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Title</label>
          <input
            type="text"
            required
            placeholder="e.g., The Psychology of Expectations"
            className="w-full p-3 sm:p-4 glass border border-white/20 dark:border-white/10 rounded-xl text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={formData.title}
            onChange={handleTitleChange}
          />
        </div>

        {/* Slug Input */}
        <div className="card-glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">researcher.hut/</span>
            <input
              type="text"
              required
              placeholder="my-article-slug"
              className="flex-1 p-3 glass border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="card-glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Content</label>
          <RichTextEditor 
            content={formData.content} 
            onChange={(content) => setFormData({ ...formData, content })} 
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg liquid-btn"
          >
            {loading ? '💾 Saving...' : '💾 Save Changes'}
          </button>
          <Link 
            href="/my-articles"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

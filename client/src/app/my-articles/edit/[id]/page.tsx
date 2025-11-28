'use client';

import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />,
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
          // Check if post is already approved (can't edit approved posts)
          if (data.is_approved) {
            alert('You cannot edit approved articles.');
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
      router.push('/my-articles');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  // Redirect if not logged in
  if (!user && !fetching) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">✏️ Edit Article</h1>
          <p className="text-gray-600 mb-6">You need to sign in to edit articles.</p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
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
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/my-articles" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
        >
          ← Back to My Articles
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Article</h1>
        <p className="text-gray-500 mt-2">Update your article before it gets approved.</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <strong>📝 Note:</strong> You can only edit articles that are pending approval. 
          Once approved, articles cannot be edited.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Article Title</label>
          <input
            type="text"
            required
            placeholder="e.g., The Psychology of Expectations"
            className="w-full p-4 border border-gray-200 rounded-lg text-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={formData.title}
            onChange={handleTitleChange}
          />
        </div>

        {/* Slug Input */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">researcher.hut/</span>
            <input
              type="text"
              required
              placeholder="my-article-slug"
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Article Content</label>
          <RichTextEditor 
            content={formData.content} 
            onChange={(content) => setFormData({ ...formData, content })} 
          />
          <p className="text-xs text-gray-400 mt-2">
            Use the toolbar to format text: headings, bold, italic, colors, lists, links, and more.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? '💾 Saving...' : '💾 Save Changes'}
          </button>
          <Link 
            href="/my-articles"
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

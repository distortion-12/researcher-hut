'use client';

import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminGuard from '@/components/AdminGuard';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />,
});

function EditPostContent() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    is_published: true,
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postsApi.getById(postId);
        
        if (data) {
          setFormData({
            title: data.title,
            slug: data.slug,
            content: data.content,
            is_published: data.is_published,
          });
        }
      } catch (error: any) {
        alert('Error fetching post: ' + error.message);
        router.push('/admin');
        return;
      }
      setFetching(false);
    };

    fetchPost();
  }, [postId, router]);

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
        is_published: formData.is_published,
      });
      router.push('/admin');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/3 animate-pulse"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 font-medium bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">✏️ Edit Article</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Update your article content and settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Title</label>
          <input
            type="text"
            required
            placeholder="e.g., The Psychology of Expectations"
            className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xl font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={formData.title}
            onChange={handleTitleChange}
          />
        </div>

        {/* Slug Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 dark:text-gray-500">researcher.hut/</span>
            <input
              type="text"
              required
              placeholder="my-article-slug"
              className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
        </div>

        {/* Publish Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Published</span>
            <span className="text-gray-400 dark:text-gray-500 text-sm">
              {formData.is_published ? '(Visible to readers)' : '(Draft - hidden from readers)'}
            </span>
          </label>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Content</label>
          <RichTextEditor 
            content={formData.content} 
            onChange={(content) => setFormData({ ...formData, content })} 
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? '💾 Saving...' : '💾 Save Changes'}
          </button>
          <Link 
            href="/admin"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function EditPost() {
  return (
    <AdminGuard>
      <EditPostContent />
    </AdminGuard>
  );
}

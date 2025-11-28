'use client';

import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminGuard from '@/components/AdminGuard';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />,
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
          href="/admin" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Article</h1>
        <p className="text-gray-500 mt-2">Update your article content and settings.</p>
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

        {/* Publish Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="font-semibold text-gray-700">Published</span>
            <span className="text-gray-400 text-sm">
              {formData.is_published ? '(Visible to readers)' : '(Draft - hidden from readers)'}
            </span>
          </label>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Article Content</label>
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? '💾 Saving...' : '💾 Save Changes'}
          </button>
          <Link 
            href="/admin"
            className="text-gray-500 hover:text-gray-700 font-medium"
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

'use client';

import { useState } from 'react';
import { postsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminGuard from '@/components/AdminGuard';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />,
});

function CreatePostContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
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
    
    if (!formData.content || formData.content === '<p></p>') {
      alert('Please add some content to your article.');
      return;
    }
    
    setLoading(true);

    try {
      await postsApi.create({
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        is_published: true,
      });
      router.push('/');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">✍️ Write New Article</h1>
        <p className="text-gray-500 mt-2">Use the rich text editor to format your content.</p>
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
          <p className="text-xs text-gray-400 mt-2">Auto-generated from title. You can customize it.</p>
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
            {loading ? '📤 Publishing...' : '🚀 Publish Article'}
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

export default function CreatePost() {
  return (
    <AdminGuard>
      <CreatePostContent />
    </AdminGuard>
  );
}

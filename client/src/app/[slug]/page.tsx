import { postsApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import ArticleContent from '@/components/ArticleContent';

export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

async function getPost(slug: string) {
  try {
    const post = await postsApi.getBySlug(slug);
    return post;
  } catch (error) {
    return null;
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <ArticleContent post={post} />;
}

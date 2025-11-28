'use client';

export default function MarkdownView({ content }: { content: string }) {
  // Check if content is HTML (from rich text editor) or Markdown
  const isHTML = content.startsWith('<');
  
  if (isHTML) {
    return (
      <article 
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 prose-a:text-indigo-600 hover:prose-a:text-indigo-800"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Fallback for Markdown content (legacy)
  const ReactMarkdown = require('react-markdown').default;
  return (
    <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 prose-a:text-indigo-600 hover:prose-a:text-indigo-800">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}

'use client';

import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  slug: string;
}

export default function ShareButton({ title, slug }: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${slug}` 
    : `https://researcher-hut.onrender.com/${slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              url: shareUrl,
            });
          } catch (err) {
            console.log('Share cancelled');
          }
        }
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowOptions(false)}
          />
          
          {/* Share Options Popup */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Share this article
            </div>
            
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
            >
              <span className="text-lg">🔗</span>
              <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
              {copied && <span className="ml-auto text-green-500">✓</span>}
            </button>

            <hr className="my-1 border-gray-200 dark:border-gray-700" />

            {/* Native Share (if supported) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={() => handleShare('native')}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
              >
                <span className="text-lg">📤</span>
                <span className="text-sm font-medium">Share via...</span>
              </button>
            )}

            {/* Twitter/X */}
            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
            >
              <span className="text-lg">𝕏</span>
              <span className="text-sm font-medium">Twitter / X</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleShare('facebook')}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
            >
              <span className="text-lg">📘</span>
              <span className="text-sm font-medium">Facebook</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleShare('linkedin')}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
            >
              <span className="text-lg">💼</span>
              <span className="text-sm font-medium">LinkedIn</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-medium">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => handleShare('telegram')}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
            >
              <span className="text-lg">✈️</span>
              <span className="text-sm font-medium">Telegram</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

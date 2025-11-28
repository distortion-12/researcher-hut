'use client';

import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState, useRef, useCallback } from 'react';

interface ReadingModeWrapperProps {
  children: React.ReactNode;
  title: string;
}

export default function ReadingModeWrapper({ children, title }: ReadingModeWrapperProps) {
  const { readingMode, toggleReadingMode, darkMode, toggleDarkMode } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [showHighlightTooltip, setShowHighlightTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Enter fullscreen when reading mode is activated
  useEffect(() => {
    if (readingMode && !isFullscreen) {
      enterFullscreen();
    }
  }, [readingMode]);

  // Exit reading mode when exiting fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen && readingMode) {
        toggleReadingMode();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [readingMode, toggleReadingMode]);

  // Load saved highlights from localStorage
  useEffect(() => {
    const savedHighlights = localStorage.getItem(`highlights-${title}`);
    if (savedHighlights) {
      setHighlights(JSON.parse(savedHighlights));
    }
  }, [title]);

  // Apply saved highlights to content
  useEffect(() => {
    if (contentRef.current && highlights.length > 0) {
      applyHighlights();
    }
  }, [highlights, readingMode]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.log('Fullscreen not supported');
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
      if (readingMode) {
        toggleReadingMode();
      }
    } catch (err) {
      console.log('Error exiting fullscreen');
    }
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0 && readingMode) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowHighlightTooltip(true);
      }
    } else {
      setShowHighlightTooltip(false);
    }
  }, [readingMode]);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
    };
  }, [handleTextSelection]);

  const addHighlight = () => {
    if (selectedText && !highlights.includes(selectedText)) {
      const newHighlights = [...highlights, selectedText];
      setHighlights(newHighlights);
      localStorage.setItem(`highlights-${title}`, JSON.stringify(newHighlights));
    }
    setShowHighlightTooltip(false);
    window.getSelection()?.removeAllRanges();
  };

  const removeHighlight = (text: string) => {
    const newHighlights = highlights.filter(h => h !== text);
    setHighlights(newHighlights);
    localStorage.setItem(`highlights-${title}`, JSON.stringify(newHighlights));
  };

  const clearAllHighlights = () => {
    setHighlights([]);
    localStorage.removeItem(`highlights-${title}`);
  };

  const applyHighlights = () => {
    // Re-apply highlights by traversing text nodes
    // This is a visual effect only
  };

  // Render highlighted content
  const renderContent = () => {
    if (!readingMode) return children;

    return (
      <div 
        ref={contentRef}
        className="reading-content"
        style={{
          // Apply highlight styles via CSS
        }}
      >
        {children}
      </div>
    );
  };

  if (!readingMode) {
    return <>{children}</>;
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-auto ${darkMode ? 'bg-gray-900' : 'bg-amber-50'}`}>
      {/* Reading Mode Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-amber-200'} px-4 py-3`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className={`font-serif text-lg font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            📖 Reading Mode
          </h2>
          
          <div className="flex items-center gap-2">
            {/* Highlights Panel Toggle */}
            {highlights.length > 0 && (
              <div className="relative group">
                <button
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                  title={`${highlights.length} highlights`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                
                {/* Highlights Dropdown */}
                <div className={`absolute right-0 top-full mt-2 w-72 max-h-64 overflow-auto rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all`}>
                  <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Your Highlights</span>
                    <button
                      onClick={clearAllHighlights}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="p-2">
                    {highlights.map((text, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded mb-1 flex items-start gap-2 ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}
                      >
                        <span className={`flex-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          "{text.length > 50 ? text.substring(0, 50) + '...' : text}"
                        </span>
                        <button
                          onClick={() => removeHighlight(text)}
                          className="text-red-400 hover:text-red-500 flex-shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Exit Reading Mode */}
            <button
              onClick={exitFullscreen}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${darkMode ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            >
              Exit Reading Mode
            </button>
          </div>
        </div>
      </div>

      {/* Reading Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div 
          ref={contentRef}
          className={`
            reading-mode-content
            font-serif text-xl leading-relaxed
            ${darkMode ? 'text-gray-200' : 'text-gray-800'}
            selection:bg-yellow-300 selection:text-gray-900
          `}
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
          }}
        >
          {children}
        </div>
      </div>

      {/* Highlight Tooltip */}
      {showHighlightTooltip && (
        <div
          className={`fixed z-50 transform -translate-x-1/2 -translate-y-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-3 py-2`}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <button
            onClick={addHighlight}
            className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-yellow-300 hover:text-yellow-200' : 'text-yellow-600 hover:text-yellow-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Highlight
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm ${darkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-white/80 text-gray-500'} backdrop-blur-sm`}>
        💡 Select text to highlight
      </div>

      {/* Custom styles for highlights */}
      <style jsx global>{`
        .reading-mode-content mark,
        .reading-mode-content .highlight {
          background-color: ${darkMode ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.5)'};
          padding: 0.1em 0.2em;
          border-radius: 0.2em;
        }
        
        .reading-mode-content ::selection {
          background-color: rgba(250, 204, 21, 0.5);
          color: #1f2937;
        }
        
        .reading-mode-content p {
          margin-bottom: 1.5em;
          line-height: 1.9;
        }
        
        .reading-mode-content h1,
        .reading-mode-content h2,
        .reading-mode-content h3 {
          margin-top: 2em;
          margin-bottom: 1em;
          font-weight: 600;
        }
        
        .reading-mode-content h2 {
          font-size: 1.75rem;
        }
        
        .reading-mode-content h3 {
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
}

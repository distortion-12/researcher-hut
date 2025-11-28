'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { useCallback, useState, useEffect } from 'react';
import { Extension } from '@tiptap/core';

// Custom extension for font size
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    } as any;
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Word-like color palette
const colorPalette = [
  ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#ffffff'],
  ['#003366', '#0066cc', '#0099ff', '#33ccff', '#66e0ff', '#99ebff', '#ccf5ff', '#e6faff', '#f0fcff', '#f5feff'],
  ['#660000', '#990000', '#cc0000', '#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc', '#ffe6e6', '#fff5f5'],
  ['#003300', '#006600', '#009900', '#00cc00', '#33ff33', '#66ff66', '#99ff99', '#ccffcc', '#e6ffe6', '#f5fff5'],
  ['#663300', '#996600', '#cc9900', '#ffcc00', '#ffff00', '#ffff66', '#ffff99', '#ffffcc', '#ffffe6', '#fffff5'],
  ['#330066', '#660099', '#9900cc', '#cc00ff', '#cc66ff', '#cc99ff', '#ccccff', '#e6e6ff', '#f0f0ff', '#f5f5ff'],
];

const highlightColors = [
  { name: 'Yellow', color: '#fef08a' },
  { name: 'Green', color: '#bbf7d0' },
  { name: 'Cyan', color: '#a5f3fc' },
  { name: 'Pink', color: '#fbcfe8' },
  { name: 'Orange', color: '#fed7aa' },
  { name: 'Purple', color: '#ddd6fe' },
];

const fontSizes = [
  { label: '8', value: '8px' },
  { label: '9', value: '9px' },
  { label: '10', value: '10px' },
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '36', value: '36px' },
  { label: '48', value: '48px' },
  { label: '72', value: '72px' },
];

const ColorPicker = ({ editor, type }: { editor: any; type: 'text' | 'highlight' }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (type === 'highlight') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1 ${editor.isActive('highlight') ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}
          title="Highlight Color"
        >
          <span className="w-4 h-4 bg-yellow-200 border border-gray-300 dark:border-gray-600 rounded"></span>
          <span className="text-xs dark:text-gray-300">▼</span>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 z-50">
            <div className="flex gap-1 mb-2">
              {highlightColors.map((h) => (
                <button
                  key={h.color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: h.color }).run();
                    setIsOpen(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: h.color }}
                  title={h.name}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setIsOpen(false);
              }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Remove highlight
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1"
        title="Text Color"
      >
        <span className="font-bold text-sm dark:text-gray-200">A</span>
        <span 
          className="w-4 h-1 rounded"
          style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
        ></span>
        <span className="text-xs dark:text-gray-300">▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 z-50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Theme Colors</p>
          <div className="space-y-1">
            {colorPalette.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setIsOpen(false);
                    }}
                    className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              Custom:
              <input
                type="color"
                onChange={(e) => {
                  editor.chain().focus().setColor(e.target.value).run();
                  setIsOpen(false);
                }}
                className="w-6 h-6 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuBar = ({ editor }: { editor: any }) => {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
      {/* Top Row - Font controls */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 sm:p-2 border-b border-gray-100 dark:border-gray-700">
        {/* Font Size Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              (editor.commands as any).setFontSize(e.target.value);
            }
          }}
          className="px-1.5 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
          title="Font Size"
        >
          <option value="">Size</option>
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        {/* Heading Dropdown */}
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: parseInt(value) as 1 | 2 | 3 }).run();
            }
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' : 'p'
          }
          className="px-1.5 sm:px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
          title="Text Style"
        >
          <option value="p">Normal</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>

        <div className="w-px h-5 sm:h-6 bg-gray-300 dark:bg-gray-600 mx-0.5 sm:mx-1 hidden sm:block"></div>

        {/* Increase/Decrease Font Size */}
        <button
          type="button"
          onClick={() => {
            const currentSize = editor.getAttributes('textStyle').fontSize;
            const current = parseInt(currentSize) || 16;
            (editor.commands as any).setFontSize(`${Math.max(8, current - 2)}px`);
          }}
          className="p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 hidden sm:block"
          title="Decrease Font Size"
        >
          <span className="text-xs font-bold">A</span>↓
        </button>
        <button
          type="button"
          onClick={() => {
            const currentSize = editor.getAttributes('textStyle').fontSize;
            const current = parseInt(currentSize) || 16;
            (editor.commands as any).setFontSize(`${Math.min(72, current + 2)}px`);
          }}
          className="p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 hidden sm:block"
          title="Increase Font Size"
        >
          <span className="text-lg font-bold">A</span>↑
        </button>
      </div>

      {/* Bottom Row - Formatting */}
      <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2">
        {/* Text Style Group */}
        <div className="flex items-center gap-0.5 sm:gap-1 border-r border-gray-300 dark:border-gray-600 pr-1 sm:pr-2 mr-0.5 sm:mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-sm ${editor.isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 italic text-sm ${editor.isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 underline text-sm ${editor.isActive('underline') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Underline (Ctrl+U)"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 line-through text-sm hidden sm:block ${editor.isActive('strike') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Strikethrough"
          >
            S
          </button>
        </div>

        {/* Color Group */}
        <div className="flex items-center gap-0.5 sm:gap-1 border-r border-gray-300 dark:border-gray-600 pr-1 sm:pr-2 mr-0.5 sm:mr-1">
          <ColorPicker editor={editor} type="text" />
          <ColorPicker editor={editor} type="highlight" />
        </div>

        {/* Alignment Group - Hidden on small screens */}
        <div className="hidden sm:flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Align Left"
          >
            ☰
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Align Center"
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Align Right"
          >
            ☰
          </button>
        </div>

        {/* Lists Group */}
        <div className="flex items-center gap-0.5 sm:gap-1 border-r border-gray-300 dark:border-gray-600 pr-1 sm:pr-2 mr-0.5 sm:mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm ${editor.isActive('bulletList') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Bullet List"
          >
            • ≡
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm ${editor.isActive('orderedList') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'dark:text-gray-200'}`}
            title="Numbered List"
          >
            1. ≡
          </button>
        </div>

        {/* Link & Quote Group */}
        <div className="flex items-center gap-0.5 sm:gap-1 border-r border-gray-300 dark:border-gray-600 pr-1 sm:pr-2 mr-0.5 sm:mr-1">
          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm ${editor.isActive('link') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
            title="Insert Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm hidden sm:block ${editor.isActive('blockquote') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : ''}`}
            title="Quote"
          >
            ❝
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200"
            title="Horizontal Line"
          >
            ―
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200 disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            ↪
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-4 min-h-[400px] focus:outline-none dark:prose-invert dark:text-gray-100',
      },
      handlePaste: (view, event, slice) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const text = clipboardData.getData('text/plain');
        const html = clipboardData.getData('text/html');

        // If plain text with patterns, auto-format it
        if (text && !html) {
          const lines = text.split('\n');
          let formattedHtml = '';

          lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) {
              formattedHtml += '<p><br></p>';
              return;
            }

            // Main title detection
            if (/^[A-Z][a-z]+$/.test(trimmed) && trimmed.length < 30) {
              formattedHtml += `<h1>${trimmed}</h1>`;
              return;
            }

            // Numbered sections: "1. Something" -> H2
            if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
              formattedHtml += `<h2>${trimmed}</h2>`;
              return;
            }

            // Sub-sections with keywords -> H3
            if (/^[A-Z][a-z]+\s+(reasons?|types?|patterns?|examples?|Nature|Angle|Signs?|Scale|Theories?|Facts?|Questions?|Ways?|Summary)[:.]?\s*/i.test(trimmed)) {
              formattedHtml += `<h3>${trimmed}</h3>`;
              return;
            }

            // Bullet points
            if (/^[-•]\s+/.test(trimmed)) {
              formattedHtml += `<li>${trimmed.replace(/^[-•]\s+/, '')}</li>`;
              return;
            }

            // Regular paragraph
            formattedHtml += `<p>${trimmed}</p>`;
          });

          // Wrap consecutive li elements in ul
          formattedHtml = formattedHtml.replace(/(<li>.*?<\/li>)+/g, (match) => `<ul>${match}</ul>`);

          // Insert formatted HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(formattedHtml, 'text/html');
          
          editor?.commands.insertContent(doc.body.innerHTML);
          return true;
        }

        return false;
      },
    },
  });

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.color-picker-container')) {
        // Close pickers
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="min-h-[400px] bg-white dark:bg-gray-800" />
      <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>💡 Tip: Paste your text and it will auto-format headings and lists</span>
        <span>Word count: {editor?.storage.characterCount?.words?.() || 0}</span>
      </div>
    </div>
  );
}

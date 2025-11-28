'use client';

import { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface DownloadButtonsProps {
  title: string;
  content: string;
  date: string;
}

export default function DownloadButtons({ title, content, date }: DownloadButtonsProps) {
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);

  // Convert HTML to plain text with basic formatting info
  const htmlToText = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Parse HTML and extract structured content
  const parseHtmlContent = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const elements: { type: string; text: string; level?: number }[] = [];

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          elements.push({ type: 'text', text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();

        if (tagName === 'h1') {
          elements.push({ type: 'heading', text: el.textContent || '', level: 1 });
        } else if (tagName === 'h2') {
          elements.push({ type: 'heading', text: el.textContent || '', level: 2 });
        } else if (tagName === 'h3') {
          elements.push({ type: 'heading', text: el.textContent || '', level: 3 });
        } else if (tagName === 'p') {
          elements.push({ type: 'paragraph', text: el.textContent || '' });
        } else if (tagName === 'li') {
          elements.push({ type: 'listItem', text: el.textContent || '' });
        } else if (tagName === 'blockquote') {
          elements.push({ type: 'quote', text: el.textContent || '' });
        } else if (tagName === 'br') {
          elements.push({ type: 'break', text: '' });
        } else {
          // Process children for other elements
          el.childNodes.forEach(processNode);
        }
      }
    };

    div.childNodes.forEach(processNode);
    return elements;
  };

  // Download as PDF
  const downloadPDF = async () => {
    setDownloading('pdf');
    
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create a styled container for PDF
      const container = document.createElement('div');
      container.style.fontFamily = 'Georgia, serif';
      container.style.padding = '40px';
      container.style.maxWidth = '800px';
      container.style.margin = '0 auto';
      container.style.color = '#1a1a1a';
      
      // Add title
      const titleEl = document.createElement('h1');
      titleEl.textContent = title;
      titleEl.style.fontSize = '28px';
      titleEl.style.fontWeight = 'bold';
      titleEl.style.color = '#4f46e5';
      titleEl.style.marginBottom = '10px';
      titleEl.style.lineHeight = '1.3';
      container.appendChild(titleEl);

      // Add date
      const dateEl = document.createElement('p');
      dateEl.textContent = `Published: ${new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
      dateEl.style.color = '#6b7280';
      dateEl.style.fontSize = '14px';
      dateEl.style.marginBottom = '30px';
      dateEl.style.paddingBottom = '20px';
      dateEl.style.borderBottom = '1px solid #e5e7eb';
      container.appendChild(dateEl);

      // Add content
      const contentEl = document.createElement('div');
      contentEl.innerHTML = content;
      contentEl.style.fontSize = '16px';
      contentEl.style.lineHeight = '1.8';
      
      // Style headings in content
      contentEl.querySelectorAll('h1, h2, h3').forEach((h) => {
        (h as HTMLElement).style.color = '#1f2937';
        (h as HTMLElement).style.marginTop = '24px';
        (h as HTMLElement).style.marginBottom = '12px';
      });
      
      contentEl.querySelectorAll('p').forEach((p) => {
        (p as HTMLElement).style.marginBottom = '16px';
      });
      
      contentEl.querySelectorAll('blockquote').forEach((bq) => {
        (bq as HTMLElement).style.borderLeft = '4px solid #4f46e5';
        (bq as HTMLElement).style.paddingLeft = '16px';
        (bq as HTMLElement).style.fontStyle = 'italic';
        (bq as HTMLElement).style.color = '#6b7280';
      });
      
      container.appendChild(contentEl);

      // Add footer
      const footer = document.createElement('div');
      footer.style.marginTop = '40px';
      footer.style.paddingTop = '20px';
      footer.style.borderTop = '1px solid #e5e7eb';
      footer.style.fontSize = '12px';
      footer.style.color = '#9ca3af';
      footer.style.textAlign = 'center';
      footer.textContent = '🔬 researcher.hut — Research & Insights';
      container.appendChild(footer);

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Error generating PDF. Please try again.');
    }
    
    setDownloading(null);
  };

  // Download as DOCX
  const downloadDOCX = async () => {
    setDownloading('docx');
    
    try {
      const elements = parseHtmlContent(content);
      const children: Paragraph[] = [];

      // Add title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 56, // 28pt
              color: '4f46e5',
            }),
          ],
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
        })
      );

      // Add date
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Published: ${new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}`,
              size: 24,
              color: '6b7280',
            }),
          ],
          spacing: { after: 400 },
          border: {
            bottom: { color: 'e5e7eb', size: 1, style: 'single' },
          },
        })
      );

      // Add content paragraphs
      elements.forEach((el) => {
        if (el.type === 'heading' && el.level === 1) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: el.text, bold: true, size: 48 })],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            })
          );
        } else if (el.type === 'heading' && el.level === 2) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: el.text, bold: true, size: 40 })],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
            })
          );
        } else if (el.type === 'heading' && el.level === 3) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: el.text, bold: true, size: 32 })],
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            })
          );
        } else if (el.type === 'paragraph' && el.text.trim()) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: el.text, size: 24 })],
              spacing: { after: 200 },
            })
          );
        } else if (el.type === 'listItem') {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${el.text}`, size: 24 })],
              spacing: { after: 100 },
              indent: { left: 720 },
            })
          );
        } else if (el.type === 'quote') {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: el.text, italics: true, size: 24, color: '6b7280' }),
              ],
              spacing: { after: 200 },
              indent: { left: 720 },
              border: {
                left: { color: '4f46e5', size: 24, style: 'single' },
              },
            })
          );
        }
      });

      // Add footer
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '🔬 researcher.hut — Research & Insights',
              size: 20,
              color: '9ca3af',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          border: {
            top: { color: 'e5e7eb', size: 1, style: 'single' },
          },
        })
      );

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.docx`);
    } catch (error) {
      console.error('DOCX download error:', error);
      alert('Error generating DOCX. Please try again.');
    }
    
    setDownloading(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Download:</span>
      
      {/* PDF Button */}
      <button
        onClick={downloadPDF}
        disabled={downloading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition-all border border-red-200 dark:border-red-800"
        title="Download as PDF"
      >
        {downloading === 'pdf' ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="hidden sm:inline">Generating...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>PDF</span>
          </>
        )}
      </button>

      {/* DOCX Button */}
      <button
        onClick={downloadDOCX}
        disabled={downloading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-all border border-blue-200 dark:border-blue-800"
        title="Download as Word Document"
      >
        {downloading === 'docx' ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="hidden sm:inline">Generating...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>DOCX</span>
          </>
        )}
      </button>
    </div>
  );
}

// src/components/public/chapter-viewer.tsx
import { useState } from 'react';
import { Chapter } from '@/types/chapters';
import { ReadingControls } from './reading-controls';
import { ProgressTracker } from './progress-tracker';

export const ChapterViewer: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  
  return (
    <article className="chapter-content bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
      <header className="mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{chapter.metadata.title}</h1>
        <div className="flex flex-wrap justify-between items-center">
          <div className="text-gray-600">
            第{chapter.metadata.number}章 · 約{chapter.metadata?.wordCount || '8000'}文字
          </div>
          <div className="text-gray-500 text-sm">
            公開日: {chapter.metadata.createdAt.toLocaleDateString()}
          </div>
        </div>
      </header>
      
      <div 
        className="prose prose-lg max-w-none"
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          whiteSpace: 'pre-wrap'
        }}
      >
        {chapter.content}
      </div>
      
      <ReadingControls
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
      />
      
      <ProgressTracker chapter={chapter.metadata.number} total={100} />
    </article>
  );
};
'use client';

import { Passage } from '@/types';

interface PassageDisplayProps {
  passage: Passage;
  className?: string;
}

export default function PassageDisplay({ passage, className = '' }: PassageDisplayProps) {
  const formatPassageText = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-800 leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
          {passage.topic}
        </span>
        {passage.source && (
          <span className="ml-2 text-sm text-gray-500">
            Source: {passage.source}
          </span>
        )}
      </div>
      
      <div className="prose max-w-none">
        {formatPassageText(passage.text)}
      </div>
    </div>
  );
}
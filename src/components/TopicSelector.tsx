'use client';

import { useState } from 'react';
import { TOPICS, Topic } from '@/types';
import Button from './ui/Button';

interface TopicSelectorProps {
  selectedTopics: Topic[];
  onTopicsChange: (topics: Topic[]) => void;
  onContinue: () => void;
}

export default function TopicSelector({ selectedTopics, onTopicsChange, onContinue }: TopicSelectorProps) {
  const [isAllTopicsSelected, setIsAllTopicsSelected] = useState(
    selectedTopics.includes('All Topics')
  );

  const handleTopicToggle = (topic: Topic) => {
    if (topic === 'All Topics') {
      if (isAllTopicsSelected) {
        onTopicsChange([]);
        setIsAllTopicsSelected(false);
      } else {
        onTopicsChange(['All Topics']);
        setIsAllTopicsSelected(true);
      }
      return;
    }

    if (isAllTopicsSelected) {
      setIsAllTopicsSelected(false);
      onTopicsChange([topic]);
      return;
    }

    const newTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];
    
    onTopicsChange(newTopics);
  };

  const isSelected = (topic: Topic) => {
    if (topic === 'All Topics') return isAllTopicsSelected;
    return selectedTopics.includes(topic) || isAllTopicsSelected;
  };

  const canContinue = selectedTopics.length > 0 || isAllTopicsSelected;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Topics</h2>
        <p className="text-gray-600">
          Choose the topics you&apos;d like to practice. This will help generate relevant passages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicToggle(topic)}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              isSelected(topic)
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            } ${topic === 'All Topics' ? 'md:col-span-2 text-center font-semibold' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span>{topic}</span>
              {isSelected(topic) && (
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          size="lg"
          className="px-8"
        >
          Continue to Mode Selection
        </Button>
        {!canContinue && (
          <p className="text-sm text-gray-500 mt-2">
            Please select at least one topic to continue
          </p>
        )}
      </div>
    </div>
  );
}
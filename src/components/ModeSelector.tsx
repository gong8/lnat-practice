'use client';

import { TestMode } from '@/types';
import Button from './ui/Button';

interface ModeSelectorProps {
  selectedTopics: string[];
  onModeSelect: (mode: TestMode) => void;
  onBack: () => void;
}

export default function ModeSelector({ selectedTopics, onModeSelect, onBack }: ModeSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Practice Mode</h2>
        <p className="text-gray-600 mb-4">
          Selected topics: {selectedTopics.length > 3 ? `${selectedTopics.slice(0, 3).join(', ')} +${selectedTopics.length - 3} more` : selectedTopics.join(', ')}
        </p>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Change topics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice Mode</h3>
            <p className="text-gray-600 mb-4">
              Practice with individual passages and get immediate feedback
            </p>
            
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Single passage at a time
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                3-4 questions per passage
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Immediate results and feedback
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No time pressure
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => onModeSelect('practice')} 
            variant="outline" 
            size="lg" 
            className="w-full"
          >
            Start Practice Mode
          </Button>
        </div>

        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mock Test Mode</h3>
            <p className="text-gray-600 mb-4">
              Full LNAT simulation with authentic test conditions
            </p>
            
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                42 questions, 12 passages
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                95-minute timer
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Flag questions for review
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No reviewing previous questions
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => onModeSelect('mock')} 
            size="lg" 
            className="w-full"
          >
            Start Mock Test
          </Button>
        </div>
      </div>
    </div>
  );
}
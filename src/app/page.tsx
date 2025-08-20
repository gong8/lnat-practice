'use client';

import { useState } from 'react';
import { Topic, TestMode } from '@/types';
import { createNewSession, saveSession } from '@/lib/session';
import TopicSelector from '@/components/TopicSelector';
import ModeSelector from '@/components/ModeSelector';
import { useRouter } from 'next/navigation';

type Step = 'topics' | 'mode';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<Step>('topics');
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const router = useRouter();

  const handleTopicsChange = (topics: Topic[]) => {
    setSelectedTopics(topics);
  };

  const handleContinueToMode = () => {
    setCurrentStep('mode');
  };

  const handleBackToTopics = () => {
    setCurrentStep('topics');
  };

  const handleModeSelect = (mode: TestMode) => {
    const session = createNewSession(mode, selectedTopics);
    saveSession(session);
    
    if (mode === 'practice') {
      router.push('/practice');
    } else {
      router.push('/mock-test');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LNAT Practice Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Prepare for the Law National Aptitude Test with AI-generated passages and questions 
            that simulate the real LNAT experience
          </p>
        </div>

        {currentStep === 'topics' && (
          <TopicSelector
            selectedTopics={selectedTopics}
            onTopicsChange={handleTopicsChange}
            onContinue={handleContinueToMode}
          />
        )}

        {currentStep === 'mode' && (
          <ModeSelector
            selectedTopics={selectedTopics}
            onModeSelect={handleModeSelect}
            onBack={handleBackToTopics}
          />
        )}
      </div>
    </div>
  );
}

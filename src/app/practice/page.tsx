'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionData, Passage, Question, Answer } from '@/types';
import { loadSession, updateSession, clearSession } from '@/lib/session';
import { createLLMProvider } from '@/lib/llm/providers';
import PassageDisplay from '@/components/PassageDisplay';
import QuestionInterface from '@/components/QuestionInterface';
import Button from '@/components/ui/Button';

export default function PracticePage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'google' | 'deepseek'>('google');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sessionData = loadSession();
    if (!sessionData || sessionData.mode !== 'practice') {
      router.push('/');
      return;
    }
    
    setSession(sessionData);
    setLoading(false);

    if (sessionData.passages.length === 0) {
      generateNewPassage(sessionData);
    } else {
      setCurrentPassage(sessionData.passages[0]);
      setAnswers(sessionData.answers);
    }
  }, [router]);

  const generateNewPassage = async (sessionData: SessionData) => {
    if (!apiKey) {
      setShowApiSetup(true);
      return;
    }

    setGeneratingContent(true);
    try {
      const llm = createLLMProvider(provider, apiKey);
      
      // Select random topic
      const topics = sessionData.selectedTopics.includes('All Topics') 
        ? ['Politics & Governance', 'Philosophy & Ethics', 'Science & Technology', 'History & Society']
        : sessionData.selectedTopics;
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];

      // Generate passage
      const passageText = await llm.generatePassage(randomTopic);
      
      // Generate questions
      const questions = await llm.generateQuestions(passageText);
      
      const passage: Passage = {
        id: `p_${Date.now()}`,
        topic: randomTopic,
        text: passageText,
        questions
      };

      setCurrentPassage(passage);
      
      // Update session
      const updatedSession = {
        ...sessionData,
        passages: [passage],
        cost: sessionData.cost + llm.getCost()
      };
      updateSession(updatedSession);
      setSession(updatedSession);

    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('Failed to generate content. Please check your API key and try again.');
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (!currentPassage || selectedAnswer === undefined) return;

    const question = currentPassage.questions[currentQuestionIndex];
    const answer: Answer = {
      questionId: question.id,
      selectedAnswer,
      isCorrect: selectedAnswer === question.correctAnswer
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(undefined);
    } else {
      setShowResults(true);
      // Update session with final results
      const updatedSession = updateSession({ answers: newAnswers });
      if (updatedSession) setSession(updatedSession);
    }
  };

  const generateFeedback = async () => {
    if (!currentPassage || !apiKey) return;

    setLoadingFeedback(true);
    try {
      const llm = createLLMProvider(provider, apiKey);
      const feedbackText = await llm.generateFeedback(currentPassage.questions, answers);
      setFeedback(feedbackText);

      // Update cost
      const updatedSession = updateSession({ cost: (session?.cost || 0) + llm.getCost() });
      if (updatedSession) setSession(updatedSession);

    } catch (error) {
      console.error('Failed to generate feedback:', error);
      alert('Failed to generate feedback. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const startNewPractice = () => {
    clearSession();
    router.push('/');
  };

  const tryAnotherPassage = () => {
    if (!session) return;
    
    setCurrentPassage(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(undefined);
    setAnswers([]);
    setShowResults(false);
    setFeedback('');
    
    const resetSession = {
      ...session,
      passages: [],
      answers: []
    };
    updateSession(resetSession);
    setSession(resetSession);
    generateNewPassage(resetSession);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showApiSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">API Configuration</h2>
          <p className="text-gray-600 mb-4">
            Enter your API key to generate LNAT content:
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'google' | 'deepseek')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="google">Google AI Studio</option>
              <option value="deepseek">DeepSeek V3</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setShowApiSetup(false);
                if (session) generateNewPassage(session);
              }}
              disabled={!apiKey}
              className="flex-1"
            >
              Continue
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (generatingContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Generating Content
          </h2>
          <p className="text-gray-600">
            Creating a new passage and questions for you...
          </p>
        </div>
      </div>
    );
  }

  if (!currentPassage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            No passage available
          </h2>
          <Button onClick={startNewPractice}>
            Start New Practice
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = answers.filter(a => a.isCorrect).length;
    const total = answers.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Practice Results
            </h1>
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {score}/{total}
            </div>
            <div className="text-xl text-gray-600 mb-4">
              {percentage}% Correct
            </div>
            <div className="text-sm text-gray-500">
              Cost: ${(session?.cost || 0).toFixed(4)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <PassageDisplay passage={currentPassage} />
            
            <div className="space-y-6">
              {currentPassage.questions.map((question, index) => (
                <QuestionInterface
                  key={question.id}
                  question={question}
                  questionNumber={index + 1}
                  totalQuestions={currentPassage.questions.length}
                  selectedAnswer={answers[index]?.selectedAnswer}
                  onAnswerSelect={() => {}}
                  showResults={true}
                  answer={answers[index]}
                  mode="practice"
                />
              ))}
            </div>
          </div>

          {feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-blue-900 mb-4">AI Feedback</h3>
              <div className="text-blue-800 whitespace-pre-wrap">
                {feedback}
              </div>
            </div>
          )}

          <div className="text-center space-x-4">
            <Button onClick={tryAnotherPassage}>
              Try Another Passage
            </Button>
            <Button onClick={startNewPractice} variant="outline">
              New Practice Session
            </Button>
            {!feedback && (
              <Button
                onClick={generateFeedback}
                loading={loadingFeedback}
                variant="secondary"
              >
                Get AI Feedback
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentPassage.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Practice Mode - {currentPassage.topic}
          </h1>
          <div className="text-sm text-gray-500">
            Cost: ${(session?.cost || 0).toFixed(4)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PassageDisplay passage={currentPassage} />
          
          <QuestionInterface
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentPassage.questions.length}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            isLastQuestion={currentQuestionIndex === currentPassage.questions.length - 1}
            mode="practice"
          />
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionData, Passage, Question, Answer, MOCK_TEST_CONFIG } from '@/types';
import { loadSession, updateSession, clearSession } from '@/lib/session';
import { createLLMProvider } from '@/lib/llm/providers';
import PassageDisplay from '@/components/PassageDisplay';
import QuestionInterface from '@/components/QuestionInterface';
import Timer from '@/components/Timer';
import Button from '@/components/ui/Button';

export default function MockTestPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'google' | 'deepseek'>('google');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [absoluteQuestionIndex, setAbsoluteQuestionIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const sessionData = loadSession();
    if (!sessionData || sessionData.mode !== 'mock') {
      router.push('/');
      return;
    }
    
    setSession(sessionData);
    setAnswers(sessionData.answers);
    setLoading(false);

    if (sessionData.passages.length === 0) {
      setShowInstructions(true);
    } else {
      setShowInstructions(false);
      setTestStarted(true);
      // Calculate current position
      const totalAnswered = sessionData.answers.length;
      let passageIndex = 0;
      let questionIndex = 0;
      let remaining = totalAnswered;
      
      for (let i = 0; i < sessionData.passages.length; i++) {
        if (remaining < sessionData.passages[i].questions.length) {
          passageIndex = i;
          questionIndex = remaining;
          break;
        }
        remaining -= sessionData.passages[i].questions.length;
      }
      
      setCurrentPassageIndex(passageIndex);
      setCurrentQuestionIndex(questionIndex);
      setAbsoluteQuestionIndex(totalAnswered);
    }
  }, [router]);

  const generateAllContent = async (sessionData: SessionData) => {
    if (!apiKey) {
      setShowApiSetup(true);
      return;
    }

    setGeneratingContent(true);
    try {
      const llm = createLLMProvider(provider, apiKey);
      const passages: Passage[] = [];
      
      const topics = sessionData.selectedTopics.includes('All Topics') 
        ? ['Politics & Governance', 'Philosophy & Ethics', 'Science & Technology', 'History & Society', 'Literature & Arts', 'Current Affairs', 'Economics', 'Environment']
        : sessionData.selectedTopics;

      for (let i = 0; i < MOCK_TEST_CONFIG.totalPassages; i++) {
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        // Generate passage
        const passageText = await llm.generatePassage(randomTopic);
        
        // Generate 3-4 questions per passage
        const numQuestions = Math.random() < 0.5 ? 3 : 4;
        const questions = await llm.generateQuestions(passageText);
        const limitedQuestions = questions.slice(0, numQuestions);
        
        const passage: Passage = {
          id: `p_${Date.now()}_${i}`,
          topic: randomTopic,
          text: passageText,
          questions: limitedQuestions
        };

        passages.push(passage);
      }

      // Ensure we have exactly 42 questions
      let totalQuestions = passages.reduce((sum, p) => sum + p.questions.length, 0);
      while (totalQuestions < MOCK_TEST_CONFIG.totalQuestions) {
        // Add more questions to random passages
        const randomPassage = passages[Math.floor(Math.random() * passages.length)];
        if (randomPassage.questions.length < 4) {
          const additionalQuestions = await llm.generateQuestions(randomPassage.text);
          randomPassage.questions.push(additionalQuestions[0]);
          totalQuestions++;
        }
      }

      // Update session
      const updatedSession = {
        ...sessionData,
        passages,
        cost: sessionData.cost + llm.getCost()
      };
      updateSession(updatedSession);
      setSession(updatedSession);
      setShowInstructions(false);
      setTestStarted(true);

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
    if (!session || selectedAnswer === undefined) return;

    const currentPassage = session.passages[currentPassageIndex];
    const currentQuestion = currentPassage.questions[currentQuestionIndex];
    
    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    const newAbsoluteIndex = absoluteQuestionIndex + 1;
    setAbsoluteQuestionIndex(newAbsoluteIndex);

    // Check if we've finished all questions
    const totalQuestions = session.passages.reduce((sum, p) => sum + p.questions.length, 0);
    if (newAbsoluteIndex >= totalQuestions) {
      finishTest(newAnswers);
      return;
    }

    // Move to next question
    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Move to next passage
      setCurrentPassageIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    }
    
    setSelectedAnswer(undefined);
    
    // Update session
    updateSession({ answers: newAnswers });
  };

  const finishTest = (finalAnswers: Answer[]) => {
    setAnswers(finalAnswers);
    setShowResults(true);
    updateSession({ answers: finalAnswers });
  };

  const handleTimeUp = () => {
    finishTest(answers);
  };

  const handleTimerTick = (timeRemaining: number) => {
    updateSession({ timeRemaining });
  };

  const handleFlag = () => {
    if (!session) return;
    
    const currentPassage = session.passages[currentPassageIndex];
    const currentQuestion = currentPassage.questions[currentQuestionIndex];
    
    const flagged = session.flaggedQuestions || [];
    const newFlagged = flagged.includes(currentQuestion.id)
      ? flagged.filter(id => id !== currentQuestion.id)
      : [...flagged, currentQuestion.id];
    
    const updatedSession = updateSession({ flaggedQuestions: newFlagged });
    if (updatedSession) setSession(updatedSession);
  };

  const generateFeedback = async () => {
    if (!session || !apiKey) return;

    setLoadingFeedback(true);
    try {
      const llm = createLLMProvider(provider, apiKey);
      const allQuestions = session.passages.flatMap(p => p.questions);
      const feedbackText = await llm.generateFeedback(allQuestions, answers);
      setFeedback(feedbackText);

      const updatedSession = updateSession({ cost: (session?.cost || 0) + llm.getCost() });
      if (updatedSession) setSession(updatedSession);

    } catch (error) {
      console.error('Failed to generate feedback:', error);
      alert('Failed to generate feedback. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const startNewTest = () => {
    clearSession();
    router.push('/');
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
            Enter your API key to generate the full mock test (this will generate 42 questions across 12 passages):
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

          <div className="mb-4 text-sm text-gray-600">
            <strong>Note:</strong> Generating the full mock test will cost approximately $0.20-$0.50 depending on the provider.
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setShowApiSetup(false);
                if (session) generateAllContent(session);
              }}
              disabled={!apiKey}
              className="flex-1"
            >
              Generate Test
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

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Mock Test Instructions
          </h2>
          
          <div className="space-y-4 text-gray-700 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <p>You will have <strong>95 minutes</strong> to complete 42 questions across 12 passages.</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <p>Each passage will have 3-4 questions. You cannot go back to previous questions once you move forward.</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <p>You can flag questions for review, but remember you cannot return to them.</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <p>The test will automatically submit when time runs out.</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                5
              </div>
              <p>This simulates the real LNAT conditions as closely as possible.</p>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => {
                if (session && session.passages.length > 0) {
                  setShowInstructions(false);
                  setTestStarted(true);
                } else if (session) {
                  generateAllContent(session);
                }
              }}
              size="lg"
            >
              {(session?.passages?.length ?? 0) > 0 ? 'Continue Test' : 'Generate and Start Test'}
            </Button>
            <div className="mt-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Back to Home
              </button>
            </div>
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
            Generating Mock Test
          </h2>
          <p className="text-gray-600 mb-4">
            Creating 12 passages with 42 questions...
          </p>
          <div className="text-sm text-gray-500">
            This may take 2-3 minutes
          </div>
        </div>
      </div>
    );
  }

  if (!session || !testStarted || session.passages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test not available
          </h2>
          <Button onClick={startNewTest}>
            Start New Test
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = answers.filter(a => a.isCorrect).length;
    const total = answers.length;
    const percentage = Math.round((score / total) * 100);
    const allQuestions = session.passages.flatMap(p => p.questions);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mock Test Results
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

          <div className="space-y-8 mb-8">
            {session.passages.map((passage, pIndex) => (
              <div key={passage.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Passage {pIndex + 1}: {passage.topic}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="prose max-w-none">
                    {passage.text.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-800 leading-relaxed text-sm">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    {passage.questions.map((question, qIndex) => {
                      const absoluteIndex = session.passages
                        .slice(0, pIndex)
                        .reduce((sum, p) => sum + p.questions.length, 0) + qIndex;
                      const answer = answers[absoluteIndex];
                      
                      return (
                        <div key={question.id} className="border border-gray-200 rounded p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              Question {absoluteIndex + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              answer?.isCorrect 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {answer?.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">
                            {question.text}
                          </p>
                          <div className="space-y-1">
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className={`text-xs p-2 rounded ${
                                  oIndex === question.correctAnswer
                                    ? 'bg-green-100 text-green-800'
                                    : answer?.selectedAnswer === oIndex
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                {String.fromCharCode(65 + oIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
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
            <Button onClick={startNewTest}>
              Start New Test
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

  const currentPassage = session.passages[currentPassageIndex];
  const currentQuestion = currentPassage.questions[currentQuestionIndex];
  const totalQuestions = session.passages.reduce((sum, p) => sum + p.questions.length, 0);
  const isFlagged = session.flaggedQuestions?.includes(currentQuestion.id) || false;

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            LNAT Mock Test
          </h1>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-500">
              Cost: ${(session?.cost || 0).toFixed(4)}
            </div>
            <Timer 
              timeRemaining={session.timeRemaining}
              onTimeUp={handleTimeUp}
              onTick={handleTimerTick}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Passage {currentPassageIndex + 1} of {session.passages.length}
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {currentPassage.topic}
                </span>
              </div>
              <div className="prose max-w-none text-sm">
                {currentPassage.text.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-800 leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <QuestionInterface
              question={currentQuestion}
              questionNumber={absoluteQuestionIndex + 1}
              totalQuestions={totalQuestions}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              onNext={handleNext}
              onFlag={handleFlag}
              isFlagged={isFlagged}
              canGoBack={false}
              isLastQuestion={absoluteQuestionIndex === totalQuestions - 1}
              mode="mock"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
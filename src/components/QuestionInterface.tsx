'use client';

import { Question, Answer } from '@/types';
import Button from './ui/Button';

interface QuestionInterfaceProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  onAnswerSelect: (answerIndex: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onFlag?: () => void;
  isFlagged?: boolean;
  canGoBack?: boolean;
  isLastQuestion?: boolean;
  showResults?: boolean;
  answer?: Answer;
  mode: 'practice' | 'mock';
}

export default function QuestionInterface({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  onFlag,
  isFlagged = false,
  canGoBack = false,
  isLastQuestion = false,
  showResults = false,
  answer,
  mode
}: QuestionInterfaceProps) {
  const handleAnswerSelect = (index: number) => {
    if (!showResults) {
      onAnswerSelect(index);
    }
  };

  const getOptionClass = (index: number) => {
    const baseClass = "w-full p-4 text-left border-2 rounded-lg transition-all duration-200";
    
    if (showResults) {
      if (index === question.correctAnswer) {
        return `${baseClass} border-green-500 bg-green-50 text-green-900`;
      }
      if (answer && answer.selectedAnswer === index && !answer.isCorrect) {
        return `${baseClass} border-red-500 bg-red-50 text-red-900`;
      }
      return `${baseClass} border-gray-200 bg-gray-50 text-gray-700`;
    }
    
    if (selectedAnswer === index) {
      return `${baseClass} border-blue-500 bg-blue-50 text-blue-900`;
    }
    
    return `${baseClass} border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold text-gray-900">
            Question {questionNumber} of {totalQuestions}
          </span>
          {mode === 'mock' && onFlag && (
            <Button
              onClick={onFlag}
              variant={isFlagged ? 'primary' : 'outline'}
              size="sm"
              className="flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 01.707 1.707L13.414 9l3.293 3.293A1 1 0 0116 14H4a1 1 0 01-1-1V5z" clipRule="evenodd" />
              </svg>
              <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
            </Button>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {Math.round((questionNumber / totalQuestions) * 100)}% Complete
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {question.text}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={getOptionClass(index)}
              disabled={showResults}
            >
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showResults && index === question.correctAnswer && (
                  <svg className="flex-shrink-0 w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {showResults && answer && answer.selectedAnswer === index && !answer.isCorrect && (
                  <svg className="flex-shrink-0 w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showResults && question.explanation && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
          <p className="text-blue-800">{question.explanation}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          {canGoBack && onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
        </div>
        
        <div>
          {onNext && (
            <Button
              onClick={onNext}
              disabled={selectedAnswer === undefined && !showResults}
            >
              {isLastQuestion 
                ? (mode === 'mock' ? 'Finish Test' : 'Finish') 
                : 'Next Question'
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
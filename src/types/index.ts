export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  questionType?: 'implicit_viewpoint' | 'underlying_assumption' | 'argument_structure' | 'inference_analysis' | 'tone_analysis';
}

export interface Answer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent?: number;
}

export interface Passage {
  id: string;
  topic: string;
  text: string;
  source?: string;
  questions: Question[];
}

export interface SessionData {
  mode: 'practice' | 'mock';
  currentQuestion: number;
  answers: Answer[];
  timeRemaining: number;
  selectedTopics: string[];
  cost: number;
  passages: Passage[];
  startTime: number;
  flaggedQuestions: string[];
}

export interface LLMProvider {
  name: string;
  generatePassage(topic: string, samples?: string[]): Promise<string>;
  generateQuestions(passage: string): Promise<Question[]>;
  generateFeedback(questions: Question[], answers: Answer[]): Promise<string>;
  getCost(): number;
}

export interface PassageBank {
  topic: string;
  passages: {
    text: string;
    source?: string;
    questions?: Question[];
  }[];
}

export type TestMode = 'practice' | 'mock';

export type Topic = 
  | 'Politics & Governance'
  | 'Philosophy & Ethics'
  | 'Science & Technology'
  | 'History & Society'
  | 'Literature & Arts'
  | 'Current Affairs'
  | 'Economics'
  | 'Environment'
  | 'All Topics';

export const TOPICS: Topic[] = [
  'Politics & Governance',
  'Philosophy & Ethics',
  'Science & Technology',
  'History & Society',
  'Literature & Arts',
  'Current Affairs',
  'Economics',
  'Environment',
  'All Topics'
];

export const MOCK_TEST_CONFIG = {
  totalQuestions: 42,
  totalPassages: 12,
  timeLimit: 95 * 60 * 1000, // 95 minutes in milliseconds
  questionsPerPassage: [3, 4] // 3-4 questions per passage
};

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  score: number; // 0-100 quality score
}

export interface QuestionQualityMetrics {
  hasExtremeLanguage: boolean;
  hasDirectQuotes: boolean;
  hasObviousWrongAnswers: boolean;
  requiresInference: boolean;
  questionTypeVariety: number;
}
import { SessionData, TestMode, Topic } from '@/types';

const SESSION_STORAGE_KEY = 'lnat-session';

export const createNewSession = (
  mode: TestMode,
  selectedTopics: Topic[]
): SessionData => {
  return {
    mode,
    currentQuestion: 0,
    answers: [],
    timeRemaining: mode === 'mock' ? 95 * 60 * 1000 : 0, // 95 minutes for mock test
    selectedTopics,
    cost: 0,
    passages: [],
    startTime: Date.now(),
    flaggedQuestions: []
  };
};

export const saveSession = (session: SessionData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
};

export const loadSession = (): SessionData | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored session:', error);
        clearSession();
      }
    }
  }
  return null;
};

export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};

export const updateSession = (updates: Partial<SessionData>): SessionData | null => {
  const currentSession = loadSession();
  if (!currentSession) return null;
  
  const updatedSession = { ...currentSession, ...updates };
  saveSession(updatedSession);
  return updatedSession;
};
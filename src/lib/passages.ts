import { PassageBank, Passage } from '@/types';

export const loadSamplePassages = async (): Promise<Passage[]> => {
  try {
    const response = await fetch('/passages/sample-passages.json');
    const data: { passages: Passage[] } = await response.json();
    return data.passages;
  } catch (error) {
    console.error('Failed to load sample passages:', error);
    return [];
  }
};

export const getPassageByTopic = async (topic: string): Promise<Passage | null> => {
  const passages = await loadSamplePassages();
  return passages.find(p => p.topic === topic) || null;
};

export const getAllTopics = async (): Promise<string[]> => {
  const passages = await loadSamplePassages();
  return [...new Set(passages.map(p => p.topic))];
};

export const getRandomPassage = async (topics?: string[]): Promise<Passage | null> => {
  const passages = await loadSamplePassages();
  
  let filteredPassages = passages;
  if (topics && topics.length > 0 && !topics.includes('All Topics')) {
    filteredPassages = passages.filter(p => topics.includes(p.topic));
  }
  
  if (filteredPassages.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredPassages.length);
  return filteredPassages[randomIndex];
};
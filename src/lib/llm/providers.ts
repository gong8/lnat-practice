import { LLMProvider, Question } from '@/types';
import { validateQuestionQuality, enforceQuestionTypeDistribution } from '../questionValidator';
import { getSamplesByTopic, getRandomSample } from '../samplePassages';

class GoogleAIProvider implements LLMProvider {
  name = 'Google AI Studio';
  private apiKey: string;
  private cost = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generatePassage(topic: string, samples?: string[]): Promise<string> {
    const prompt = `Generate a controversial, unconventional argumentative passage for LNAT practice on: ${topic}

REQUIREMENTS FOR AUTHENTICITY:
1. CONTROVERSIAL VIEWPOINTS: Present genuinely challenging perspectives, not mainstream views
   - Example topics: "Children should grow up in wilderness without formal education"
   - "Democracy is fundamentally flawed and should be abandoned"
   - "All art should serve political purposes"

2. VARIED STYLES: Use these formats (choose one):
   - Newspaper opinion column with strong editorial stance
   - Personal letter with emotional, subjective arguments
   - Academic piece with subtle logical flaws
   - Manifesto-style writing with passionate conviction

3. LOGICAL COMPLEXITIES:
   - Include subtle logical gaps or questionable assumptions
   - Present counterarguments that seem reasonable but have flaws
   - Use sophisticated but potentially problematic reasoning

4. DIFFICULTY MARKERS:
   - 500-700 words with dense, complex argumentation
   - Requires multiple readings to fully comprehend
   - Contains implicit assumptions not explicitly stated
   - Mixes valid and questionable logical steps

${samples && samples.length > 0 ? `Reference these authentic styles:\n${samples.join('\n\n---\n\n')}` : `Reference these authentic LNAT styles:\n${getRandomSample()}`}

Generate ONLY the passage text with no labels or formatting.`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + this.apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Google AI API error: ${data.error?.message || 'Unknown error'}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No text generated from Google AI');
      }

      // Rough cost estimation (tokens * rate)
      this.cost += 0.01; // Placeholder cost tracking
      
      return text.trim();
    } catch (error) {
      console.error('Google AI generation failed:', error);
      throw error;
    }
  }

  async generateQuestions(passage: string): Promise<Question[]> {
    const prompt = `Generate exactly 4 LNAT-style questions. Study this authentic LNAT example first:

AUTHENTIC LNAT EXAMPLE:
PASSAGE: "Medieval peasants were tied to manorial land. The Black Death killed 50% of the population, creating labor shortages. This allowed surviving peasants to demand higher wages and move between manors, breaking down feudalism. However, some argue the Great Famine had already started population reduction before the Black Death, making the plague merely an accelerator rather than the primary cause."

QUESTION: "Which of the following is a necessary assumption about the Great Famine?"
A) It reduced the population  
B) It had an impact on wages
C) It occurred before the Black Death ✓ 
D) It was more severe than the Black Death
E) It was a bigger cause of the shift in power

CORRECT: C - This assumption is NECESSARY for the author's temporal argument to work.

NOW GENERATE FOR THIS PASSAGE:
${passage}

CRITICAL REQUIREMENTS:

1. ANSWER LANGUAGE MIXING:
   - Use "absolutely," "entirely," "universally" for CORRECT answers sometimes
   - Use moderate language for INCORRECT answers sometimes  
   - Break the pattern where strong language = wrong
   - Example: Correct answer "X is universally true" vs Wrong answer "X might be somewhat relevant"

2. ASSUMPTION QUESTIONS:
   - Test unstated logical foundations the argument DEPENDS ON
   - NOT facts mentioned in passage
   - Must identify what the author takes for granted
   - Example: "The argument assumes that..." where the assumption isn't explicitly stated

3. MAXIMUM DIFFICULTY:
   - Require synthesis across entire passage
   - No elimination by obvious language patterns
   - Test logical reasoning, not reading comprehension
   - All options must seem plausible to someone who read casually

4. REQUIRED QUESTION TYPES (one each):
   - Author's implicit attitude/perspective
   - Necessary unstated assumption  
   - Logical flaw or weakness in reasoning
   - Complex inference requiring analysis

Format as JSON:
{
  "questions": [
    {
      "text": "Question text here", 
      "options": ["A option", "B option", "C option", "D option", "E option"],
      "correctAnswer": 0,
      "explanation": "Brief explanation"
    }
  ]
}`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + this.apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Google AI API error: ${data.error?.message || 'Unknown error'}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No questions generated from Google AI');
      }

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      let questions: Question[] = parsed.questions.map((q: {text: string, options: string[], correctAnswer: number, explanation: string}, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));

      // Apply question type classification
      questions = enforceQuestionTypeDistribution(questions);
      
      // Validate question quality
      const validation = validateQuestionQuality(questions, passage);
      if (!validation.isValid && validation.score < 50) {
        console.warn('Generated questions failed quality validation:', validation.issues);
        // In production, you might want to retry generation or use fallback questions
      }

      this.cost += 0.01; // Placeholder cost tracking
      
      return questions;
    } catch (error) {
      console.error('Question generation failed:', error);
      throw error;
    }
  }

  async generateFeedback(questions: Question[], answers: {isCorrect: boolean}[]): Promise<string> {
    const score = answers.filter(a => a.isCorrect).length;
    const total = questions.length;
    
    const prompt = `Provide LNAT-specific feedback for a student who scored ${score}/${total}.

Include:
- Performance analysis
- Areas for improvement
- Study recommendations
- Tips for LNAT success

Keep it concise and actionable.`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + this.apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Google AI API error: ${data.error?.message || 'Unknown error'}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No feedback generated from Google AI');
      }

      this.cost += 0.005;
      
      return text.trim();
    } catch (error) {
      console.error('Feedback generation failed:', error);
      throw error;
    }
  }

  getCost(): number {
    return this.cost;
  }
}

class DeepSeekProvider implements LLMProvider {
  name = 'DeepSeek V3';
  private apiKey: string;
  private cost = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generatePassage(topic: string, samples?: string[]): Promise<string> {
    const prompt = `Generate a controversial, unconventional argumentative passage for LNAT practice on: ${topic}

REQUIREMENTS FOR AUTHENTICITY:
1. CONTROVERSIAL VIEWPOINTS: Present genuinely challenging perspectives, not mainstream views
   - Example topics: "Children should grow up in wilderness without formal education"
   - "Democracy is fundamentally flawed and should be abandoned"
   - "All art should serve political purposes"

2. VARIED STYLES: Use these formats (choose one):
   - Newspaper opinion column with strong editorial stance
   - Personal letter with emotional, subjective arguments
   - Academic piece with subtle logical flaws
   - Manifesto-style writing with passionate conviction

3. LOGICAL COMPLEXITIES:
   - Include subtle logical gaps or questionable assumptions
   - Present counterarguments that seem reasonable but have flaws
   - Use sophisticated but potentially problematic reasoning

4. DIFFICULTY MARKERS:
   - 500-700 words with dense, complex argumentation
   - Requires multiple readings to fully comprehend
   - Contains implicit assumptions not explicitly stated
   - Mixes valid and questionable logical steps

${samples && samples.length > 0 ? `Reference these authentic styles:\n${samples.join('\n\n---\n\n')}` : `Reference these authentic LNAT styles:\n${getRandomSample()}`}

Generate ONLY the passage text with no labels or formatting.`;

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${data.error?.message || 'Unknown error'}`);
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('No text generated from DeepSeek');
      }

      this.cost += 0.005; // Lower cost for DeepSeek
      
      return text.trim();
    } catch (error) {
      console.error('DeepSeek generation failed:', error);
      throw error;
    }
  }

  async generateQuestions(passage: string): Promise<Question[]> {
    const prompt = `Generate exactly 4 LNAT-style questions. Study this authentic LNAT example first:

AUTHENTIC LNAT EXAMPLE:
PASSAGE: "Medieval peasants were tied to manorial land. The Black Death killed 50% of the population, creating labor shortages. This allowed surviving peasants to demand higher wages and move between manors, breaking down feudalism. However, some argue the Great Famine had already started population reduction before the Black Death, making the plague merely an accelerator rather than the primary cause."

QUESTION: "Which of the following is a necessary assumption about the Great Famine?"
A) It reduced the population  
B) It had an impact on wages
C) It occurred before the Black Death ✓ 
D) It was more severe than the Black Death
E) It was a bigger cause of the shift in power

CORRECT: C - This assumption is NECESSARY for the author's temporal argument to work.

NOW GENERATE FOR THIS PASSAGE:
${passage}

CRITICAL REQUIREMENTS:

1. ANSWER LANGUAGE MIXING:
   - Use "absolutely," "entirely," "universally" for CORRECT answers sometimes
   - Use moderate language for INCORRECT answers sometimes  
   - Break the pattern where strong language = wrong
   - Example: Correct answer "X is universally true" vs Wrong answer "X might be somewhat relevant"

2. ASSUMPTION QUESTIONS:
   - Test unstated logical foundations the argument DEPENDS ON
   - NOT facts mentioned in passage
   - Must identify what the author takes for granted
   - Example: "The argument assumes that..." where the assumption isn't explicitly stated

3. MAXIMUM DIFFICULTY:
   - Require synthesis across entire passage
   - No elimination by obvious language patterns
   - Test logical reasoning, not reading comprehension
   - All options must seem plausible to someone who read casually

4. REQUIRED QUESTION TYPES (one each):
   - Author's implicit attitude/perspective
   - Necessary unstated assumption  
   - Logical flaw or weakness in reasoning
   - Complex inference requiring analysis

Format as JSON:
{
  "questions": [
    {
      "text": "Question text here", 
      "options": ["A option", "B option", "C option", "D option", "E option"],
      "correctAnswer": 0,
      "explanation": "Brief explanation"
    }
  ]
}`;

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${data.error?.message || 'Unknown error'}`);
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('No questions generated from DeepSeek');
      }

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      let questions: Question[] = parsed.questions.map((q: {text: string, options: string[], correctAnswer: number, explanation: string}, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));

      // Apply question type classification
      questions = enforceQuestionTypeDistribution(questions);
      
      // Validate question quality
      const validation = validateQuestionQuality(questions, passage);
      if (!validation.isValid && validation.score < 50) {
        console.warn('Generated questions failed quality validation:', validation.issues);
        // In production, you might want to retry generation or use fallback questions
      }

      this.cost += 0.005;
      
      return questions;
    } catch (error) {
      console.error('DeepSeek question generation failed:', error);
      throw error;
    }
  }

  async generateFeedback(questions: Question[], answers: {isCorrect: boolean}[]): Promise<string> {
    const score = answers.filter(a => a.isCorrect).length;
    const total = questions.length;
    
    const prompt = `Provide LNAT-specific feedback for a student who scored ${score}/${total}.

Include:
- Performance analysis
- Areas for improvement
- Study recommendations
- Tips for LNAT success

Keep it concise and actionable.`;

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${data.error?.message || 'Unknown error'}`);
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('No feedback generated from DeepSeek');
      }

      this.cost += 0.002;
      
      return text.trim();
    } catch (error) {
      console.error('DeepSeek feedback generation failed:', error);
      throw error;
    }
  }

  getCost(): number {
    return this.cost;
  }
}

export const createLLMProvider = (provider: 'google' | 'deepseek', apiKey: string): LLMProvider => {
  switch (provider) {
    case 'google':
      return new GoogleAIProvider(apiKey);
    case 'deepseek':
      return new DeepSeekProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};
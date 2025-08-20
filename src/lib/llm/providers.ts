import { LLMProvider, Question } from '@/types';
import { validateQuestionQuality, enforceQuestionTypeDistribution } from '../questionValidator';

class GoogleAIProvider implements LLMProvider {
  name = 'Google AI Studio';
  private apiKey: string;
  private cost = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generatePassage(topic: string, samples?: string[]): Promise<string> {
    const prompt = `Generate a 4-8 paragraph argumentative passage suitable for LNAT practice on the topic: ${topic}.

The passage should:
- Be academic and argumentative in style
- Present complex ideas and arguments
- Be approximately 400-600 words
- Include multiple perspectives or counterarguments
- Be challenging but accessible to undergraduate level readers
- NOT require specific legal knowledge
- Focus on reasoning, analysis, and critical thinking

${samples ? `Reference style from these samples:\n${samples.join('\n\n---\n\n')}` : ''}

Generate only the passage text, no additional formatting or labels.`;

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
    const prompt = `Based on this LNAT passage, generate exactly 4 multiple choice questions that match authentic LNAT difficulty and style.

Passage:
${passage}

CRITICAL INSTRUCTIONS FOR LNAT QUESTION GENERATION:

1. ANSWER OPTIONS: All 5 options must be equally plausible. NO extreme language ("always," "never," "completely," "all," "none"). Use subtle distinctions and nuanced wording.

2. DIFFICULTY: Questions must require inference and analysis. Students cannot answer by simple reading. Test implicit understanding only - no direct quotes or explicit restatements.

3. QUESTION TYPES: Use these authentic LNAT patterns (one question from each category):
   - "The author's attitude toward X can best be characterized as..."
   - "The argument assumes which of the following?"
   - "The author's primary method of argument is to..."
   - "The passage suggests that X is most likely..."

4. AVOID: Direct quotes, explicit restatements, obvious wrong answers, simple comprehension.

5. PASSAGE INTEGRATION: Questions must require understanding across multiple paragraphs, not single sentences.

Format as JSON:
{
  "questions": [
    {
      "text": "Question text here",
      "options": ["A option", "B option", "C option", "D option", "E option"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of correct answer"
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
    const prompt = `Generate a 4-8 paragraph argumentative passage suitable for LNAT practice on the topic: ${topic}.

The passage should:
- Be academic and argumentative in style
- Present complex ideas and arguments
- Be approximately 400-600 words
- Include multiple perspectives or counterarguments
- Be challenging but accessible to undergraduate level readers
- NOT require specific legal knowledge
- Focus on reasoning, analysis, and critical thinking

${samples ? `Reference style from these samples:\n${samples.join('\n\n---\n\n')}` : ''}

Generate only the passage text, no additional formatting or labels.`;

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
    const prompt = `Based on this LNAT passage, generate exactly 4 multiple choice questions that match authentic LNAT difficulty and style.

Passage:
${passage}

CRITICAL INSTRUCTIONS FOR LNAT QUESTION GENERATION:

1. ANSWER OPTIONS: All 5 options must be equally plausible. NO extreme language ("always," "never," "completely," "all," "none"). Use subtle distinctions and nuanced wording.

2. DIFFICULTY: Questions must require inference and analysis. Students cannot answer by simple reading. Test implicit understanding only - no direct quotes or explicit restatements.

3. QUESTION TYPES: Use these authentic LNAT patterns (one question from each category):
   - "The author's attitude toward X can best be characterized as..."
   - "The argument assumes which of the following?"
   - "The author's primary method of argument is to..."
   - "The passage suggests that X is most likely..."

4. AVOID: Direct quotes, explicit restatements, obvious wrong answers, simple comprehension.

5. PASSAGE INTEGRATION: Questions must require understanding across multiple paragraphs, not single sentences.

Format as JSON:
{
  "questions": [
    {
      "text": "Question text here",
      "options": ["A option", "B option", "C option", "D option", "E option"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of correct answer"
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
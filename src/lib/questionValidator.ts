import { Question, ValidationResult, QuestionQualityMetrics } from '@/types';

const EXTREME_LANGUAGE_PATTERNS = [
  /\b(always|never|all|none|completely|entirely|absolutely|totally|every|no one|everyone|everything|nothing)\b/gi,
  /\b(must|should|will|cannot|can't|won't|definitely|certainly|obviously|clearly)\b/gi
];

const DIRECT_QUOTE_PATTERNS = [
  /according to the passage/gi,
  /the passage states/gi,
  /the author says/gi,
  /as mentioned in the passage/gi,
  /the text indicates/gi
];

const INFERENCE_INDICATORS = [
  /suggests?/gi,
  /implies?/gi,
  /attitude.*can be.*characterized/gi,
  /assumes?.*following/gi,
  /primary method/gi,
  /most likely/gi,
  /would probably/gi
];

export function validateQuestionQuality(questions: Question[], passage: string): ValidationResult {
  const issues: string[] = [];
  let totalScore = 0;
  
  questions.forEach((question, index) => {
    const metrics = analyzeQuestion(question, passage);
    let questionScore = 100;
    
    // Check for extreme language
    if (metrics.hasExtremeLanguage) {
      issues.push(`Question ${index + 1}: Contains extreme language that makes wrong answers too obvious`);
      questionScore -= 30;
    }
    
    // Check for direct quotes
    if (metrics.hasDirectQuotes) {
      issues.push(`Question ${index + 1}: Uses direct quotes instead of requiring inference`);
      questionScore -= 25;
    }
    
    // Check for obvious wrong answers
    if (metrics.hasObviousWrongAnswers) {
      issues.push(`Question ${index + 1}: Has obviously wrong answers with extreme language`);
      questionScore -= 35;
    }
    
    // Check if requires inference
    if (!metrics.requiresInference) {
      issues.push(`Question ${index + 1}: Too easy - requires only basic reading comprehension`);
      questionScore -= 40;
    }
    
    totalScore += Math.max(0, questionScore);
  });
  
  // Check question type variety
  const questionTypes = questions
    .map(q => q.questionType)
    .filter(type => type !== undefined);
  
  const uniqueTypes = new Set(questionTypes);
  if (uniqueTypes.size < Math.min(4, questions.length)) {
    issues.push(`Insufficient question type variety: ${uniqueTypes.size}/${Math.min(4, questions.length)} types`);
    totalScore -= 20;
  }
  
  const averageScore = questions.length > 0 ? totalScore / questions.length : 0;
  
  return {
    isValid: issues.length === 0 && averageScore >= 70,
    issues,
    score: Math.round(averageScore)
  };
}

export function analyzeQuestion(question: Question, _passage: string): QuestionQualityMetrics {
  const questionText = question.text.toLowerCase();
  const allOptions = question.options.join(' ').toLowerCase();
  
  // Check for extreme language in options
  const hasExtremeLanguage = EXTREME_LANGUAGE_PATTERNS.some(pattern => 
    pattern.test(allOptions)
  );
  
  // Check for direct quotes
  const hasDirectQuotes = DIRECT_QUOTE_PATTERNS.some(pattern =>
    pattern.test(questionText)
  );
  
  // Check for obvious wrong answers (extreme language in individual options)
  const hasObviousWrongAnswers = question.options.some((option, index) => {
    if (index === question.correctAnswer) return false; // Don't penalize correct answer
    return EXTREME_LANGUAGE_PATTERNS.some(pattern => pattern.test(option));
  });
  
  // Check if requires inference
  const requiresInference = INFERENCE_INDICATORS.some(pattern =>
    pattern.test(questionText)
  ) || questionText.includes('attitude') || questionText.includes('assumes');
  
  // Question type variety (will be calculated at passage level)
  const questionTypeVariety = 1;
  
  return {
    hasExtremeLanguage,
    hasDirectQuotes,
    hasObviousWrongAnswers,
    requiresInference,
    questionTypeVariety
  };
}

export function validateAnswerOptions(options: string[]): string[] {
  const issues: string[] = [];
  
  // Check if all options are similar length (indication of equal plausibility)
  const lengths = options.map(opt => opt.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const lengthVariation = Math.max(...lengths) - Math.min(...lengths);
  
  if (lengthVariation > avgLength * 0.5) {
    issues.push('Answer options vary significantly in length - may indicate obvious wrong answers');
  }
  
  // Check for extreme language across options
  const extremeCount = options.filter(option =>
    EXTREME_LANGUAGE_PATTERNS.some(pattern => pattern.test(option))
  ).length;
  
  if (extremeCount > 2) {
    issues.push('Too many options contain extreme language');
  }
  
  // Check for negation patterns that create obvious wrong answers
  const negativeCount = options.filter(option =>
    /\b(not|no|never|none|neither|cannot|shouldn't|wouldn't)\b/gi.test(option)
  ).length;
  
  if (negativeCount > 2) {
    issues.push('Too many negative options - may create obvious wrong answers');
  }
  
  return issues;
}

export const REQUIRED_QUESTION_TYPES: Question['questionType'][] = [
  'implicit_viewpoint',
  'underlying_assumption', 
  'argument_structure',
  'inference_analysis'
];

export function enforceQuestionTypeDistribution(questions: Question[]): Question[] {
  // Assign question types based on question text patterns
  return questions.map((question, index) => {
    const text = question.text.toLowerCase();
    
    let questionType: Question['questionType'];
    
    if (text.includes('attitude') || text.includes('characterized') || text.includes('view')) {
      questionType = 'implicit_viewpoint';
    } else if (text.includes('assumes') || text.includes('assumption') || text.includes('presupposes')) {
      questionType = 'underlying_assumption';
    } else if (text.includes('method') || text.includes('approach') || text.includes('strategy')) {
      questionType = 'argument_structure';
    } else if (text.includes('suggests') || text.includes('implies') || text.includes('likely')) {
      questionType = 'inference_analysis';
    } else if (text.includes('tone') || text.includes('style')) {
      questionType = 'tone_analysis';
    } else {
      // Default assignment based on index to ensure variety
      const typeIndex = index % REQUIRED_QUESTION_TYPES.length;
      questionType = REQUIRED_QUESTION_TYPES[typeIndex];
    }
    
    return {
      ...question,
      questionType
    };
  });
}
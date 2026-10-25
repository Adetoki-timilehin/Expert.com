import type { CategoryId } from '../data/categories'

export type ClassificationResult = {
  categoryId: CategoryId
  confidence: number
  confidenceLabel: 'High confidence' | 'Needs confirmation' | 'More detail needed'
  matchedTerms: string[]
  alternatives: CategoryId[]
  urgentSafetyFlag: boolean
  safetyMessage?: string
}

const categoryTerms: Record<CategoryId, string[]> = {
  plumber: ['pipe', 'leak', 'water', 'plumber', 'stopcock', 'tap', 'drain', 'toilet', 'boiler', 'gas'],
  medical: ['doctor', 'medical', 'symptom', 'headache', 'migraine', 'medication', 'health', 'pain', 'gp', 'suicide', 'self harm'],
  legal: ['legal', 'solicitor', 'employer', 'contract', 'tenancy', 'landlord', 'dismissal', 'rights'],
  career: ['cv', 'résumé', 'resume', 'job application', 'cover letter', 'interview', 'job hunt', 'job search', 'career', 'linkedin', 'redundancy', 'promotion', 'salary', 'career change', 'career transition', 'laid off', 'made redundant'],
  immigration: ['visa', 'immigration', 'passport', 'leave to remain', 'right to remain', 'citizenship', 'nationality', 'brp', 'biometric', 'skilled worker', 'student visa', 'tier 2', 'asylum', 'deportation', 'indefinite leave'],
  financial: ['tax', 'self assessment', 'hmrc', 'savings', 'isa', 'pension', 'debt', 'mortgage', 'budget', 'financial', 'money', 'income', 'expenses', 'self employed', 'national insurance', 'inheritance'],
  'mental-health': ['anxiety', 'depression', 'mental health', 'counselling', 'therapy', 'stress', 'overwhelmed', 'panic', 'trauma', 'grief', 'loneliness', 'sleep', 'mood', 'wellbeing', 'burnout', 'ptsd'],
}

const urgentPatterns: { terms: string[]; message: string }[] = [
  {
    terms: ['chest pain', 'cannot breathe', "can't breathe", 'face drooping', 'cannot speak', 'unconscious'],
    message: 'These words may describe a medical emergency. Call 999 now if anyone is in immediate danger.',
  },
  {
    terms: ['gas leak', 'smell gas', 'carbon monoxide'],
    message: 'Leave the property, avoid switches or flames and contact the National Gas Emergency Service on 0800 111 999.',
  },
  {
    terms: ['suicide', 'self harm', 'kill myself'],
    message: 'Immediate support is available. Call 999 if there is immediate danger or contact Samaritans on 116 123.',
  },
]

export function classifyRequest(
  request: string,
  fallbackCategory: CategoryId
): ClassificationResult {
  const normalized = request.toLowerCase()
  const scores = (Object.keys(categoryTerms) as CategoryId[]).map((categoryId) => {
    const matchedTerms = categoryTerms[categoryId].filter((term) => normalized.includes(term))
    return { categoryId, score: matchedTerms.length, matchedTerms }
  })

  scores.sort((left, right) => right.score - left.score)
  const best = scores[0].score > 0
    ? scores[0]
    : { categoryId: fallbackCategory, score: 0, matchedTerms: [] }
  const secondBest = scores.find((item) => item.categoryId !== best.categoryId)
  const ambiguous = Boolean(secondBest && secondBest.score > 0 && secondBest.score === best.score)
  const confidence = best.score >= 2 && !ambiguous ? 0.91 : best.score === 1 && !ambiguous ? 0.72 : 0.48
  const urgentMatch = urgentPatterns.find((pattern) =>
    pattern.terms.some((term) => normalized.includes(term))
  )

  return {
    categoryId: best.categoryId,
    confidence,
    confidenceLabel: confidence >= 0.85
      ? 'High confidence'
      : confidence >= 0.65
        ? 'Needs confirmation'
        : 'More detail needed',
    matchedTerms: best.matchedTerms,
    alternatives: scores
      .filter((item) => item.categoryId !== best.categoryId)
      .sort((left, right) => right.score - left.score)
      .slice(0, 2)
      .map((item) => item.categoryId),
    urgentSafetyFlag: Boolean(urgentMatch),
    safetyMessage: urgentMatch?.message,
  }
}

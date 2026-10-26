import type { CategoryId } from './categories'

export type ExpertTierId =
  | 'supervised-candidate'
  | 'academy-expert'
  | 'verified-professional'
  | 'senior-verified-professional'

export type BadgeVariant = 'outlined-supervised' | 'slate' | 'green-verified' | 'green-verified-senior'

export type TierDefinition = {
  id: ExpertTierId
  name: string
  price: number
  callPrice?: number
  expertPayout: number
  description: string
  details: string[]
  suitableFor: string
  responseTime: string
  hasExternalQualification: boolean
  isSupervised: boolean
  badge: BadgeVariant
}

export const tiers: Record<ExpertTierId, TierDefinition> = {
  'supervised-candidate': {
    id: 'supervised-candidate',
    name: 'Supervised Academy Candidate',
    price: 12,
    expertPayout: 7,
    description: 'Currently completing the Peasy Academy pathway. The consultation is reviewed by an experienced supervisor.',
    details: [
      'Identity checked',
      'Training in progress',
      'Restricted low-risk scope',
      'Client consent required',
      'Supervisor reviews the work',
      'May take longer to complete',
    ],
    suitableFor: 'Straightforward, low-risk requests',
    responseTime: 'Usually within 4 hours',
    hasExternalQualification: false,
    isSupervised: true,
    badge: 'outlined-supervised',
  },
  'academy-expert': {
    id: 'academy-expert',
    name: 'Academy Expert',
    price: 18,
    expertPayout: 11,
    description: 'Trained and assessed through the Peasy Academy. Suitable for standard guidance within their completed pathway.',
    details: [
      'Identity checked',
      'Academy pathway completed',
      'Scenario assessment passed',
      'Practical work reviewed',
      'Supervised consultations completed',
      'No external professional qualification implied',
    ],
    suitableFor: 'Standard low-risk guidance',
    responseTime: 'Usually within 2 hours',
    hasExternalQualification: false,
    isSupervised: false,
    badge: 'slate',
  },
  'verified-professional': {
    id: 'verified-professional',
    name: 'Verified Professional',
    price: 25,
    callPrice: 55,
    expertPayout: 17,
    description: 'Relevant external experience or qualifications reviewed by Peasy.',
    details: [
      'Identity checked',
      'External credentials reviewed',
      'Relevant professional experience',
      'Independent consultation',
      'Standard response time',
    ],
    suitableFor: 'Experienced independent support',
    responseTime: 'Usually within 2 minutes',
    hasExternalQualification: true,
    isSupervised: false,
    badge: 'green-verified',
  },
  'senior-verified-professional': {
    id: 'senior-verified-professional',
    name: 'Senior Verified Professional',
    price: 45,
    callPrice: 90,
    expertPayout: 32,
    description: 'Advanced experience and a strong quality history for more complex requests.',
    details: [
      'External credentials current',
      'Advanced relevant experience',
      'Minimum consultation-history requirement',
      'Strong quality-review results',
      'Low substantiated complaint rate',
      'Best suited to complex requests',
    ],
    suitableFor: 'Complex or high-stakes situations',
    responseTime: 'Usually within 5 minutes',
    hasExternalQualification: true,
    isSupervised: false,
    badge: 'green-verified-senior',
  },
}

export const tierIds = Object.keys(tiers) as ExpertTierId[]

// Which tiers are eligible per category — enforces safeguarding and safety-critical rules
const categoryTierEligibility: Record<CategoryId, ExpertTierId[]> = {
  career: [
    'supervised-candidate',
    'academy-expert',
    'verified-professional',
    'senior-verified-professional',
  ],
  plumber: [
    'verified-professional',
    'senior-verified-professional',
  ],
  medical: [
    'verified-professional',
    'senior-verified-professional',
  ],
  legal: [
    'verified-professional',
    'senior-verified-professional',
  ],
  immigration: [
    'verified-professional',
    'senior-verified-professional',
  ],
  financial: [
    'verified-professional',
    'senior-verified-professional',
  ],
  'mental-health': [
    'verified-professional',
    'senior-verified-professional',
  ],
}

export function eligibleTiersFor(categoryId: CategoryId): TierDefinition[] {
  const ids = categoryTierEligibility[categoryId] ?? ['verified-professional', 'senior-verified-professional']
  return ids.map((id) => tiers[id])
}

export function lowestPriceFor(categoryId: CategoryId): number {
  const eligible = eligibleTiersFor(categoryId)
  return Math.min(...eligible.map((t) => t.price))
}

export function callPriceFor(tierId: ExpertTierId): number | null {
  return tiers[tierId].callPrice ?? null
}

export function recommendTierFor(
  categoryId: CategoryId,
  gravity: 'routine' | 'standard' | 'elevated'
): ExpertTierId {
  const eligible = eligibleTiersFor(categoryId)
  const ids = eligible.map((t) => t.id)

  if (gravity === 'elevated') {
    if (ids.includes('senior-verified-professional')) return 'senior-verified-professional'
    return ids[ids.length - 1] // highest available
  }
  if (gravity === 'routine') {
    if (ids.includes('supervised-candidate')) return 'supervised-candidate'
    if (ids.includes('academy-expert')) return 'academy-expert'
  }
  // standard
  if (ids.includes('verified-professional')) return 'verified-professional'
  if (ids.includes('academy-expert')) return 'academy-expert'
  return ids[0]
}

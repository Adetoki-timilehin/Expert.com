import type { CategoryId } from './categories'

export type ExpertTierId =
  | 'supervised-candidate'
  | 'academy-expert'
  | 'verified-professional'
  | 'senior-verified-professional'

export type BadgeVariant = 'outlined-supervised' | 'slate' | 'green-verified' | 'green-verified-senior'

export type TierDefinition = {
  id: ExpertTierId
  extendsId?: ExpertTierId
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
    description: 'Currently completing the Peasy Academy pathway. All work is reviewed by an experienced supervisor before delivery.',
    details: [
      'Identity verified',
      'Currently in training',
      'Low-risk scope only',
      'All work reviewed by a supervisor',
      'Response may take longer',
    ],
    suitableFor: 'Straightforward, low-risk requests',
    responseTime: 'Usually within 4 hours',
    hasExternalQualification: false,
    isSupervised: true,
    badge: 'outlined-supervised',
  },
  'academy-expert': {
    id: 'academy-expert',
    extendsId: 'supervised-candidate',
    name: 'Academy Expert',
    price: 18,
    expertPayout: 11,
    description: 'Has completed the full Peasy Academy pathway and works independently.',
    details: [
      'Full Academy pathway completed',
      'Scenario assessments passed',
      'Works independently — no supervisor',
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
    description: 'Holds external professional qualifications or significant industry experience, reviewed and verified by Peasy. Not an Academy graduate.',
    details: [
      'Identity verified',
      'Works independently',
      'External credentials reviewed and verified',
      'Relevant professional experience confirmed',
      'Faster response time',
    ],
    suitableFor: 'Experienced independent support',
    responseTime: 'Usually within 2 minutes',
    hasExternalQualification: true,
    isSupervised: false,
    badge: 'green-verified',
  },
  'senior-verified-professional': {
    id: 'senior-verified-professional',
    extendsId: 'verified-professional',
    name: 'Senior Verified Professional',
    price: 45,
    callPrice: 90,
    expertPayout: 32,
    description: 'Top tier. Advanced experience, a strong quality track record, and a minimum consultation history requirement.',
    details: [
      'Advanced experience in complex cases',
      'Minimum consultation history met',
      'Strong quality-review results',
      'Low substantiated complaint rate',
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

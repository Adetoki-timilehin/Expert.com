import type { CategoryId } from './categories'
import type { ClassificationResult } from '../lib/classifyRequest'
import type { TierDefinition } from './tiers'

export type UrgencyId = 'standard' | 'priority'

export type UrgencyDefinition = {
  id: UrgencyId
  name: string
  // What the client is promised
  promise: string
  // Extra the client pays, inc. VAT
  addOn: number
  // Share of the add-on passed to the expert as a bonus
  expertShare: number
  // Reply target shown to experts, in minutes
  expertTargetMinutes: number
}

// Placeholder prices and shares — to be tuned with real pricing tests
export const urgencyLevels: Record<UrgencyId, UrgencyDefinition> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    promise: 'Your expert replies within their usual response time.',
    addOn: 0,
    expertShare: 0,
    expertTargetMinutes: 4,
  },
  priority: {
    id: 'priority',
    name: 'Priority',
    promise: 'Front of the queue. Your expert replies within 2 minutes, or the Priority fee is refunded.',
    addOn: 5,
    expertShare: 0.7,
    expertTargetMinutes: 2,
  },
}

// Priority is never offered where a person may be in crisis: speed is not something to sell there
export function priorityAvailable(categoryId: CategoryId, classification: ClassificationResult): boolean {
  return categoryId !== 'mental-health' && !classification.urgentSafetyFlag
}

export function chatTotalFor(tier: TierDefinition, urgencyId: UrgencyId): number {
  return tier.price + urgencyLevels[urgencyId].addOn
}

export function expertBonusFor(urgencyId: UrgencyId): number {
  const level = urgencyLevels[urgencyId]
  return +(level.addOn * level.expertShare).toFixed(2)
}

export function expertPayoutFor(tier: TierDefinition, urgencyId: UrgencyId): number {
  return tier.expertPayout + expertBonusFor(urgencyId)
}

// Recommends Priority only when the request itself signals a deadline. Stakes alone never trigger it.
export function recommendUrgencyFor(
  categoryId: CategoryId,
  classification: ClassificationResult
): { id: UrgencyId; reason?: string } {
  if (!priorityAvailable(categoryId, classification)) return { id: 'standard' }
  const { timePressure } = classification
  if (!timePressure.flagged) return { id: 'standard' }
  return { id: 'priority', reason: `You mention a time limit ("${timePressure.matchedTerms[0]}")` }
}

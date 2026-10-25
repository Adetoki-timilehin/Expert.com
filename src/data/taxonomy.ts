import type { CategoryId } from './categories'

export type BroadCategoryId = 'home' | 'health' | 'legal' | 'career' | 'immigration' | 'financial' | 'mental-health'

export type BroadCategory = {
  id: BroadCategoryId
  name: string
  description: string
  availableService: {
    categoryId: CategoryId
    name: string
    specialist: string
  }
  plannedServices: string[]
}

export const broadCategories: BroadCategory[] = [
  {
    id: 'home',
    name: 'Home & property',
    description: 'Urgent repairs and practical household support',
    availableService: {
      categoryId: 'plumber',
      name: 'Emergency plumbing',
      specialist: 'Verified emergency plumber',
    },
    plannedServices: ['Heating engineer', 'Electrician', 'Locksmith'],
  },
  {
    id: 'health',
    name: 'Health & wellbeing',
    description: 'General guidance and appropriate next steps',
    availableService: {
      categoryId: 'medical',
      name: 'General medical guidance',
      specialist: 'UK-registered medical professional',
    },
    plannedServices: ['Pharmacist', 'Physiotherapist', 'Registered dietitian'],
  },
  {
    id: 'legal',
    name: 'Legal',
    description: 'Initial guidance for common legal questions',
    availableService: {
      categoryId: 'legal',
      name: 'Employment law',
      specialist: 'Employment-law solicitor',
    },
    plannedServices: ['Housing solicitor', 'Family solicitor', 'Mediator'],
  },
  {
    id: 'career',
    name: 'Career & work',
    description: 'Redundancy, CV, career transitions and job search',
    availableService: {
      categoryId: 'career',
      name: 'Career guidance',
      specialist: 'ICF-certified career coach',
    },
    plannedServices: ['Business planning', 'LinkedIn profile review', 'Salary negotiation'],
  },
  {
    id: 'immigration',
    name: 'Immigration',
    description: 'Visa guidance, right to remain and citizenship queries',
    availableService: {
      categoryId: 'immigration',
      name: 'Immigration guidance',
      specialist: 'OISC-regulated immigration adviser',
    },
    plannedServices: ['Asylum support', 'Right to work checks', 'Citizenship applications'],
  },
  {
    id: 'financial',
    name: 'Money & finance',
    description: 'Tax, savings, debt and personal financial planning',
    availableService: {
      categoryId: 'financial',
      name: 'Personal finance guidance',
      specialist: 'Qualified personal finance specialist',
    },
    plannedServices: ['Debt advice', 'Pension guidance', 'Benefits entitlement'],
  },
  {
    id: 'mental-health',
    name: 'Mental health',
    description: 'Initial support, signposting and coping strategies',
    availableService: {
      categoryId: 'mental-health',
      name: 'Mental health support',
      specialist: 'BACP-registered counsellor',
    },
    plannedServices: ['Relationship counselling', 'Grief support', 'Trauma-informed therapy'],
  },
]

export function getBroadCategoryForService(categoryId: CategoryId) {
  return broadCategories.find((category) => category.availableService.categoryId === categoryId)!
}

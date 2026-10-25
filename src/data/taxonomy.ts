import type { CategoryId } from './categories'

export type BroadCategoryId = 'home' | 'health' | 'legal' | 'beauty' | 'career'

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
    id: 'career',
    name: 'Career & business',
    description: 'CV reviews, interview preparation and application guidance',
    availableService: {
      categoryId: 'career-application',
      name: 'Career Application Support',
      specialist: 'Academy-trained career specialist',
    },
    plannedServices: ['Business planning', 'LinkedIn profile review', 'Salary negotiation'],
  },
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
    id: 'beauty',
    name: 'Beauty & personal care',
    description: 'Qualified, non-medical personal-care guidance',
    availableService: {
      categoryId: 'beauty',
      name: 'Skincare routines',
      specialist: 'Qualified skin therapist',
    },
    plannedServices: ['Trichologist', 'Aesthetic practitioner', 'Makeup artist'],
  },
]

export function getBroadCategoryForService(categoryId: CategoryId) {
  return broadCategories.find((category) => category.availableService.categoryId === categoryId)!
}

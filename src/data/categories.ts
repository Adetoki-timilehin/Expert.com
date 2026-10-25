export type CategoryId = 'plumber' | 'medical' | 'legal' | 'beauty' | 'career-application'

export type CategoryDefinition = {
  id: CategoryId
  name: string
  shortName: string
  cardTitle: string
  cardSubtitle: string
  landingQuery: string
  defaultUrgency: 'Now' | 'Today' | 'This week'
  intakeLabel: string
  attachmentPrompt: string
  scopeNotice?: string
  matchingNoun: string
  matchingDescription: string
  includedExpert: string
  matchReason: string
  verificationItems: string[]
  consultationSummary: string
  nextSteps: string[]
  expert: {
    name: string
    firstName: string
    title: string
    credentials: string
    location: string
    rating: string
    reviewCount: string
    image: string
    clientMessage: string
    expertMessage: string
  }
}

export const categories: Record<CategoryId, CategoryDefinition> = {
  plumber: {
    id: 'plumber',
    name: 'Emergency Plumbing',
    shortName: 'Emergency plumber',
    cardTitle: 'Find an emergency plumber',
    cardSubtitle: 'Verified · Available now',
    landingQuery: 'I have a burst pipe in my kitchen — water is leaking badly and I need an emergency plumber urgently.',
    defaultUrgency: 'Now',
    intakeLabel: 'Emergency plumbing specialist',
    attachmentPrompt: 'Add photos or a short video of the issue',
    matchingNoun: 'emergency plumbing specialists',
    matchingDescription: 'Matching you with an insured UK plumbing specialist available for urgent guidance.',
    includedExpert: 'Matched to a verified, insured UK plumbing specialist',
    matchReason: 'James is available for urgent guidance in London and has verified insurance and 12 years of emergency plumbing experience.',
    verificationItems: ['Identity and insurance reviewed', 'City & Guilds evidence checked', 'Emergency-work experience confirmed'],
    consultationSummary: 'James confirmed that isolating the water was the correct first action. The damaged joint is likely to require an urgent call-out, with electrical isolation required if water is near sockets or fittings.',
    nextSteps: [
      'Keep the stopcock closed and drain the lowest cold tap',
      'Keep clear of any wet electrical fittings',
      'Share a clear photo of the damaged joint before call-out',
    ],
    expert: {
      name: 'James Whitmore',
      firstName: 'James',
      title: 'Emergency Plumbing Specialist',
      credentials: 'Insured · City & Guilds · 12 yrs',
      location: 'London, UK',
      rating: '4.94',
      reviewCount: '271 reviews',
      image: 'https://images.unsplash.com/photo-1741241290790-0b69e17888da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBVSyUyMG1hbGUlMjBwbHVtYmVyJTIwcG9ydHJhaXQlMjBoZWFkc2hvdCUyMHRyYWRlc3BlcnNvbnxlbnwxfHx8fDE3OTE4Nzc0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      clientMessage: 'Hi James — a pipe has burst beneath the kitchen sink and water is leaking quickly. I have turned off the stopcock. Can you advise what I should do next and whether this needs an emergency call-out?',
      expertMessage: "Hi — turning off the stopcock was exactly the right first step. Please also switch off any nearby electrical sockets at the consumer unit if water is close to them, and do not touch wet electrical fittings.\n\nPlace a bucket beneath the damaged section if it is safe to reach, then open the lowest cold tap in the property to help drain the remaining water from the system.\n\nFrom your description this is likely to need an urgent repair. Send me a clear photo of the affected joint and the pipework around it, and I can help identify the likely fitting before a call-out is arranged.",
    },
  },
  medical: {
    id: 'medical',
    name: 'Medical Guidance',
    shortName: 'Medical guidance',
    cardTitle: 'Speak to a medical professional',
    cardSubtitle: 'GMC status checked',
    landingQuery: 'I have been experiencing recurring headaches and would like help understanding what information to prepare for a GP appointment and when to seek urgent care.',
    defaultUrgency: 'Today',
    intakeLabel: 'UK-registered medical professional',
    attachmentPrompt: 'Add a symptom timeline or current medication list',
    scopeNotice: 'This consultation provides general guidance and triage support, not a diagnosis or emergency treatment. Call 999 for immediate danger.',
    matchingNoun: 'registered medical professionals',
    matchingDescription: 'Matching you with a UK-registered medical professional for general guidance and next-step support.',
    includedExpert: 'Matched to a UK-registered medical professional',
    matchReason: 'Dr Patel is a GMC-registered GP with experience helping patients prepare for appropriate primary-care and urgent-care conversations.',
    verificationItems: ['Identity and GMC status checked', 'Professional indemnity reviewed', 'Scope limited to guidance and triage'],
    consultationSummary: 'Dr Patel recommended recording the timing, duration, triggers and associated symptoms of the headaches before speaking with your GP. New severe or rapidly worsening symptoms require urgent clinical assessment.',
    nextSteps: [
      'Keep a short symptom and trigger diary',
      'Prepare a list of medicines and recent health changes',
      'Arrange a GP appointment and seek urgent help for red-flag symptoms',
    ],
    expert: {
      name: 'Dr Maya Patel',
      firstName: 'Maya',
      title: 'General Medical Practitioner',
      credentials: 'GMC registered · GP · 11 yrs',
      location: 'Manchester, UK',
      rating: '4.96',
      reviewCount: '192 reviews',
      image: 'https://images.unsplash.com/photo-1680001370835-14091dcc05f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBVSyUyMGZlbWFsZSUyMGRvY3RvciUyMHBvcnRyYWl0JTIwaGVhZHNob3R8ZW58MXx8fHwxNzkxODgyMTQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      clientMessage: 'Hi Dr Patel — I have been having recurring headaches and want to understand what information I should prepare for my GP and whether there are signs that would need urgent care.',
      expertMessage: 'Hello — I can help you prepare the right information and explain when urgent assessment is appropriate, but I cannot diagnose the cause through this chat.\n\nPlease note when the headaches started, how suddenly they come on, how long they last, where the pain is located and whether you notice visual changes, weakness, confusion, fever or vomiting.\n\nA sudden extremely severe headache, new weakness, difficulty speaking, loss of consciousness or symptoms after a significant head injury require urgent emergency assessment. Otherwise, a symptom diary and medication list will help your GP evaluate the pattern.',
    },
  },
  legal: {
    id: 'legal',
    name: 'Legal Guidance',
    shortName: 'Employment-law guidance',
    cardTitle: 'Ask a legal professional',
    cardSubtitle: 'Solicitor status checked',
    landingQuery: 'My employer has proposed a change to my contract and I want to understand the questions I should ask and whether I may need formal employment-law advice.',
    defaultUrgency: 'This week',
    intakeLabel: 'UK legal professional',
    attachmentPrompt: 'Add the relevant clause or a redacted letter',
    scopeNotice: 'Initial guidance does not create formal legal representation. Do not upload unredacted confidential or legally privileged documents.',
    matchingNoun: 'employment-law professionals',
    matchingDescription: 'Matching you with a UK legal professional for initial employment-law guidance.',
    includedExpert: 'Matched to a verified UK legal professional',
    matchReason: 'Jordan specialises in employment matters and has experience explaining contract changes and practical escalation options.',
    verificationItems: ['Identity and practising status checked', 'Employment-law experience reviewed', 'Professional indemnity confirmed'],
    consultationSummary: 'Jordan recommended requesting the proposed change in writing, checking the variation and consultation clauses, and avoiding agreement until the practical and contractual impact is clear.',
    nextSteps: [
      'Request the full proposal and effective date in writing',
      'Review the variation and consultation clauses',
      'Seek formal advice promptly if dismissal or a short deadline is mentioned',
    ],
    expert: {
      name: 'Jordan Adetoki',
      firstName: 'Jordan',
      title: 'Employment Law Solicitor',
      credentials: 'Practising solicitor · Employment · 10 yrs',
      location: 'London, UK',
      rating: '4.95',
      reviewCount: '164 reviews',
      image: '/experts/jordan-adetoki.jpg',
      clientMessage: 'Hi Jordan — my employer has proposed changing my contract. I want to understand what I should ask before responding and when I might need formal advice.',
      expertMessage: 'Hello — I can help you identify the key questions and next steps, although this initial consultation does not create formal legal representation.\n\nAsk for the complete proposed change, business reason, consultation process and effective date in writing. Check whether your existing contract contains a variation clause and whether the change affects pay, hours, location or responsibilities.\n\nDo not assume silence means consent. If dismissal, redundancy or a very short response deadline is mentioned, obtain formal advice promptly because employment time limits can be strict.',
    },
  },
  beauty: {
    id: 'beauty',
    name: 'Beauty & Skin',
    shortName: 'Skin consultation',
    cardTitle: 'Book a skin consultation',
    cardSubtitle: 'Qualified · Insured',
    landingQuery: 'I want help simplifying my skincare routine for sensitive, dry skin and understanding which non-prescription products may be suitable.',
    defaultUrgency: 'This week',
    intakeLabel: 'Qualified skin and beauty professional',
    attachmentPrompt: 'Add product labels or a well-lit skin photo',
    scopeNotice: 'Beauty and skincare guidance does not diagnose or treat medical skin conditions. Concerning, painful or changing symptoms should be assessed clinically.',
    matchingNoun: 'qualified skin specialists',
    matchingDescription: 'Matching you with an insured skin professional for non-medical routine and product guidance.',
    includedExpert: 'Matched to a qualified, insured skin professional',
    matchReason: 'Amara specialises in sensitive-skin routines and is qualified to provide non-medical product and treatment guidance.',
    verificationItems: ['Identity and qualification checked', 'Professional insurance reviewed', 'Non-medical scope confirmed'],
    consultationSummary: 'Amara recommended simplifying the routine, introducing one product at a time and prioritising a gentle cleanser, fragrance-free moisturiser and daily broad-spectrum sunscreen.',
    nextSteps: [
      'Pause new active ingredients while sensitivity settles',
      'Patch test one new product at a time',
      'Seek clinical assessment for persistent, painful or changing symptoms',
    ],
    expert: {
      name: 'Amara Lewis',
      firstName: 'Amara',
      title: 'Advanced Skin Therapist',
      credentials: 'Level 4 qualified · Insured · 8 yrs',
      location: 'Birmingham, UK',
      rating: '4.98',
      reviewCount: '226 reviews',
      image: 'https://images.unsplash.com/photo-1673865641073-4479f93a7776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBza2luY2FyZSUyMGNvbnN1bHRhbnQlMjBkZXJtYXRvbG9naXN0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzkxODgyMTQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      clientMessage: 'Hi Amara — my skin is dry and sensitive and my current routine feels too complicated. I would like help choosing a simpler routine without irritating it further.',
      expertMessage: 'Hi — simplifying is a good first step. I can help with a non-medical routine and product selection, but persistent rashes, pain, bleeding or rapidly changing areas should be assessed by a clinician.\n\nFor now, pause new active ingredients and use a gentle fragrance-free cleanser, a simple moisturiser and broad-spectrum sunscreen. Introduce only one new product at a time and patch test it first.\n\nPlease share the names of the products you currently use and whether you have known allergies or a diagnosed skin condition.',
    },
  },
  'career-application': {
    id: 'career-application',
    name: 'Career Application Support',
    shortName: 'Career support',
    cardTitle: 'Get career application help',
    cardSubtitle: 'Academy trained · Verified',
    landingQuery: "I have an important job application and interview coming up and I'd like help polishing my CV and preparing strong answers.",
    defaultUrgency: 'This week',
    intakeLabel: 'Career application specialist',
    attachmentPrompt: 'Add your CV, job description or cover letter',
    matchingNoun: 'career specialists',
    matchingDescription: 'Matching you with a career application specialist for CV and interview guidance.',
    includedExpert: 'Matched to a trained career application specialist',
    matchReason: 'Jordan has completed the Peasy Academy Career Application pathway and has reviewed over 80 CVs and applications in this category.',
    verificationItems: [
      'Identity checked',
      'Career Application pathway completed',
      'Scenario assessment passed',
      'Supervised consultations completed',
    ],
    consultationSummary: 'Jordan reviewed the CV structure and recommended leading with a two-line professional summary, quantifying achievements and tailoring the skills section to match the job description keywords. Three interview questions were practised with structured answer frameworks.',
    nextSteps: [
      'Rewrite the professional summary to match the role',
      'Add measurable outcomes to each bullet point',
      'Practise the three questions with the STAR framework before the interview',
    ],
    expert: {
      name: 'Jordan Brooks',
      firstName: 'Jordan',
      title: 'Career Application Specialist',
      credentials: 'Academy Expert · Career Application · 2 yrs',
      location: 'London, UK',
      rating: '4.93',
      reviewCount: '84 reviews',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&auto=format',
      clientMessage: "Hi Jordan — I have a job application and interview coming up. I'd like help making my CV stand out and preparing for the likely interview questions.",
      expertMessage: "Hi — great timing to prepare properly. I can help you sharpen your CV and build structured answers for the interview, and I've completed the Peasy Career Application pathway so this is the work I focus on.\n\nTo give you the most useful feedback, could you share the job description and your current CV? Even a draft is fine.\n\nOnce I've seen the role, I'll highlight the two or three changes that will have the most impact on the application, and we can run through the interview questions most likely to come up for this type of role.",
    },
  },
}

export function getCategory(id: CategoryId) {
  return categories[id]
}

export const categoryIds = Object.keys(categories) as CategoryId[]

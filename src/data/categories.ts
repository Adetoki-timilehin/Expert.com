export type CategoryId = 'plumber' | 'medical' | 'legal' | 'career' | 'immigration' | 'financial' | 'mental-health'

export type IntakeField =
  | { type: 'chips'; question: string; options: string[] }
  | { type: 'attachment'; hint: string }
  | { type: 'safety-check'; question: string; safeOption: string; crisisOption: string }

export type CategoryDefinition = {
  id: CategoryId
  name: string
  shortName: string
  cardTitle: string
  cardSubtitle: string
  landingQuery: string
  defaultUrgency: 'Now' | 'Today' | 'This week'
  intakeLabel: string
  intakeFields: IntakeField[]
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
    intakeFields: [
      { type: 'chips', question: 'How urgent is this?', options: ['Emergency', 'Needs sorting soon', 'Not urgent'] },
      { type: 'attachment', hint: 'Add a photo or short video of the problem' },
    ],
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
      expertMessage: "Hi — turning off the stopcock was exactly the right first step.\n\nFrom your description this is likely to need an urgent repair. Send me a clear photo of the affected joint and the pipework around it, and I can help identify the likely fitting before a call-out is arranged.\n\nIf water is near any electrical sockets, switch them off at the consumer unit and do not touch wet fittings. Place a bucket beneath the leak if it is safe to reach, then open the lowest cold tap in the property to drain the remaining water from the system.",
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
    intakeFields: [
      { type: 'chips', question: 'How long have you had this?', options: ['Today', 'A few days', 'Several weeks', 'Over a month'] },
      { type: 'chips', question: 'Are you currently on any medication?', options: ['Yes', 'No', 'Prefer not to say'] },
    ],
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
      expertMessage: "Hello — I can help you prepare for your GP and explain when urgent assessment is appropriate, but I cannot diagnose the cause through this chat.\n\nFor your appointment, note when the headaches started, how suddenly they come on, how long they last, where the pain is, and whether you notice visual changes, weakness, confusion, fever or vomiting. Those details will shape what your GP does next.\n\nA sudden extremely severe headache, new weakness, difficulty speaking, loss of consciousness or symptoms after a significant head injury need urgent emergency assessment — call 999 or go to A&E. Otherwise, a symptom diary and a list of current medication help a GP evaluate the pattern.",
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
    intakeFields: [
      { type: 'chips', question: 'Is there a deadline involved?', options: ['Within 2 weeks', 'Within a month', 'Not that I know of'] },
      { type: 'attachment', hint: 'Add the relevant clause or a redacted letter (optional)' },
    ],
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
      expertMessage: "Hello — I can help you work out the key questions and next steps, although this consultation does not create formal legal representation.\n\nBefore you respond, ask for the complete proposed change, the business reason, the consultation process and the effective date in writing. If dismissal, redundancy or a very short response deadline comes up, that is the point I would get formal advice.\n\nAn employer generally needs your agreement to change your contract, unless the contract contains a valid variation clause — check whether yours does, and whether the change affects pay, hours, location or responsibilities. Silence is not automatically consent, and employment tribunal time limits can be short.",
    },
  },
  career: {
    id: 'career',
    name: 'Career Guidance',
    shortName: 'Career guidance',
    cardTitle: 'Speak to a career specialist',
    cardSubtitle: 'ICF certified · Verified',
    landingQuery: "I have been made redundant and want to understand my options, update my CV for today's market and think through what kind of role to target next.",
    defaultUrgency: 'This week',
    intakeLabel: 'Career specialist',
    intakeFields: [
      { type: 'chips', question: 'What is your current situation?', options: ['Employed', 'Recently redundant', 'Between jobs', 'Changing career'] },
      { type: 'attachment', hint: 'Add your CV (optional — helps your expert prepare)' },
    ],
    attachmentPrompt: 'Add your CV, job description or a summary of your situation',
    matchingNoun: 'career specialists',
    matchingDescription: 'Matching you with a verified career specialist for job search, CV and career transition guidance.',
    includedExpert: 'Matched to a verified career specialist',
    matchReason: 'Natalie specialises in career transitions and redundancy and has helped over 120 professionals navigate their next move.',
    verificationItems: [
      'Identity checked',
      'Coaching credentials reviewed',
      'Career transition experience confirmed',
    ],
    consultationSummary: "Natalie reviewed the situation and recommended focusing the CV on transferable outcomes rather than job titles, targeting a specific sector to avoid a scattered application process, and using the redundancy period to build a short list of target employers before applying.",
    nextSteps: [
      'Rewrite the professional summary around outcomes and skills',
      'Build a short list of 10 target employers before applying broadly',
      'Use the redundancy notice period to arrange introductory calls',
    ],
    expert: {
      name: 'Natalie Chen',
      firstName: 'Natalie',
      title: 'Career Coach',
      credentials: 'ICF certified · Career coaching · 6 yrs',
      location: 'London, UK',
      rating: '4.93',
      reviewCount: '138 reviews',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      clientMessage: "Hi Natalie — I have just been made redundant and I am not sure where to start. I want to update my CV and figure out what kind of role to go for next.",
      expertMessage: "Hi — being made redundant is a lot to process, and it is completely normal to feel uncertain about where to start. I can help you think through your options and get your CV in shape.\n\nTo give you the most useful guidance, could you share your current CV and a bit about the kind of work you have been doing and what you might want to do next? Even rough notes are fine.\n\nWe will focus on what is most time-sensitive first — if you have a notice period or a specific role in mind, let me know and we can prioritise around that.\n\nWith two or more years of continuous service you are usually entitled to statutory redundancy pay, and you have a right to reasonable paid time off during your notice period to look for work. Many employers also offer outplacement support — check your redundancy letter.",
    },
  },
  immigration: {
    id: 'immigration',
    name: 'Immigration Guidance',
    shortName: 'Immigration guidance',
    cardTitle: 'Ask an immigration specialist',
    cardSubtitle: 'OISC regulated · Verified',
    landingQuery: 'My visa is due to expire in three months and I want to understand my options for extending my stay or switching to a different visa category.',
    defaultUrgency: 'This week',
    intakeLabel: 'OISC-regulated immigration adviser',
    intakeFields: [
      { type: 'chips', question: 'What is your current immigration status?', options: ['On a visa', 'No visa / overstayed', 'British citizen', 'Other / not sure'] },
      { type: 'attachment', hint: 'Add your visa or BRP details (optional — redact sensitive info)' },
    ],
    attachmentPrompt: 'Add your current visa details or BRP information',
    scopeNotice: 'Initial guidance does not create formal legal representation. Individual circumstances vary significantly — always verify with a regulated adviser before submitting any application.',
    matchingNoun: 'regulated immigration advisers',
    matchingDescription: 'Matching you with an OISC-regulated immigration adviser for initial visa and leave-to-remain guidance.',
    includedExpert: 'Matched to an OISC-regulated immigration adviser',
    matchReason: 'Priya is OISC Level 3 regulated with experience in skilled-worker, student and family visas, and leave-to-remain applications.',
    verificationItems: ['Identity checked', 'OISC registration confirmed', 'Visa category experience reviewed'],
    consultationSummary: "Priya confirmed that a Skilled Worker visa extension is likely the most appropriate route given the circumstances. The application should be submitted at least 28 days before the current visa expires to maintain continuous lawful residence status.",
    nextSteps: [
      'Confirm your current visa expiry date and check your BRP',
      'Gather your payslips, employment contract and passport',
      'Submit the extension application at least 28 days before expiry',
    ],
    expert: {
      name: 'Priya Sharma',
      firstName: 'Priya',
      title: 'Immigration Adviser',
      credentials: 'OISC Level 3 · Immigration · 9 yrs',
      location: 'London, UK',
      rating: '4.97',
      reviewCount: '211 reviews',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      clientMessage: 'Hi Priya — my Skilled Worker visa expires in about three months. I want to understand whether I can extend it and what the process looks like.',
      expertMessage: "Hi — three months is enough time to prepare properly, but I would start now. Securing your employer's cooperation usually takes longer than people expect.\n\nCould you share your employer's sponsor licence status if you know it, and whether your job role or salary has changed since you last applied? That will tell me whether a straightforward extension is the right route for you.\n\nA Skilled Worker extension must be applied for before your current visa expires. You will need a new Certificate of Sponsorship from your employer, and your role and salary must still meet the eligibility requirements at the time you apply.",
    },
  },
  financial: {
    id: 'financial',
    name: 'Financial Guidance',
    shortName: 'Financial guidance',
    cardTitle: 'Speak to a financial specialist',
    cardSubtitle: 'CertPFS qualified · Verified',
    landingQuery: 'I am self-employed and unsure whether I need to file a self-assessment tax return, what I can claim as expenses, and how to start saving properly.',
    defaultUrgency: 'This week',
    intakeLabel: 'Personal finance specialist',
    intakeFields: [
      { type: 'chips', question: 'What is your employment status?', options: ['Employed', 'Self-employed', 'Unemployed', 'Retired'] },
      { type: 'attachment', hint: 'Add a relevant document or summary (optional)' },
    ],
    attachmentPrompt: 'Add a rough income summary or list of questions',
    scopeNotice: 'General financial guidance only. This is not regulated financial advice under FCA rules. For regulated investment or pension advice, speak to an FCA-authorised independent financial adviser.',
    matchingNoun: 'personal finance specialists',
    matchingDescription: 'Matching you with a qualified personal finance specialist for tax, savings and financial planning guidance.',
    includedExpert: 'Matched to a qualified personal finance specialist',
    matchReason: 'Marcus has a CertPFS qualification and specialises in self-employment tax, ISA strategy and personal financial planning for individuals.',
    verificationItems: ['Identity checked', 'CertPFS qualification reviewed', 'Scope limited to general financial guidance'],
    consultationSummary: 'Marcus confirmed that self-assessment registration is required once self-employment income exceeds £1,000. He outlined the main allowable expenses and recommended setting aside 25–30% of income for tax and National Insurance, with a Stocks and Shares ISA for longer-term saving.',
    nextSteps: [
      'Register for self-assessment with HMRC if not already done',
      'Start a simple income and expense tracker',
      'Open a Cash ISA as an emergency fund before investing',
    ],
    expert: {
      name: 'Marcus Reid',
      firstName: 'Marcus',
      title: 'Personal Finance Specialist',
      credentials: 'CertPFS · Personal Finance · 8 yrs',
      location: 'Leeds, UK',
      rating: '4.94',
      reviewCount: '176 reviews',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      clientMessage: 'Hi Marcus — I went self-employed six months ago and I am not sure what tax I owe, what I can claim as expenses, or how to start saving properly. I feel quite lost.',
      expertMessage: "Hi — this is one of the most common situations I see, and six months in you have time to get organised before your first deadline.\n\nTo start: could you give me a rough sense of your annual income from self-employment and whether you have any other income? Then I can give you a realistic picture of what to set aside each month.\n\nSole traders register for Self Assessment with HMRC and pay Income Tax and Class 4 National Insurance on profits, after deducting allowable business expenses. The online return is due by 31 January after the end of the tax year. This is general guidance, not regulated financial advice — for pensions or investments, speak to an FCA-authorised adviser.",
    },
  },
  'mental-health': {
    id: 'mental-health',
    name: 'Mental Health Support',
    shortName: 'Mental health support',
    cardTitle: 'Talk to a mental health professional',
    cardSubtitle: 'BACP registered · Verified',
    landingQuery: 'I have been feeling anxious and overwhelmed for several weeks and I want to understand whether what I am experiencing is normal and what support options are available to me.',
    defaultUrgency: 'Today',
    intakeLabel: 'BACP-registered counsellor',
    intakeFields: [
      { type: 'chips', question: 'How long have you been feeling this way?', options: ['Today', 'A few days', 'A few weeks', 'Longer'] },
      { type: 'safety-check', question: 'Before we continue — are you currently safe?', safeOption: 'Yes, I am safe', crisisOption: 'I need immediate support' },
    ],
    attachmentPrompt: 'Add any notes about what you have been experiencing',
    scopeNotice: 'This consultation provides initial support and signposting, not clinical diagnosis or treatment. If you are in immediate crisis, call 999 or Samaritans on 116 123.',
    matchingNoun: 'registered mental health professionals',
    matchingDescription: 'Matching you with a BACP-registered counsellor for initial support and guidance on next steps.',
    includedExpert: 'Matched to a BACP-registered counsellor',
    matchReason: 'Dr Okafor is a BACP-registered counsellor with experience in anxiety, stress and overwhelm, and NHS pathway navigation.',
    verificationItems: ['Identity checked', 'BACP registration confirmed', 'Professional indemnity reviewed'],
    consultationSummary: "Dr Okafor confirmed that the symptoms described — persistent anxiety, difficulty switching off and low energy — are very common and responding well to support. She outlined three options: NHS self-referral to IAPT talking therapies, a private therapist for faster access, and self-guided tools as a bridge while waiting.",
    nextSteps: [
      'Self-refer to NHS IAPT talking therapies via the NHS website',
      'Consider a private therapist if the wait feels too long',
      'Try a structured breathing technique daily while waiting for support',
    ],
    expert: {
      name: 'Dr Sarah Okafor',
      firstName: 'Sarah',
      title: 'Counselling Psychologist',
      credentials: 'BACP registered · Counselling · 7 yrs',
      location: 'Bristol, UK',
      rating: '4.98',
      reviewCount: '203 reviews',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      clientMessage: 'Hi Dr Okafor — I have been feeling really anxious and overwhelmed lately and it has been going on for a few weeks. I wanted to understand whether this is normal and what I can do about it.',
      expertMessage: "Hi — thank you for reaching out. What you are describing sounds genuinely difficult, and it takes courage to ask for support.\n\nCould you tell me a little more about what the anxiety and overwhelm feel like day to day — is it affecting your sleep, your concentration, or your relationships? That will help me understand what kind of support would be most useful right now.\n\nThis is a supportive conversation, not a clinical assessment or ongoing therapy. If at any point you feel in crisis, contact Samaritans on 116 123 (free, 24 hours) or call 999. NHS Talking Therapies accept self-referrals for anxiety in England.",
    },
  },
}

export function getCategory(id: CategoryId) {
  return categories[id]
}

export const categoryIds = Object.keys(categories) as CategoryId[]

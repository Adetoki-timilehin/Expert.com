export type FaqCategory = 'General' | 'Clients' | 'Experts' | 'Academy' | 'Pricing' | 'Trust & safety'

export type FaqItem = {
  category: FaqCategory
  question: string
  answer: string
}

export const faqCategories: FaqCategory[] = [
  'General',
  'Clients',
  'Experts',
  'Academy',
  'Pricing',
  'Trust & safety',
]

export const faqItems: FaqItem[] = [
  {
    category: 'General',
    question: 'What is SpeciaList?',
    answer: 'SpeciaList is a marketplace for focused consultations with category-appropriate Experts. Clients describe what they need, review the price and information being shared, then connect through a secure consultation workspace.',
  },
  {
    category: 'General',
    question: 'Is this version taking real payments or documents?',
    answer: 'No. This validation build uses simulated identities, evidence, payments, messages and application decisions. Testers should never enter real card details, identity documents or confidential professional records.',
  },
  {
    category: 'General',
    question: 'Can one person use both Client and Expert modes?',
    answer: 'Yes. The intended account model supports both roles. In this prototype, Home returns to role selection so you can switch between the two experiences immediately.',
  },
  {
    category: 'Clients',
    question: 'What does “verified” mean?',
    answer: 'Verification is specific, not generic. A profile should state exactly what was checked—for example identity, Enhanced DBS, insurance, qualification evidence or professional registration. A green badge must never imply checks that did not occur.',
  },
  {
    category: 'Clients',
    question: 'When am I charged?',
    answer: 'The proposed MVP model authorises £25 when a request is submitted and captures it only when an Expert accepts. If no eligible Expert accepts, the authorisation is released. This prototype only simulates that lifecycle.',
  },
  {
    category: 'Clients',
    question: 'What happens if no Expert is available?',
    answer: 'The Client should receive a clear no-match state with options to retry, schedule later or cancel. No consultation payment should be captured when no Expert accepts.',
  },
  {
    category: 'Clients',
    question: 'Can I request a different Expert?',
    answer: 'Yes. Match confirmation explains why an Expert was selected and allows another match request before the consultation begins.',
  },
  {
    category: 'Clients',
    question: 'What do I receive after a consultation?',
    answer: 'The initial offer includes up to 30 minutes of secure text consultation, a written summary, recommended next steps and one follow-up within 24 hours.',
  },
  {
    category: 'Clients',
    question: 'Is SpeciaList an emergency service?',
    answer: 'No. SpeciaList can help clarify next steps, but it does not replace emergency services. Immediate danger, electrical risk, gas leaks, safeguarding concerns or medical emergencies must be escalated to the appropriate emergency or regulated service.',
  },
  {
    category: 'Experts',
    question: 'How does Expert approval work?',
    answer: 'Applicants select a category, provide category-specific evidence and create a public profile. Submission is not approval. Evidence is reviewed, missing information can be requested and approval only applies to the categories and scopes that were verified.',
  },
  {
    category: 'Experts',
    question: 'Can Experts decline requests?',
    answer: 'Yes. Experts are expected to decline work outside their competence, availability or verified scope. A responsible decline should not reduce profile quality or ranking.',
  },
  {
    category: 'Experts',
    question: 'How are Expert payouts calculated?',
    answer: 'For the initial £25 consultation, the prototype shows a £17.50 Expert payout and £7.50 covering platform costs and VAT. Before a real pilot, the legal, tax and marketplace model will be reviewed and the exact breakdown shown before an Expert accepts.',
  },
  {
    category: 'Experts',
    question: 'When are Experts paid?',
    answer: 'The proposed pilot model creates a pending payout after consultation completion, followed by a scheduled payout to the Expert’s verified account. Holds may apply while a dispute or safety review is open.',
  },
  {
    category: 'Experts',
    question: 'What happens when credentials expire?',
    answer: 'Experts receive advance renewal reminders. An expired mandatory credential removes eligibility for affected requests until the updated evidence is reviewed.',
  },
  {
    category: 'Academy',
    question: 'What is an Academy Candidate?',
    answer: 'An Academy Candidate is completing an eligible low-risk pathway. Candidate status must be visible to Clients, the permitted scope is limited and any supervised consultation requires clear Client consent.',
  },
  {
    category: 'Academy',
    question: 'How is an Academy Expert identified to Clients?',
    answer: 'The full label “Academy Expert” must appear on the profile, match explanation, price option, consultation header and receipt. It must also name the completed pathway and state that this is a SpeciaList training achievement rather than an external professional qualification. The label must never be shortened to “Verified Professional” or a vague “Certified Specialist.”',
  },
  {
    category: 'Academy',
    question: 'Is an Academy Expert the same as a Verified Professional?',
    answer: 'No. An Academy Expert completed an internal low-risk pathway, assessment, practical work and supervised consultations. A Verified Professional holds relevant external experience or qualifications that SpeciaList has reviewed. The two statuses use different labels and should never be visually merged.',
  },
  {
    category: 'Academy',
    question: 'How do we prevent Candidates cheating?',
    answer: 'No single quiz creates Academy Expert status. The intended model combines identity checks, randomized scenario banks, answer-order randomization, practical assignments, plagiarism and anomaly review, supervised consultations and human quality review. Retakes can use cooldown periods and different scenarios. Academy Expert status can be withheld or revoked when integrity concerns are found.',
  },
  {
    category: 'Academy',
    question: 'Does an Academy course replace a professional qualification?',
    answer: 'No. Academy Expert status is an internal training achievement and cannot replace regulated, licensed or external professional qualifications. Academy pathways are restricted to eligible low-risk scopes such as career-application support.',
  },
  {
    category: 'Academy',
    question: 'Why include supervised consultations?',
    answer: 'Knowledge tests do not prove that someone can communicate responsibly with a real Client. Supervised consultations let a reviewer assess judgement, accuracy, boundaries, communication and the ability to escalate appropriately.',
  },
  {
    category: 'Academy',
    question: 'Can someone fail or lose Academy Expert status?',
    answer: 'Yes. Academy Candidates can receive development feedback and retry under controlled conditions. Academy Expert status may expire, require continuing development or be suspended after quality, safety or integrity concerns.',
  },
  {
    category: 'Pricing',
    question: 'How will SpeciaList decide prices?',
    answer: 'The initial £25 price is a testable, transparent starting point for a focused text consultation. Pilot pricing should be informed by Client willingness to pay, Expert compensation, category complexity, duration, support costs, payment costs, VAT and sustainable marketplace economics.',
  },
  {
    category: 'Pricing',
    question: 'Will every category cost £25?',
    answer: 'Not necessarily. The MVP should keep one price while validating the core service. Later pricing may use clearly defined bands for duration, urgency or category complexity, but Clients should always see the total before authorising and Experts should see their payout before accepting.',
  },
  {
    category: 'Pricing',
    question: 'Will Experts bid against one another?',
    answer: 'Not in the MVP. Competitive bidding can reduce trust and pressure Experts to accept unsuitable work. SpeciaList should start with transparent fixed pricing and category-specific eligibility.',
  },
  {
    category: 'Pricing',
    question: 'Will there be a subscription?',
    answer: 'The validation offer is a one-off consultation with no subscription. Membership or bundles should only be considered after repeat usage and value are demonstrated.',
  },
  {
    category: 'Trust & safety',
    question: 'How are sensitive documents protected?',
    answer: 'The production design should use private storage, short-lived access links, encryption, least-privilege permissions, retention limits and audit records. Reviewers should only access evidence required for their role. This prototype does not collect real documents.',
  },
  {
    category: 'Trust & safety',
    question: 'Can users report a consultation?',
    answer: 'The intended MVP includes report, block, dispute and support routes with a consultation audit trail. Safety-sensitive reports can pause contact and payouts while a trained reviewer investigates.',
  },
  {
    category: 'Trust & safety',
    question: 'Are consultations provided by AI?',
    answer: 'The marketplace proposition is human expertise. Automated tools may help structure a Client brief or identify missing information, but users should see what is shared and AI must not impersonate a verified professional.',
  },
  {
    category: 'Trust & safety',
    question: 'How are higher-risk categories handled?',
    answer: 'Categories are risk-tiered. Safety-critical, safeguarding-sensitive and regulated work requires stronger external evidence, tighter scope controls and human operations. Academy Expert status alone cannot unlock these categories.',
  },
]

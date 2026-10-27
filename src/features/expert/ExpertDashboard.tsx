import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'

// ─── Types ──────────────────────────────────────────────────────────────────

type ExpertScreen =
  | 'home'
  | 'requests'
  | 'request-detail'
  | 'consultation'
  | 'calls'
  | 'call-active'
  | 'history'
  | 'profile'

type DummyRequest = {
  id: string
  category: string
  categoryShort: string
  query: string
  tier: string
  payout: number
  receivedAgo: string
  urgency: string
}

type DummyCall = {
  id: string
  clientInitial: string
  clientName: string
  category: string
  topic: string
  day: string
  time: string
  duration: string
  payout: number
}

type HistoryItem = {
  id: string
  category: string
  querySnippet: string
  payout: number
  daysAgo: number
  rating: number
  review: string
  format: 'Chat' | 'Call'
}

type ChatMessage = { from: 'client' | 'expert'; text: string }

// Case brief: facts and sources only, never a recommendation or drafted reply
type BriefFact = { label: string; value: string; quote: string; isNew?: boolean }
type BriefRule = { text: string; source: string; url: string; isNew?: boolean }
type CaseBrief = { situation: BriefFact[]; gaps: { text: string; isNew?: boolean }[]; rules: BriefRule[] }

type Consultation = {
  id: string
  category: string
  payout: number
  messages: ChatMessage[]
  brief: CaseBrief
  briefUnseen: boolean
  clientTyping: boolean
  repliesDelivered: number
  awaitingClient: boolean
  unread: boolean
}

// ─── Dummy data ──────────────────────────────────────────────────────────────

const EXPERT = {
  name: 'Alex Chen',
  firstName: 'Alex',
  tier: 'Senior Verified Professional',
  category: 'Legal & Immigration',
  rating: 4.9,
  consultations: 127,
  responseTime: 'Under 2 min',
  memberSince: 'March 2024',
  monthEarnings: 423.00,
  totalEarnings: 3841.00,
}

const INITIAL_REQUESTS: DummyRequest[] = [
  {
    id: 'req-2',
    category: 'Legal',
    categoryShort: 'Legal',
    query: "My landlord is trying to evict me with only two weeks' notice. I've been renting for four years and have always paid on time. I don't think this is legal — I'd like to understand what my rights are before I respond.",
    tier: 'Verified Professional',
    payout: 17,
    receivedAgo: '14 min ago',
    urgency: 'Standard',
  },
  {
    id: 'req-3',
    category: 'Legal',
    categoryShort: 'Legal',
    query: "I was dismissed from my job last Friday after raising a concern about a colleague. I'd been there for six years. I believe it was unfair dismissal and possibly retaliation. Want to understand whether I have a case before speaking to anyone.",
    tier: 'Senior Verified Professional',
    payout: 32,
    receivedAgo: '21 min ago',
    urgency: 'Elevated',
  },
]

const DUMMY_CALLS: DummyCall[] = [
  {
    id: 'call-1',
    clientInitial: 'S',
    clientName: 'Sarah M.',
    category: 'Legal',
    topic: 'Employment tribunal preparation',
    day: 'Tomorrow',
    time: '2:30 PM',
    duration: '45 min',
    payout: 90,
  },
  {
    id: 'call-2',
    clientInitial: 'J',
    clientName: 'James K.',
    category: 'Immigration',
    topic: 'Skilled Worker visa review',
    day: 'Thursday',
    time: '11:00 AM',
    duration: '30 min',
    payout: 90,
  },
]

const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: 'h-1',
    category: 'Legal',
    querySnippet: 'Employment contract dispute after role change',
    payout: 32,
    daysAgo: 4,
    rating: 5,
    review: 'Explained the situation clearly and helped me understand my options before I responded to my employer.',
    format: 'Chat',
  },
  {
    id: 'h-2',
    category: 'Immigration',
    querySnippet: 'Skilled Worker visa renewal — change of employer',
    payout: 32,
    daysAgo: 9,
    rating: 5,
    review: 'Extremely knowledgeable. Gave me exactly the guidance I needed and flagged a detail I had missed entirely.',
    format: 'Call',
  },
  {
    id: 'h-3',
    category: 'Legal',
    querySnippet: 'Tenancy deposit — landlord refusing to return',
    payout: 17,
    daysAgo: 14,
    rating: 4,
    review: 'Good advice, responded promptly. Outlined the process well.',
    format: 'Chat',
  },
  {
    id: 'h-4',
    category: 'Legal',
    querySnippet: 'Redundancy notice — rights and entitlements',
    payout: 32,
    daysAgo: 21,
    rating: 5,
    review: 'Clear and professional. Understood my situation quickly and gave very practical next steps.',
    format: 'Chat',
  },
  {
    id: 'h-5',
    category: 'Immigration',
    querySnippet: 'Leave to remain — application timeline query',
    payout: 17,
    daysAgo: 30,
    rating: 5,
    review: 'Very thorough. Addressed all my concerns and gave me confidence going into the application.',
    format: 'Chat',
  },
]

// ─── Consultation scenarios (dummy chat + expert-only case brief per request) ──
// New requests open with only the client's first message. Each expert reply
// triggers the next entry in `replies`, which also updates the brief.

type ClientReply = {
  text: string
  // Added to the brief (tagged New) when this reply arrives
  brief: CaseBrief
  // Gaps answered by this reply, removed from the brief
  resolvedGaps?: string[]
}

type Scenario = {
  summary: string
  historySnippet: string
  chat: ChatMessage[]
  brief: CaseBrief
  replies: ClientReply[]
}

const SCENARIOS: Record<string, Scenario> = {
  // Already in progress when the expert logs in
  'req-1': {
    summary: 'Skilled Worker visa risk — employer threatening contract termination, 3 years in UK, PR in 18 months',
    historySnippet: 'Skilled Worker visa risk — employer threatening contract termination',
    chat: [
      {
        from: 'client',
        text: "I'm on a Skilled Worker visa and my employer is threatening to terminate my contract. I need to understand whether losing this job would affect my visa status and what my options are — I've been here three years and have permanent residence in 18 months.",
      },
      {
        from: 'expert',
        text: 'Thank you for getting in touch. A few questions before I advise: has your employer given you formal written notice, or is this verbal so far? And is it linked to a specific reason — redundancy, performance, or something else?',
      },
      {
        from: 'client',
        text: "It's been verbal so far — my manager told me in a meeting yesterday that my position is 'at risk'. Nothing in writing yet. They mentioned budget cuts but I'm the only person in my team being told this.",
      },
    ],
    brief: {
      situation: [
        { label: 'Visa', value: 'Skilled Worker', quote: "I'm on a Skilled Worker visa" },
        { label: 'Time in UK', value: '3 years', quote: "I've been here three years" },
        { label: 'Settlement', value: 'Expects eligibility in ~18 months', quote: 'permanent residence in 18 months' },
        { label: 'Notice', value: 'Verbal "at risk" only — nothing in writing', quote: 'Nothing in writing yet' },
        { label: 'Stated reason', value: 'Budget cuts', quote: 'They mentioned budget cuts' },
        { label: 'Selection', value: 'Only person in the team told', quote: "I'm the only person in my team" },
      ],
      gaps: [
        { text: 'Length of continuous service with this employer' },
        { text: 'Contractual notice period' },
        { text: 'Any previous performance or disciplinary issues' },
        { text: 'Whether a consultation meeting has been offered' },
      ],
      rules: [
        {
          text: "If a Skilled Worker's sponsorship ends, their permission is usually shortened to 60 days, unless less time already remains.",
          source: 'GOV.UK — Skilled Worker visa',
          url: 'https://www.gov.uk/skilled-worker-visa',
        },
        {
          text: "Protection from unfair dismissal generally requires 2 years' continuous employment.",
          source: 'GOV.UK — Dismissal: your rights',
          url: 'https://www.gov.uk/dismissal',
        },
        {
          text: 'In a redundancy, employers should consult the employee and use fair, objective selection criteria.',
          source: 'Acas — Redundancy',
          url: 'https://www.acas.org.uk/redundancy',
        },
        {
          text: "Statutory redundancy pay requires 2 years' continuous service.",
          source: 'GOV.UK — Redundancy: your rights',
          url: 'https://www.gov.uk/redundant-your-rights',
        },
      ],
    },
    replies: [
      {
        text: "That's really helpful. Should I put something in writing to my employer now, or wait until they formally give me notice?",
        brief: {
          situation: [
            { label: 'Asking', value: 'Whether to put concerns in writing now or wait', quote: 'Should I put something in writing' },
          ],
          gaps: [{ text: 'Whether anything has been confirmed by email since the meeting' }],
          rules: [
            {
              text: 'Resigning, rather than being dismissed, can remove the right to bring an unfair dismissal claim.',
              source: 'Acas — Dismissals',
              url: 'https://www.acas.org.uk/dismissals',
            },
            {
              text: "Employees with 2 years' service can request written reasons for dismissal.",
              source: 'GOV.UK — Dismissal: your rights',
              url: 'https://www.gov.uk/dismissal',
            },
          ],
        },
      },
    ],
  },

  'req-2': {
    summary: "Eviction notice giving two weeks — 4-year tenant, rent always paid on time",
    historySnippet: "Eviction letter with two weeks' notice — landlord's family moving in",
    chat: [
      {
        from: 'client',
        text: "My landlord is trying to evict me with only two weeks' notice. I've been renting for four years and have always paid on time. I don't think this is legal — I'd like to understand what my rights are before I respond.",
      },
    ],
    brief: {
      situation: [
        { label: 'Tenancy length', value: '4 years', quote: 'renting for four years' },
        { label: 'Rent', value: 'Always paid on time', quote: 'always paid on time' },
        { label: 'Notice', value: 'Two weeks', quote: "only two weeks' notice" },
        { label: 'Client believes', value: 'The notice is not legal', quote: "I don't think this is legal" },
      ],
      gaps: [
        { text: 'Whether the property is in England (rules differ across the UK)' },
        { text: 'What was received — letter, email or official form' },
        { text: 'Reason the landlord has given' },
        { text: 'Whether the deposit is protected in a government-backed scheme' },
      ],
      rules: [
        {
          text: "In England, Section 21 'no-fault' notices can no longer be served. The last date to serve one was 30 April 2026.",
          source: 'NRLA — Possession notices before 1 May 2026',
          url: 'https://www.nrla.org.uk/resources/ending-your-tenancy/section-21-and-section-8-notices-served-before-1st-may-2026',
        },
        {
          text: 'Only a court order can end the tenancy. A landlord cannot remove a tenant or change the locks themselves.',
          source: 'GOV.UK — Private renting: evictions',
          url: 'https://www.gov.uk/private-renting-evictions',
        },
      ],
    },
    replies: [
      {
        text: "Yes, it's in Leeds. A letter came through the door last week saying they want the flat back for a family member and I need to leave in two weeks. I've had no complaints from them before this.",
        resolvedGaps: [
          'Whether the property is in England (rules differ across the UK)',
          'What was received — letter, email or official form',
          'Reason the landlord has given',
        ],
        brief: {
          situation: [
            { label: 'Location', value: 'Leeds, England', quote: "it's in Leeds" },
            { label: 'Received', value: 'Letter through the door, last week', quote: 'A letter came through the door' },
            { label: 'Stated reason', value: 'Family member moving in', quote: 'for a family member' },
            { label: 'History', value: 'No previous complaints from landlord', quote: 'no complaints from them' },
          ],
          gaps: [
            { text: 'Whether the letter names a form, a section or a ground' },
            { text: 'Whether any repair requests were made recently' },
          ],
          rules: [
            {
              text: 'Landlords must now use a Section 8 notice on the prescribed form, stating the ground for possession. The notice period depends on the ground.',
              source: 'NRLA — Grounds for possession',
              url: 'https://www.nrla.org.uk/resources/ending-your-tenancy/grounds-for-possession',
            },
            {
              text: 'Where the landlord or a close family member intends to move in, the notice period is 4 months.',
              source: 'NRLA — Grounds for possession',
              url: 'https://www.nrla.org.uk/resources/ending-your-tenancy/grounds-for-possession',
            },
          ],
        },
      },
      {
        text: "The letter just says I need to be out by the 14th — there's no form attached and no section mentioned. Do I actually have to move out by then?",
        resolvedGaps: ['Whether the letter names a form, a section or a ground'],
        brief: {
          situation: [
            { label: 'Letter content', value: 'Move-out date only — no form, no section named', quote: 'no form attached and no section mentioned' },
          ],
          gaps: [{ text: 'Whether the landlord has contacted them since the letter' }],
          rules: [
            {
              text: 'Tenants do not have to leave when a notice expires. The landlord must apply to court for a possession order.',
              source: 'GOV.UK — Private renting: evictions',
              url: 'https://www.gov.uk/private-renting-evictions',
            },
            {
              text: 'Harassment or illegal eviction can be reported to the local council.',
              source: 'GOV.UK — Private renting: evictions',
              url: 'https://www.gov.uk/private-renting-evictions',
            },
          ],
        },
      },
    ],
  },

  'req-3': {
    summary: "Dismissed last Friday after raising a concern about a colleague — 6 years' service",
    historySnippet: 'Dismissal after reporting falsified safety records — possible whistleblowing',
    chat: [
      {
        from: 'client',
        text: "I was dismissed from my job last Friday after raising a concern about a colleague. I'd been there for six years. I believe it was unfair dismissal and possibly retaliation. Want to understand whether I have a case before speaking to anyone.",
      },
    ],
    brief: {
      situation: [
        { label: 'Dismissed', value: 'Last Friday', quote: 'dismissed from my job last Friday' },
        { label: 'Service', value: '6 years', quote: "I'd been there for six years" },
        { label: 'Trigger', value: 'Says it followed raising a concern about a colleague', quote: 'raising a concern about a colleague' },
        { label: 'Client believes', value: 'Unfair dismissal, possibly retaliation', quote: 'unfair dismissal and possibly retaliation' },
      ],
      gaps: [
        { text: 'What the concern was about' },
        { text: 'Who it was raised with, and whether in writing' },
        { text: 'Reason the employer gave for dismissal' },
        { text: 'Whether a dismissal letter was given' },
      ],
      rules: [
        {
          text: "Protection from unfair dismissal generally requires 2 years' continuous employment.",
          source: 'GOV.UK — Dismissal: your rights',
          url: 'https://www.gov.uk/dismissal',
        },
        {
          text: 'Before making a tribunal claim, the employee must notify Acas for early conciliation, usually within 3 months less one day of dismissal.',
          source: 'Acas — Notify Acas',
          url: 'https://www.acas.org.uk/notify',
        },
        {
          text: 'Early conciliation pauses the time limit. For cases notified from 1 December 2025, it can last up to 12 weeks.',
          source: 'Acas — Early conciliation',
          url: 'https://www.acas.org.uk/early-conciliation',
        },
      ],
    },
    replies: [
      {
        text: "I reported to HR by email that a colleague was falsifying safety inspection records. Two weeks later I was called into a meeting and dismissed for 'performance', though I've never had a warning. They gave me a short letter confirming it.",
        resolvedGaps: [
          'What the concern was about',
          'Who it was raised with, and whether in writing',
          'Reason the employer gave for dismissal',
          'Whether a dismissal letter was given',
        ],
        brief: {
          situation: [
            { label: 'Concern', value: 'Colleague falsifying safety inspection records', quote: 'falsifying safety inspection records' },
            { label: 'Raised with', value: 'HR, by email', quote: 'I reported to HR by email' },
            { label: 'Timing', value: 'Dismissed about two weeks after reporting', quote: 'Two weeks later' },
            { label: 'Stated reason', value: "'Performance' — no previous warnings", quote: 'never had a warning' },
            { label: 'Paperwork', value: 'Short dismissal letter', quote: 'short letter confirming it' },
          ],
          gaps: [
            { text: 'Whether an appeal was offered' },
            { text: 'Whether they kept a copy of the email to HR' },
            { text: 'Any performance reviews or appraisals on record' },
          ],
          rules: [
            {
              text: 'Dismissal where the main reason is a protected disclosure (whistleblowing) is automatically unfair, with no minimum service requirement.',
              source: 'GOV.UK — Whistleblowing for employees',
              url: 'https://www.gov.uk/whistleblowing',
            },
            {
              text: "Employees with 2 years' service can request written reasons for dismissal.",
              source: 'GOV.UK — Dismissal: your rights',
              url: 'https://www.gov.uk/dismissal',
            },
          ],
        },
      },
      {
        text: "They've now offered me a settlement agreement — two months' pay if I sign within a week. Should I just take it?",
        brief: {
          situation: [
            { label: 'Offer', value: "Settlement agreement, two months' pay, one-week deadline", quote: 'settlement agreement' },
          ],
          gaps: [{ text: 'What the agreement waives — claims, reference, confidentiality terms' }],
          rules: [
            {
              text: 'A settlement agreement is only legally binding if the employee has received independent legal advice on it.',
              source: 'Acas — Settlement agreements',
              url: 'https://www.acas.org.uk/settlement-agreements',
            },
            {
              text: 'Signing a settlement agreement usually ends the right to bring the tribunal claims it lists.',
              source: 'Acas — Settlement agreements',
              url: 'https://www.acas.org.uk/settlement-agreements',
            },
          ],
        },
      },
    ],
  },
}

function withReplyBrief(brief: CaseBrief, reply: ClientReply): CaseBrief {
  const old = <T extends { isNew?: boolean }>(items: T[]) => items.map((item) => ({ ...item, isNew: false }))
  const fresh = <T extends { isNew?: boolean }>(items: T[]) => items.map((item) => ({ ...item, isNew: true }))
  const resolved = reply.resolvedGaps ?? []
  return {
    situation: [...old(brief.situation), ...fresh(reply.brief.situation)],
    gaps: [...old(brief.gaps).filter((g) => !resolved.includes(g.text)), ...fresh(reply.brief.gaps)],
    rules: [...old(brief.rules), ...fresh(reply.brief.rules)],
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M6 1l1.2 3.7H11L8.1 6.9l1.1 3.6L6 8.4 2.8 10.5l1.1-3.6L1 4.7h3.8z"
            fill={n <= rating ? 'var(--color-accent)' : 'var(--color-slate-700)'}
          />
        </svg>
      ))}
    </span>
  )
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold"
      style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}
    >
      {label}
    </span>
  )
}

function UrgencyBadge({ level }: { level: string }) {
  const elevated = level === 'Elevated'
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold"
      style={{
        background: elevated ? 'rgba(180,60,40,0.12)' : 'var(--color-slate-800)',
        color: elevated ? '#c0472e' : 'var(--color-slate-400)',
      }}
    >
      {level}
    </span>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>{label}</span>
      <span className="text-[11px] font-semibold text-right" style={{ color: 'var(--color-slate-200)' }}>{value}</span>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TAB_SCREENS: ExpertScreen[] = ['home', 'requests', 'calls', 'history', 'profile']

function WorkspaceTabs({
  current,
  pendingCount,
  onSelect,
}: {
  current: ExpertScreen
  pendingCount: number
  onSelect: (s: ExpertScreen) => void
}) {
  const tabs: { id: ExpertScreen; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'requests', label: 'Requests' },
    { id: 'calls', label: 'Calls' },
    { id: 'history', label: 'History' },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <nav className="flex gap-1 px-4 pb-2 flex-shrink-0" aria-label="Expert workspace">
      {tabs.map((tab) => {
        const active = current === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className="flex-1 min-w-0 min-h-9 rounded-xl text-[10px] font-semibold transition-colors flex items-center justify-center gap-1"
            style={{
              color: active ? 'var(--color-accent-text)' : 'var(--color-slate-400)',
              background: active ? 'var(--color-accent-soft)' : 'transparent',
            }}
          >
            {tab.label}
            {tab.id === 'requests' && pendingCount > 0 && (
              <span
                className="min-w-3.5 h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'var(--color-accent)' }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

// ─── ActiveConsultationCard ───────────────────────────────────────────────────

function ActiveConsultationCard({ consultation, onOpen }: { consultation: Consultation; onOpen: () => void }) {
  const last = consultation.messages[consultation.messages.length - 1]
  const waiting = last.from === 'client'
  const status = consultation.clientTyping ? 'Client is typing…' : waiting ? 'Client is waiting for your reply' : 'Waiting for the client'
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-3xl p-4 text-left border"
      style={{ background: 'var(--color-slate-900)', borderColor: waiting ? 'var(--color-accent)' : 'var(--color-slate-700)' }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <CategoryBadge label={consultation.category} />
          {consultation.unread && (
            <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent-text)' }}>New message</span>
          )}
        </div>
        <span className="text-[12px] font-bold" style={{ color: 'var(--color-accent-text)' }}>£{consultation.payout}.00</span>
      </div>
      <p className="text-[12px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>{status}</p>
      <p className="text-[11px] mt-1 line-clamp-1" style={{ color: 'var(--color-slate-400)' }}>{SCENARIOS[consultation.id].summary}</p>
    </button>
  )
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

function HomeScreen({
  available,
  crossTier,
  hiddenCount,
  pendingRequests,
  consultations,
  monthEarnings,
  onAvailabilityChange,
  onCrossTierChange,
  onGoRequests,
  onOpenConsultation,
  onGoCalls,
  onGoProfile,
}: {
  available: boolean
  crossTier: boolean
  hiddenCount: number
  pendingRequests: DummyRequest[]
  consultations: Consultation[]
  monthEarnings: number
  onAvailabilityChange: (v: boolean) => void
  onCrossTierChange: (v: boolean) => void
  onGoRequests: () => void
  onOpenConsultation: (id: string) => void
  onGoCalls: () => void
  onGoProfile: () => void
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-8 animate-fade-in">
      <div className="pt-2 pb-5">
        <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-slate-400)' }}>Good morning</p>
        <h1 className="font-display text-[30px]" style={{ color: 'var(--color-slate-100)' }}>{EXPERT.name}</h1>
      </div>

      {/* Availability */}
      <div
        className="rounded-3xl p-5 mb-4 flex items-center justify-between border"
        style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
      >
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>Available for requests</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-slate-400)' }}>
            {available ? 'Clients can be matched with you' : 'New matching is paused'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={available}
          onClick={() => onAvailabilityChange(!available)}
          className="w-12 h-7 rounded-full p-1 transition-colors"
          style={{ background: available ? 'var(--color-accent)' : 'var(--color-slate-700)' }}
        >
          <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${available ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Cross-tier requests (opt-in) */}
      <div
        className="rounded-3xl p-5 mb-4 flex items-center justify-between gap-4 border"
        style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
      >
        <div className="min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>Also offer me lower-tier requests</p>
          <p className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--color-slate-400)' }}>
            {crossTier
              ? 'You may be offered requests booked below your tier. Payout follows the tier booked.'
              : hiddenCount > 0
                ? `Off. ${hiddenCount} lower-tier ${hiddenCount === 1 ? 'request is' : 'requests are'} hidden. Payout follows the tier booked.`
                : 'Off. You only see requests booked at your tier.'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={crossTier}
          aria-label="Also offer me lower-tier requests"
          onClick={() => onCrossTierChange(!crossTier)}
          className="w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0"
          style={{ background: crossTier ? 'var(--color-accent)' : 'var(--color-slate-700)' }}
        >
          <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${crossTier ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          type="button"
          onClick={onGoProfile}
          className="rounded-2xl p-3 text-left border"
          style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
        >
          <span className="block text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-slate-400)' }}>Rating</span>
          <span className="block font-display text-[22px] mt-1" style={{ color: 'var(--color-slate-100)' }}>{EXPERT.rating}</span>
          <Stars rating={5} size={8} />
        </button>
        <button
          type="button"
          onClick={onGoProfile}
          className="rounded-2xl p-3 text-left border"
          style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
        >
          <span className="block text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-slate-400)' }}>Sessions</span>
          <span className="block font-display text-[22px] mt-1" style={{ color: 'var(--color-slate-100)' }}>{EXPERT.consultations}</span>
          <span className="block text-[9px]" style={{ color: 'var(--color-accent-text)' }}>Total</span>
        </button>
        <button
          type="button"
          onClick={onGoProfile}
          className="rounded-2xl p-3 text-left border"
          style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
        >
          <span className="block text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-slate-400)' }}>This month</span>
          <span className="block font-display text-[22px] mt-1" style={{ color: 'var(--color-slate-100)' }}>£{monthEarnings.toFixed(0)}</span>
          <span className="block text-[9px]" style={{ color: 'var(--color-accent-text)' }}>Earnings</span>
        </button>
      </div>

      {/* Active consultations */}
      {consultations.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--color-accent-text)' }}>
            {consultations.length} active {consultations.length === 1 ? 'consultation' : 'consultations'}
          </p>
          <div className="space-y-2">
            {consultations.map((c) => (
              <ActiveConsultationCard key={c.id} consultation={c} onOpen={() => onOpenConsultation(c.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Pending requests preview */}
      {pendingRequests.length > 0 && (
        <button
          type="button"
          onClick={onGoRequests}
          className="w-full rounded-3xl p-5 mb-4 text-left border"
          style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--color-accent-text)' }}>
              {pendingRequests.length} pending {pendingRequests.length === 1 ? 'request' : 'requests'}
            </span>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent)' }} />
          </div>
          <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--color-slate-100)' }}>
            {pendingRequests[0].category} — {pendingRequests[0].urgency} gravity
          </p>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--color-slate-400)' }}>
            {pendingRequests[0].query}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--color-accent-border)' }}>
            <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>Payout</span>
            <span className="text-[13px] font-bold" style={{ color: 'var(--color-accent-text)' }}>£{pendingRequests[0].payout}.00</span>
          </div>
        </button>
      )}

      {/* Next call */}
      <button
        type="button"
        onClick={onGoCalls}
        className="w-full rounded-3xl p-5 mb-4 text-left border"
        style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
      >
        <p className="text-[10px] uppercase tracking-wide mb-3" style={{ color: 'var(--color-slate-400)' }}>Next scheduled call</p>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0"
            style={{ background: 'var(--color-slate-700)', color: 'var(--color-slate-200)' }}
          >
            {DUMMY_CALLS[0].clientInitial}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>{DUMMY_CALLS[0].clientName}</p>
            <p className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>{DUMMY_CALLS[0].topic}</p>
          </div>
          <div className="ml-auto text-right flex-shrink-0">
            <p className="text-[12px] font-semibold" style={{ color: 'var(--color-slate-200)' }}>{DUMMY_CALLS[0].day}</p>
            <p className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>{DUMMY_CALLS[0].time}</p>
          </div>
        </div>
      </button>

      {/* Verification status */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--color-slate-800)' }}>
        <p className="text-[11px] font-semibold" style={{ color: 'var(--color-slate-200)' }}>Verification current</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--color-slate-400)' }}>Next document review due in 94 days.</p>
      </div>
    </div>
  )
}

// ─── RequestsScreen ───────────────────────────────────────────────────────────

function RequestsScreen({
  requests,
  consultations,
  onSelect,
  onOpenConsultation,
}: {
  requests: DummyRequest[]
  consultations: Consultation[]
  onSelect: (id: string) => void
  onOpenConsultation: (id: string) => void
}) {
  if (requests.length === 0 && consultations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div
          className="w-12 h-12 rounded-full mb-4 flex items-center justify-center"
          style={{ background: 'var(--color-slate-800)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10h12M10 4v12" stroke="var(--color-slate-400)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-[17px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>No new requests</h2>
        <p className="text-[12px] mt-2" style={{ color: 'var(--color-slate-400)' }}>Eligible opportunities will appear here when you are available.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-8 animate-fade-in">
      <div className="pt-2 pb-5">
        <h1 className="font-display text-[28px]" style={{ color: 'var(--color-slate-100)' }}>Requests</h1>
      </div>

      {/* Active consultations */}
      {consultations.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--color-accent-text)' }}>
            {consultations.length} active {consultations.length === 1 ? 'consultation' : 'consultations'}
          </p>
          <div className="space-y-2">
            {consultations.map((c) => (
              <ActiveConsultationCard key={c.id} consultation={c} onOpen={() => onOpenConsultation(c.id)} />
            ))}
          </div>
        </div>
      )}

      {requests.length > 0 && (
        <p className="text-[10px] uppercase tracking-wide mb-3" style={{ color: 'var(--color-slate-400)' }}>
          Respond within 4 minutes to maintain response score
        </p>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <button
            key={req.id}
            type="button"
            onClick={() => onSelect(req.id)}
            className="w-full rounded-3xl p-5 text-left border transition-colors"
            style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge label={req.category} />
                <UrgencyBadge level={req.urgency} />
              </div>
              <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-slate-600)' }}>{req.receivedAgo}</span>
            </div>
            <p className="text-[12px] leading-relaxed line-clamp-3 mb-3" style={{ color: 'var(--color-slate-200)' }}>{req.query}</p>
            <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--color-slate-700)' }}>
              <span className="text-[10px]" style={{ color: 'var(--color-slate-400)' }}>
                {req.tier === EXPERT.tier ? 'Matched to your tier' : `Booked as ${req.tier}`}
              </span>
              <span className="text-[13px] font-bold" style={{ color: 'var(--color-accent-text)' }}>£{req.payout}.00</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── RequestDetailScreen ──────────────────────────────────────────────────────

function RequestDetailScreen({
  request,
  onAccept,
  onDecline,
  onBack,
}: {
  request: DummyRequest
  onAccept: () => void
  onDecline: () => void
  onBack: () => void
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-8 animate-fade-in flex flex-col">
      <div className="pt-2 pb-5 flex items-center gap-3">
        <button type="button" onClick={onBack} className="min-h-10 -ml-2 px-2 text-[11px] font-semibold" style={{ color: 'var(--color-slate-400)' }}>
          ← Back
        </button>
      </div>

      <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent-text)' }}>
        Respond within 4 minutes
      </p>
      <h1 className="font-display text-[28px] mb-5" style={{ color: 'var(--color-slate-100)' }}>Review request</h1>

      <div className="rounded-3xl p-5 border mb-4" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <CategoryBadge label={request.category} />
          <UrgencyBadge level={request.urgency} />
          <span className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>{request.receivedAgo}</span>
        </div>
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--color-slate-200)' }}>{request.query}</p>
      </div>

      <div className="rounded-2xl p-4 mb-4 space-y-3" style={{ background: 'var(--color-slate-800)' }}>
        <Row label="Tier booked" value={request.tier} />
        <Row label="Urgency assessment" value={request.urgency} />
        <Row label="Format" value="Secure text consultation" />
        <Row label="Expected duration" value="Up to 30 minutes" />
        <Row label="Your payout" value={`£${request.payout}.00`} />
      </div>

      {request.tier !== EXPERT.tier && (
        <p className="text-[11px] leading-relaxed mb-4 rounded-2xl p-4 border" style={{ color: 'var(--color-slate-400)', borderColor: 'var(--color-slate-700)' }}>
          The client booked a {request.tier} consultation. You are being offered it because demand is high in your category.
          Your payout is set by the tier booked, not by your own tier. Declining does not affect your profile.
        </p>
      )}

      <p className="text-[10px] leading-relaxed mb-5" style={{ color: 'var(--color-slate-600)' }}>
        Only accept requests within your verified competence. Declining does not affect your profile or response score.
      </p>

      <button
        type="button"
        onClick={onDecline}
        className="w-full min-h-11 rounded-2xl mb-3 border text-[12px] font-semibold"
        style={{ borderColor: 'var(--color-slate-700)', color: 'var(--color-slate-400)' }}
      >
        Decline request
      </button>
      <button
        type="button"
        onClick={onAccept}
        className="w-full min-h-13 mt-auto rounded-2xl text-white text-[14px] font-semibold"
        style={{ background: 'var(--color-accent)' }}
      >
        Accept consultation · £{request.payout}.00
      </button>
    </div>
  )
}

// ─── ConsultationScreen ───────────────────────────────────────────────────────

function NewTag() {
  return (
    <span
      className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
      style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}
    >
      New
    </span>
  )
}

function BriefSectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[10px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--color-slate-400)' }}>
      {children}
    </p>
  )
}

function CaseBriefDrawer({
  brief,
  onClose,
  onShowFact,
  onInsertRule,
}: {
  brief: CaseBrief
  onClose: () => void
  onShowFact: (quote: string) => void
  onInsertRule: (rule: BriefRule) => void
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end animate-fade-in">
      <button
        type="button"
        aria-label="Close case brief"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)' }}
      />
      <div
        role="dialog"
        aria-label="Case brief"
        className="relative max-h-[85%] flex flex-col rounded-t-2xl border-t"
        style={{ background: 'var(--color-ground-base)', borderColor: 'var(--color-slate-700)' }}
      >
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-slate-700)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>Case brief</p>
            <button type="button" onClick={onClose} className="min-h-10 px-2 text-[11px] font-semibold" style={{ color: 'var(--color-slate-400)' }}>
              Close
            </button>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-slate-600)' }}>
            AI-prepared from the conversation. Facts and sources only — no recommendations. Only you can see this.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-5">
          <section>
            <BriefSectionTitle>Situation</BriefSectionTitle>
            <div className="rounded-xl border divide-y" style={{ borderColor: 'var(--color-slate-700)' }}>
              {brief.situation.map((fact) => (
                <button
                  key={fact.label + fact.value}
                  type="button"
                  onClick={() => onShowFact(fact.quote)}
                  className="w-full text-left px-3 py-2.5 flex items-start gap-3"
                  style={{ borderColor: 'var(--color-slate-700)' }}
                >
                  <span className="w-24 flex-shrink-0 text-[11px]" style={{ color: 'var(--color-slate-400)' }}>{fact.label}</span>
                  <span className="flex-1 min-w-0 text-[12px] leading-snug" style={{ color: 'var(--color-slate-100)' }}>{fact.value}</span>
                  {fact.isNew && <NewTag />}
                </button>
              ))}
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-slate-600)' }}>Tap a fact to see where the client said it.</p>
          </section>

          <section>
            <BriefSectionTitle>Not yet known</BriefSectionTitle>
            <ul className="space-y-1.5">
              {brief.gaps.map((gap) => (
                <li key={gap.text} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: 'var(--color-slate-200)' }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-slate-400)' }} />
                  <span className="flex-1">{gap.text}</span>
                  {gap.isNew && <NewTag />}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <BriefSectionTitle>Relevant rules</BriefSectionTitle>
            <div className="space-y-2">
              {brief.rules.map((rule) => (
                <div key={rule.text} className="rounded-xl border px-3 py-2.5" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-[12px] leading-relaxed" style={{ color: 'var(--color-slate-100)' }}>{rule.text}</p>
                    {rule.isNew && <NewTag />}
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <a
                      href={rule.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] underline truncate"
                      style={{ color: 'var(--color-slate-400)' }}
                    >
                      {rule.source}
                    </a>
                    <button
                      type="button"
                      onClick={() => onInsertRule(rule)}
                      className="flex-shrink-0 min-h-8 px-3 rounded-lg text-[10px] font-semibold"
                      style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}
                    >
                      Insert
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: 'var(--color-slate-600)' }}>
              Check each rule against its source before relying on it. You are responsible for everything you send.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

function ConsultationScreen({
  consultation,
  onOpenBrief,
  onSend,
  onComplete,
  onBack,
}: {
  consultation: Consultation
  onOpenBrief: () => void
  onSend: (text: string) => void
  onComplete: () => void
  onBack: () => void
}) {
  const { messages, brief, briefUnseen, clientTyping } = consultation
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messageRefs = useRef<(HTMLDivElement | null)[]>([])
  const [reply, setReply] = useState('')
  const [briefOpen, setBriefOpen] = useState(false)
  const [highlighted, setHighlighted] = useState<number | null>(null)

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [messages, clientTyping])

  useEffect(() => {
    if (highlighted === null) return
    const timer = setTimeout(() => setHighlighted(null), 1800)
    return () => clearTimeout(timer)
  }, [highlighted])

  function openBrief() {
    setBriefOpen(true)
    onOpenBrief()
  }

  function showFact(quote: string) {
    setBriefOpen(false)
    const index = messages.findIndex((m) => m.from === 'client' && m.text.includes(quote))
    if (index === -1) return
    messageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlighted(index)
  }

  function insertRule(rule: BriefRule) {
    setReply((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n` : '') + `${rule.text} (Source: ${rule.source})`)
    setBriefOpen(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function send() {
    if (!reply.trim()) return
    onSend(reply.trim())
    setReply('')
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col animate-fade-in">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 py-3 border-b"
        style={{ borderColor: 'var(--color-slate-700)', background: 'var(--color-ground-deep)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="min-h-10 px-2 text-[11px] font-semibold" style={{ color: 'var(--color-slate-400)' }}>Back</button>
          <div className="text-center min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>Active consultation</p>
            <p className="text-[10px]" style={{ color: 'var(--color-slate-400)' }}>{consultation.category}</p>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="min-h-10 px-3 rounded-xl text-[11px] font-semibold"
            style={{ background: 'var(--color-slate-800)', color: 'var(--color-slate-200)' }}
          >
            Complete
          </button>
        </div>
      </div>

      {/* Request summary + brief entry point */}
      <div className="flex-shrink-0 px-5 py-3 flex items-center gap-3" style={{ background: 'var(--color-accent-soft)' }}>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--color-accent-text)' }}>Request summary</p>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--color-slate-400)' }}>
            {SCENARIOS[consultation.id].summary}
          </p>
        </div>
        <button
          type="button"
          onClick={openBrief}
          className="relative flex-shrink-0 min-h-10 px-3 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5"
          style={{ background: 'var(--color-ground-base)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent-text)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="1.5" y="0.5" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
            <path d="M3.5 3.5h5M3.5 6h5M3.5 8.5h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          Brief
          {briefUnseen && (
            <span
              aria-label="Brief updated"
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: 'var(--color-accent)', borderColor: 'var(--color-ground-base)' }}
            />
          )}
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            ref={(el) => { messageRefs.current[i] = el }}
            className={`flex ${msg.from === 'expert' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[84%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line transition-shadow duration-300"
              style={{
                background: msg.from === 'expert' ? 'var(--color-accent)' : 'var(--color-slate-900)',
                color: msg.from === 'expert' ? 'white' : 'var(--color-slate-200)',
                boxShadow: highlighted === i ? '0 0 0 2px var(--color-accent)' : 'none',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {clientTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-1" style={{ background: 'var(--color-slate-900)' }}>
              {[0, 1, 2].map((n) => (
                <span
                  key={n}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: 'var(--color-slate-400)', animationDelay: `${n * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 border-t px-4 pt-3 pb-3" style={{ borderColor: 'var(--color-slate-700)', background: 'var(--color-ground-base)' }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={reply.includes('\n') || reply.length > 60 ? 4 : 1}
            placeholder="Reply to the client…"
            aria-label="Your reply"
            className="flex-1 min-w-0 rounded-2xl px-4 py-3 outline-none text-[13px] leading-relaxed resize-none"
            style={{
              background: 'var(--color-ground-deep)',
              color: 'var(--color-slate-100)',
              border: '1px solid var(--color-slate-700)',
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!reply.trim()}
            aria-label="Send message"
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{ background: 'var(--color-accent)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M14 8L2 2l3 6-3 6z" fill="white" />
            </svg>
          </button>
        </div>
      </div>

      {briefOpen && (
        <CaseBriefDrawer
          brief={brief}
          onClose={() => setBriefOpen(false)}
          onShowFact={showFact}
          onInsertRule={insertRule}
        />
      )}
    </div>
  )
}

// ─── ConsultationCompleteScreen ────────────────────────────────────────────────

function ConsultationCompleteScreen({
  payout,
  onDone,
}: {
  payout: number
  onDone: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 animate-fade-in">
      <div
        className="w-16 h-16 rounded-full mb-6 flex items-center justify-center"
        style={{ background: 'var(--color-accent-soft)' }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M6 14l6 6 10-12" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-display text-[28px] mb-2" style={{ color: 'var(--color-slate-100)' }}>Consultation complete</h2>
      <p className="text-[13px] leading-relaxed mb-2" style={{ color: 'var(--color-slate-400)' }}>
        Your payout of <span className="font-semibold" style={{ color: 'var(--color-accent-text)' }}>£{payout}.00</span> is being processed and will appear in your balance within 24 hours.
      </p>
      <p className="text-[11px] mb-8" style={{ color: 'var(--color-slate-600)' }}>
        The client will be prompted to rate this consultation.
      </p>
      <button
        type="button"
        onClick={onDone}
        className="w-full min-h-13 rounded-2xl text-white text-[14px] font-semibold"
        style={{ background: 'var(--color-accent)' }}
      >
        Back to dashboard
      </button>
    </div>
  )
}

// ─── CallsScreen ──────────────────────────────────────────────────────────────

function CallsScreen({
  calls,
  onJoin,
}: {
  calls: DummyCall[]
  onJoin: (id: string) => void
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-8 animate-fade-in">
      <div className="pt-2 pb-5">
        <h1 className="font-display text-[28px]" style={{ color: 'var(--color-slate-100)' }}>Scheduled calls</h1>
      </div>

      <div className="space-y-3 mb-6">
        {calls.map((call) => (
          <div
            key={call.id}
            className="rounded-3xl p-5 border"
            style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0"
                style={{ background: 'var(--color-slate-700)', color: 'var(--color-slate-200)' }}
              >
                {call.clientInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>{call.clientName}</p>
                <p className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>{call.topic}</p>
              </div>
              <CategoryBadge label={call.category} />
            </div>

            <div className="space-y-2 mb-4">
              <Row label="When" value={`${call.day} at ${call.time}`} />
              <Row label="Duration" value={call.duration} />
              <Row label="Your payout" value={`£${call.payout}.00`} />
            </div>

            <button
              type="button"
              onClick={() => onJoin(call.id)}
              className="w-full min-h-10 rounded-2xl text-[12px] font-semibold"
              style={{ background: 'var(--color-slate-700)', color: 'var(--color-slate-200)' }}
            >
              Available {call.day} at {call.time}
            </button>
            <button
              type="button"
              onClick={() => onJoin(call.id)}
              className="w-full mt-2 text-[10px] font-semibold"
              style={{ color: 'var(--color-accent-text)' }}
            >
              Demo — join now
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4" style={{ background: 'var(--color-slate-800)' }}>
        <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--color-slate-200)' }}>Calls are end-to-end encrypted</p>
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-slate-400)' }}>
          Join from a quiet location with a stable internet connection. Calls begin automatically when both parties join.
        </p>
      </div>
    </div>
  )
}

// ─── CallActiveScreen ─────────────────────────────────────────────────────────

function CallActiveScreen({
  call,
  onEnd,
}: {
  call: DummyCall
  onEnd: () => void
}) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 animate-fade-in">
      <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-[28px] font-bold"
        style={{ background: 'var(--color-slate-800)', color: 'var(--color-slate-200)' }}>
        {call.clientInitial}
      </div>
      <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--color-slate-100)' }}>{call.clientName}</p>
      <p className="text-[11px] mb-2" style={{ color: 'var(--color-slate-400)' }}>{call.topic}</p>
      <p className="font-display text-[36px] mb-1" style={{ color: 'var(--color-slate-100)' }}>
        {mins}:{secs}
      </p>
      <p className="text-[10px] mb-10" style={{ color: 'var(--color-accent-text)' }}>Call in progress · Encrypted</p>

      <div className="flex items-center gap-6 mb-10">
        <button type="button" className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--color-slate-800)' }} aria-label="Mute">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 2a3 3 0 00-3 3v5a3 3 0 006 0V5a3 3 0 00-3-3zM5 10a5 5 0 0010 0M10 15v3" stroke="var(--color-slate-200)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--color-slate-800)' }} aria-label="Speaker">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 7h3l5-4v14l-5-4H3V7zM14 7a4 4 0 010 6" stroke="var(--color-slate-200)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={onEnd}
        className="w-full min-h-13 rounded-2xl text-white text-[14px] font-semibold"
        style={{ background: '#c0392b' }}
      >
        End call
      </button>
    </div>
  )
}

// ─── HistoryScreen ────────────────────────────────────────────────────────────

function HistoryScreen({ items }: { items: HistoryItem[] }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-8 animate-fade-in">
      <div className="pt-2 pb-5">
        <h1 className="font-display text-[28px]" style={{ color: 'var(--color-slate-100)' }}>History</h1>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl p-5 border"
            style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge label={item.category} />
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{ background: 'var(--color-slate-800)', color: 'var(--color-slate-400)' }}
                >
                  {item.format}
                </span>
              </div>
              <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-slate-600)' }}>
                {item.daysAgo === 1 ? 'Yesterday' : `${item.daysAgo} days ago`}
              </span>
            </div>

            <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--color-slate-100)' }}>{item.querySnippet}</p>

            <div className="flex items-center gap-2 mb-3">
              <Stars rating={item.rating} />
              <span className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>{item.rating}.0</span>
            </div>

            <p className="text-[11px] leading-relaxed mb-3 italic" style={{ color: 'var(--color-slate-400)' }}>
              "{item.review}"
            </p>

            <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--color-slate-700)' }}>
              <span className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>Payout</span>
              <span className="text-[12px] font-bold" style={{ color: 'var(--color-accent-text)' }}>£{item.payout}.00</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────

function ProfileScreen() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-8 animate-fade-in">
      <div className="pt-2 pb-5">
        <h1 className="font-display text-[28px]" style={{ color: 'var(--color-slate-100)' }}>Profile</h1>
      </div>

      {/* Identity card */}
      <div className="rounded-3xl p-5 border mb-4" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-[22px] font-bold flex-shrink-0"
            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}
          >
            AC
          </div>
          <div>
            <p className="text-[17px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>{EXPERT.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-slate-400)' }}>{EXPERT.category}</p>
            <span
              className="inline-flex mt-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}
            >
              {EXPERT.tier}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Row label="Member since" value={EXPERT.memberSince} />
          <Row label="Avg. response time" value={EXPERT.responseTime} />
          <Row label="Next verification" value="In 94 days" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
          <span className="block text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-slate-400)' }}>Rating</span>
          <span className="block font-display text-[28px] mt-1" style={{ color: 'var(--color-slate-100)' }}>{EXPERT.rating} ★</span>
          <span className="block text-[10px] mt-1" style={{ color: 'var(--color-slate-600)' }}>From {EXPERT.consultations} consultations</span>
        </div>
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
          <span className="block text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-slate-400)' }}>Total earned</span>
          <span className="block font-display text-[28px] mt-1" style={{ color: 'var(--color-slate-100)' }}>£{EXPERT.totalEarnings.toFixed(0)}</span>
          <span className="block text-[10px] mt-1" style={{ color: 'var(--color-accent-text)' }}>£{EXPERT.monthEarnings.toFixed(0)} this month</span>
        </div>
      </div>

      {/* Earnings breakdown */}
      <div className="rounded-3xl p-5 border mb-4" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--color-slate-400)' }}>Payout rates</p>
        <div className="space-y-2">
          <Row label="Chat (Senior VP)" value="£32.00 per session" />
          <Row label="Call (Senior VP)" value="£90.00 per call" />
          <div className="h-px my-2" style={{ background: 'var(--color-slate-700)' }} />
          <Row label="Platform fee" value="28% of client price" />
        </div>
      </div>

      {/* Credentials */}
      <div className="rounded-3xl p-5 border mb-4" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <p className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--color-slate-400)' }}>Verified credentials</p>
        <div className="space-y-3">
          {[
            { label: 'LLB Law (Hons)', sub: 'University of Leeds, 2014' },
            { label: 'Solicitor (non-practising)', sub: 'SRA — lapsed 2021, academic reference verified' },
            { label: 'Immigration casework experience', sub: '6 years — OISC Level 3 equivalent' },
          ].map((cred) => (
            <div key={cred.label} className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="var(--color-accent)" strokeWidth="1.4" />
                <path d="M5.5 8l2 2 3-3" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-[12px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>{cred.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-slate-400)' }}>{cred.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: 'var(--color-slate-800)' }}>
        <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--color-slate-200)' }}>Quality metrics</p>
        <div className="space-y-1.5 mt-2">
          <Row label="Client satisfaction" value="98%" />
          <Row label="Response within 2 min" value="94%" />
          <Row label="Substantiated complaints" value="0" />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExpertDashboard() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<ExpertScreen>('home')
  const [available, setAvailable] = useState(
    () => localStorage.getItem('specialist.expert.available') !== 'false'
  )
  const [crossTier, setCrossTier] = useState(
    () => localStorage.getItem('specialist.expert.crossTier') === 'true'
  )
  const [pendingRequests, setPendingRequests] = useState<DummyRequest[]>(INITIAL_REQUESTS)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>(() => [
    {
      id: 'req-1',
      category: 'Immigration',
      payout: 32,
      messages: SCENARIOS['req-1'].chat,
      brief: SCENARIOS['req-1'].brief,
      briefUnseen: true,
      clientTyping: false,
      repliesDelivered: 0,
      awaitingClient: false,
      unread: true,
    },
  ])
  const [openConsultationId, setOpenConsultationId] = useState<string | null>(null)
  const [completedPayout, setCompletedPayout] = useState<number | null>(null)
  const [activeCalls, setActiveCalls] = useState<DummyCall[]>(DUMMY_CALLS)
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(HISTORY_ITEMS)
  const [monthEarnings, setMonthEarnings] = useState(EXPERT.monthEarnings)

  useEffect(() => {
    localStorage.setItem('specialist.expert.available', String(available))
  }, [available])

  useEffect(() => {
    localStorage.setItem('specialist.expert.crossTier', String(crossTier))
  }, [crossTier])

  // Lower-tier bookings are only offered to experts who opted in
  const visibleRequests = crossTier ? pendingRequests : pendingRequests.filter((r) => r.tier === EXPERT.tier)
  const hiddenCount = pendingRequests.length - visibleRequests.length

  const selectedRequest = pendingRequests.find((r) => r.id === selectedRequestId) ?? null
  const activeCall = activeCalls.find((c) => c.id === activeCallId) ?? null

  const showTabs = TAB_SCREENS.includes(screen)

  function handleBack() {
    if (screen === 'request-detail') { setScreen('requests'); return }
    if (screen === 'consultation') { setScreen('home'); return }
    if (screen === 'call-active') { setScreen('calls'); return }
    navigate('/expert')
  }

  // Lets follow-up timers know whether the expert is looking at that consultation
  const openConsultationRef = useRef<string | null>(null)
  useEffect(() => {
    openConsultationRef.current = screen === 'consultation' ? openConsultationId : null
  }, [screen, openConsultationId])

  const openConsultation = consultations.find((c) => c.id === openConsultationId) ?? null

  function updateConsultation(id: string, change: (c: Consultation) => Partial<Consultation>) {
    setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, ...change(c) } : c)))
  }

  function handleOpenConsultation(id: string) {
    setOpenConsultationId(id)
    updateConsultation(id, () => ({ unread: false }))
    setScreen('consultation')
  }

  function handleAcceptRequest() {
    if (!selectedRequest) return
    const scenario = SCENARIOS[selectedRequest.id]
    setConsultations((prev) => [
      ...prev,
      {
        id: selectedRequest.id,
        category: selectedRequest.category,
        payout: selectedRequest.payout,
        messages: scenario.chat,
        brief: scenario.brief,
        briefUnseen: true,
        clientTyping: false,
        repliesDelivered: 0,
        awaitingClient: false,
        unread: false,
      },
    ])
    setPendingRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
    setOpenConsultationId(selectedRequest.id)
    setScreen('consultation')
  }

  function handleDeclineRequest() {
    if (!selectedRequest) return
    setPendingRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
    setScreen('requests')
  }

  function handleCompleteConsultation() {
    if (!openConsultation) return
    const { id, category, payout } = openConsultation
    setConsultations((prev) => prev.filter((c) => c.id !== id))
    setOpenConsultationId(null)
    setCompletedPayout(payout)
    setMonthEarnings((prev) => prev + payout)
    setHistoryItems((prev) => [
      {
        id: `h-new-${Date.now()}`,
        category,
        querySnippet: SCENARIOS[id].historySnippet,
        payout,
        daysAgo: 0,
        rating: 5,
        review: 'Awaiting client review.',
        format: 'Chat',
      },
      ...prev,
    ])
  }

  function handleSend(text: string) {
    if (!openConsultation) return
    const { id, repliesDelivered, awaitingClient } = openConsultation
    const reply = SCENARIOS[id].replies[repliesDelivered]
    const scheduleReply = reply !== undefined && !awaitingClient
    updateConsultation(id, (c) => ({
      messages: [...c.messages, { from: 'expert', text }],
      awaitingClient: c.awaitingClient || scheduleReply,
    }))
    if (!scheduleReply) return
    setTimeout(() => updateConsultation(id, () => ({ clientTyping: true })), 2500)
    setTimeout(() => {
      updateConsultation(id, (c) => ({
        clientTyping: false,
        awaitingClient: false,
        repliesDelivered: c.repliesDelivered + 1,
        messages: [...c.messages, { from: 'client', text: reply.text }],
        unread: openConsultationRef.current !== id,
      }))
    }, 4500)
    setTimeout(() => {
      updateConsultation(id, (c) => ({ brief: withReplyBrief(c.brief, reply), briefUnseen: true }))
    }, 5000)
  }

  function handleJoinCall(id: string) {
    setActiveCallId(id)
    setScreen('call-active')
  }

  function handleEndCall() {
    if (!activeCall) return
    setActiveCalls((prev) => prev.filter((c) => c.id !== activeCallId))
    setMonthEarnings((prev) => prev + activeCall.payout)
    setActiveCallId(null)
    setScreen('calls')
  }

  return (
    <AppShell onHome={() => navigate('/expert')} onBack={handleBack}>
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {showTabs && (
          <WorkspaceTabs
            current={screen}
            pendingCount={visibleRequests.length}
            onSelect={setScreen}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            available={available}
            crossTier={crossTier}
            hiddenCount={hiddenCount}
            pendingRequests={visibleRequests}
            consultations={consultations}
            monthEarnings={monthEarnings}
            onAvailabilityChange={setAvailable}
            onCrossTierChange={setCrossTier}
            onGoRequests={() => setScreen('requests')}
            onOpenConsultation={handleOpenConsultation}
            onGoCalls={() => setScreen('calls')}
            onGoProfile={() => setScreen('profile')}
          />
        )}

        {screen === 'requests' && (
          <RequestsScreen
            requests={visibleRequests}
            consultations={consultations}
            onSelect={(id) => { setSelectedRequestId(id); setScreen('request-detail') }}
            onOpenConsultation={handleOpenConsultation}
          />
        )}

        {screen === 'request-detail' && selectedRequest && (
          <RequestDetailScreen
            request={selectedRequest}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
            onBack={() => setScreen('requests')}
          />
        )}

        {screen === 'consultation' && completedPayout !== null && (
          <ConsultationCompleteScreen
            payout={completedPayout}
            onDone={() => { setCompletedPayout(null); setScreen('home') }}
          />
        )}

        {screen === 'consultation' && completedPayout === null && openConsultation && (
          <ConsultationScreen
            key={openConsultation.id}
            consultation={openConsultation}
            onOpenBrief={() => updateConsultation(openConsultation.id, () => ({ briefUnseen: false }))}
            onSend={handleSend}
            onComplete={handleCompleteConsultation}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'calls' && (
          <CallsScreen
            calls={activeCalls}
            onJoin={handleJoinCall}
          />
        )}

        {screen === 'call-active' && activeCall && (
          <CallActiveScreen
            call={activeCall}
            onEnd={handleEndCall}
          />
        )}

        {screen === 'history' && (
          <HistoryScreen items={historyItems} />
        )}

        {screen === 'profile' && (
          <ProfileScreen />
        )}
      </main>
    </AppShell>
  )
}

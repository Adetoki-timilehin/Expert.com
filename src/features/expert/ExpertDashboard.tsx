import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import LayeredMessage from '../../components/chat/LayeredMessage'

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

type ChatMessage = { from: 'client' | 'expert'; text: string; info?: string }

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
    id: 'req-1',
    category: 'Immigration',
    categoryShort: 'Immigration',
    query: "I'm on a Skilled Worker visa and my employer is threatening to terminate my contract. I need to understand whether losing this job would affect my visa status and what my options are — I've been here three years and have permanent residence in 18 months.",
    tier: 'Senior Verified Professional',
    payout: 32,
    receivedAgo: '6 min ago',
    urgency: 'Elevated',
  },
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

// ─── AI-prepared general information ─────────────────────────────────────────

const INITIAL_INFO = `Being told your role is "at risk" is not a notice of termination — you remain employed. Before any dismissal, your employer is expected to follow a fair process, including genuine consultation and objective selection criteria.

If sponsorship of a Skilled Worker visa ends, the visa is usually shortened to 60 days (or left at its existing expiry if that is sooner). That period starts when employment ends, not when you are told you are at risk.`

const FOLLOW_UP_CLIENT = "That's really helpful. Should I put something in writing to my employer now, or wait until they formally give me notice?"

const FOLLOW_UP_INFO = `ACAS guidance expects employers to consult with employees at risk of redundancy and explain how they were selected. Written requests create a record you can rely on later. Resigning, rather than being dismissed, can remove the ability to bring an unfair dismissal claim.`

const INITIAL_CHAT: ChatMessage[] = [
  {
    from: 'client',
    text: "I'm on a Skilled Worker visa and my employer is threatening to terminate my contract. I need to understand whether losing this job would affect my visa status and what my options are — I've been here three years and have permanent residence in 18 months.",
  },
  {
    from: 'expert',
    text: "Thank you for getting in touch. A few questions before I advise: has your employer given you formal written notice, or is this verbal so far? And is it linked to a specific reason — redundancy, performance, or something else?",
  },
  {
    from: 'client',
    text: "It's been verbal so far — my manager told me in a meeting yesterday that my position is 'at risk'. Nothing in writing yet. They mentioned budget cuts but I'm the only person in my team being told this.",
  },
]

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
            className="flex-1 min-h-9 rounded-xl text-[10px] font-semibold transition-colors relative"
            style={{
              color: active ? 'var(--color-accent-text)' : 'var(--color-slate-400)',
              background: active ? 'var(--color-accent-soft)' : 'transparent',
            }}
          >
            {tab.label}
            {tab.id === 'requests' && pendingCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
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

// ─── HomeScreen ───────────────────────────────────────────────────────────────

function HomeScreen({
  available,
  pendingRequests,
  consultationActive,
  monthEarnings,
  onAvailabilityChange,
  onGoRequests,
  onGoConsultation,
  onGoCalls,
  onGoProfile,
}: {
  available: boolean
  pendingRequests: DummyRequest[]
  consultationActive: boolean
  monthEarnings: number
  onAvailabilityChange: (v: boolean) => void
  onGoRequests: () => void
  onGoConsultation: () => void
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

      {/* Active consultation */}
      {consultationActive && (
        <button
          type="button"
          onClick={onGoConsultation}
          className="w-full rounded-3xl p-5 mb-4 text-left border"
          style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-accent)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent)' }} />
            <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--color-accent-text)' }}>Active consultation</span>
          </div>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>Client is waiting for your reply</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-slate-400)' }}>Immigration — Skilled Worker visa risk</p>
          <p className="text-[11px] mt-3 font-semibold" style={{ color: 'var(--color-accent-text)' }}>Open consultation →</p>
        </button>
      )}

      {/* Pending requests preview */}
      {pendingRequests.length > 0 && !consultationActive && (
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
            <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>Top payout</span>
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
  consultationActive,
  onSelect,
  onGoConsultation,
}: {
  requests: DummyRequest[]
  consultationActive: boolean
  onSelect: (id: string) => void
  onGoConsultation: () => void
}) {
  if (requests.length === 0 && !consultationActive) {
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

      {consultationActive && (
        <button
          type="button"
          onClick={onGoConsultation}
          className="w-full rounded-3xl p-4 mb-5 text-left border"
          style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-accent)' }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent)' }} />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--color-accent-text)' }}>Active consultation in progress</span>
          </div>
          <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-slate-400)' }}>Immigration — Skilled Worker visa risk</p>
        </button>
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
              <div>
                <span className="text-[10px]" style={{ color: 'var(--color-slate-400)' }}>Tier: </span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--color-slate-200)' }}>{req.tier}</span>
              </div>
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
        <Row label="Expert tier booked" value={request.tier} />
        <Row label="Urgency assessment" value={request.urgency} />
        <Row label="Format" value="Secure text consultation" />
        <Row label="Expected duration" value="Up to 30 minutes" />
        <Row label="Your payout" value={`£${request.payout}.00`} />
      </div>

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

function ConsultationScreen({
  messages,
  draftInfo,
  clientTyping,
  onSend,
  onComplete,
  onBack,
}: {
  messages: ChatMessage[]
  draftInfo: string | null
  clientTyping: boolean
  onSend: (advice: string, info: string | null) => void
  onComplete: () => void
  onBack: () => void
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [advice, setAdvice] = useState('')
  const [info, setInfo] = useState(draftInfo ?? '')
  const [includeInfo, setIncludeInfo] = useState(draftInfo !== null)

  useEffect(() => {
    setInfo(draftInfo ?? '')
    setIncludeInfo(draftInfo !== null)
  }, [draftInfo])

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [messages, clientTyping])

  const hasInfo = draftInfo !== null && includeInfo && info.trim().length > 0

  function send() {
    if (!advice.trim()) return
    onSend(advice.trim(), hasInfo ? info.trim() : null)
    setAdvice('')
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-fade-in">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 py-3 border-b"
        style={{ borderColor: 'var(--color-slate-700)', background: 'var(--color-ground-deep)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="min-h-10 px-2 text-[11px] font-semibold" style={{ color: 'var(--color-slate-400)' }}>Back</button>
          <div className="text-center min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>Active consultation</p>
            <p className="text-[10px]" style={{ color: 'var(--color-slate-400)' }}>Immigration</p>
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

      {/* Request summary */}
      <div className="flex-shrink-0 px-5 py-3" style={{ background: 'var(--color-accent-soft)' }}>
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--color-accent-text)' }}>Request summary</p>
        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--color-slate-400)' }}>
          Skilled Worker visa risk — employer threatening contract termination, 3 years in UK, PR in 18 months
        </p>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'expert' ? 'justify-end' : 'justify-start'}`}>
            {msg.info ? (
              <div className="max-w-[88%]">
                <LayeredMessage advice={msg.text} info={msg.info} expertFirstName={EXPERT.firstName} tone="sent" />
              </div>
            ) : (
              <div
                className="max-w-[84%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
                style={{
                  background: msg.from === 'expert' ? 'var(--color-accent)' : 'var(--color-slate-900)',
                  color: msg.from === 'expert' ? 'white' : 'var(--color-slate-200)',
                }}
              >
                {msg.text}
              </div>
            )}
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
      <div className="flex-shrink-0 border-t px-4 pt-3 pb-3 space-y-2.5" style={{ borderColor: 'var(--color-slate-700)', background: 'var(--color-ground-base)' }}>
        {draftInfo !== null && includeInfo && (
          <div className="rounded-xl border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--color-slate-400)' }}>
                General information · AI-prepared
              </span>
              <button
                type="button"
                onClick={() => setIncludeInfo(false)}
                className="text-[10px] font-semibold"
                style={{ color: 'var(--color-slate-400)' }}
              >
                Remove
              </button>
            </div>
            <textarea
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              rows={3}
              aria-label="AI-prepared general information"
              className="w-full px-3 pt-1.5 pb-2.5 text-[11px] leading-relaxed resize-none outline-none bg-transparent"
              style={{ color: 'var(--color-slate-200)' }}
            />
          </div>
        )}
        {draftInfo !== null && !includeInfo && (
          <button
            type="button"
            onClick={() => setIncludeInfo(true)}
            className="text-[10px] font-semibold"
            style={{ color: 'var(--color-accent-text)' }}
          >
            + Include AI-prepared general information
          </button>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            rows={hasInfo ? 3 : 1}
            placeholder={hasInfo ? 'Your advice for this client — appears under your name' : 'Reply to the client…'}
            aria-label="Your advice"
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
            disabled={!advice.trim()}
            aria-label="Send message"
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{ background: 'var(--color-accent)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M14 8L2 2l3 6-3 6z" fill="white" />
            </svg>
          </button>
        </div>
        {hasInfo && (
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-slate-600)' }}>
            The client sees your advice first, with the general information below it, labelled as AI-prepared and checked by you.
          </p>
        )}
      </div>
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
  const [pendingRequests, setPendingRequests] = useState<DummyRequest[]>(INITIAL_REQUESTS)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [consultationActive, setConsultationActive] = useState(false)
  const [consultationComplete, setConsultationComplete] = useState(false)
  const [acceptedPayout, setAcceptedPayout] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT)
  const [draftInfo, setDraftInfo] = useState<string | null>(null)
  const [clientTyping, setClientTyping] = useState(false)
  const [followUpSent, setFollowUpSent] = useState(false)
  const [activeCalls, setActiveCalls] = useState<DummyCall[]>(DUMMY_CALLS)
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(HISTORY_ITEMS)
  const [monthEarnings, setMonthEarnings] = useState(EXPERT.monthEarnings)

  useEffect(() => {
    localStorage.setItem('specialist.expert.available', String(available))
  }, [available])

  const selectedRequest = pendingRequests.find((r) => r.id === selectedRequestId) ?? null
  const activeCall = activeCalls.find((c) => c.id === activeCallId) ?? null

  const showTabs = TAB_SCREENS.includes(screen)

  function handleBack() {
    if (screen === 'request-detail') { setScreen('requests'); return }
    if (screen === 'consultation') { setScreen('home'); return }
    if (screen === 'call-active') { setScreen('calls'); return }
    navigate('/expert')
  }

  function handleAcceptRequest() {
    if (!selectedRequest) return
    setAcceptedPayout(selectedRequest.payout)
    setPendingRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
    setConsultationActive(true)
    setDraftInfo(INITIAL_INFO)
    setScreen('consultation')
  }

  function handleDeclineRequest() {
    if (!selectedRequest) return
    setPendingRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
    setScreen('requests')
  }

  function handleCompleteConsultation() {
    setConsultationActive(false)
    setConsultationComplete(true)
    setMonthEarnings((prev) => prev + acceptedPayout)
    setHistoryItems((prev) => [
      {
        id: `h-new-${Date.now()}`,
        category: 'Immigration',
        querySnippet: 'Skilled Worker visa risk — employer threatening contract termination',
        payout: acceptedPayout,
        daysAgo: 0,
        rating: 5,
        review: 'Awaiting client review.',
        format: 'Chat',
      },
      ...prev,
    ])
    setScreen('consultation') // will show the complete screen
  }

  function handleSend(advice: string, info: string | null) {
    setChatMessages((prev) => [...prev, info ? { from: 'expert', text: advice, info } : { from: 'expert', text: advice }])
    setDraftInfo(null)
    if (!followUpSent) {
      setFollowUpSent(true)
      setTimeout(() => setClientTyping(true), 2500)
      setTimeout(() => {
        setClientTyping(false)
        setChatMessages((prev) => [...prev, { from: 'client', text: FOLLOW_UP_CLIENT }])
      }, 4500)
      setTimeout(() => {
        setDraftInfo(FOLLOW_UP_INFO)
      }, 5000)
    }
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
            pendingCount={pendingRequests.length}
            onSelect={setScreen}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            available={available}
            pendingRequests={pendingRequests}
            consultationActive={consultationActive}
            monthEarnings={monthEarnings}
            onAvailabilityChange={setAvailable}
            onGoRequests={() => setScreen('requests')}
            onGoConsultation={() => setScreen('consultation')}
            onGoCalls={() => setScreen('calls')}
            onGoProfile={() => setScreen('profile')}
          />
        )}

        {screen === 'requests' && (
          <RequestsScreen
            requests={pendingRequests}
            consultationActive={consultationActive}
            onSelect={(id) => { setSelectedRequestId(id); setScreen('request-detail') }}
            onGoConsultation={() => setScreen('consultation')}
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

        {screen === 'consultation' && consultationComplete && (
          <ConsultationCompleteScreen
            payout={acceptedPayout}
            onDone={() => { setConsultationComplete(false); setScreen('home') }}
          />
        )}

        {screen === 'consultation' && !consultationComplete && (
          <ConsultationScreen
            messages={chatMessages}
            draftInfo={draftInfo}
            clientTyping={clientTyping}
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

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import { categories, type CategoryId } from '../../data/categories'

type WorkspaceScreen = 'dashboard' | 'opportunity' | 'consultation' | 'earnings'
type ConsultationStatus = 'new' | 'active' | 'completed' | 'declined'

const validCategoryIds: CategoryId[] = ['plumber', 'medical', 'legal', 'career', 'immigration', 'financial', 'mental-health']

function getCategoryId(): CategoryId {
  const expertCategory = localStorage.getItem('specialist.expert.category') as CategoryId | null
  if (expertCategory && validCategoryIds.includes(expertCategory)) return expertCategory
  const clientCategory = localStorage.getItem('specialist.client.category') as CategoryId | null
  if (clientCategory && validCategoryIds.includes(clientCategory)) return clientCategory
  return 'legal'
}

export default function ExpertDashboard() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<WorkspaceScreen>('dashboard')
  const [available, setAvailable] = useState(() => localStorage.getItem('specialist.expert.available') !== 'false')
  const [status, setStatus] = useState<ConsultationStatus>(() => {
    // Derive from the shared consultation.status key so it resets when the client starts a new request
    const shared = localStorage.getItem('specialist.consultation.status')
    if (shared === 'completed') return 'completed'
    if (shared === 'active') return 'active'
    return 'new'
  })
  const category = categories[getCategoryId()]
  const requestText = localStorage.getItem('specialist.client.request') || category.landingQuery

  useEffect(() => {
    localStorage.setItem('specialist.expert.available', String(available))
  }, [available])

  function goBack() {
    if (screen === 'dashboard') {
      navigate('/expert')
      return
    }
    setScreen('dashboard')
  }

  return (
    <AppShell statusLabel="Verified Expert" onBack={goBack} onHome={() => navigate('/')}>
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {screen !== 'consultation' && (
          <WorkspaceTabs current={screen} onSelect={setScreen}/>
        )}
        {screen === 'dashboard' && (
          <Dashboard
            categoryId={category.id}
            available={available}
            status={status}
            requestText={requestText}
            onAvailabilityChange={setAvailable}
            onOpportunity={() => setScreen('opportunity')}
            onConsultation={() => setScreen('consultation')}
            onEarnings={() => setScreen('earnings')}
            onReset={() => setStatus('new')}
          />
        )}
        {screen === 'opportunity' && (
          <Opportunity
            categoryId={category.id}
            status={status}
            requestText={requestText}
            onAccept={() => {
              setStatus('active')
              localStorage.setItem('specialist.consultation.status', 'active')
              setScreen('consultation')
            }}
            onDecline={() => {
              setStatus('declined')
              setScreen('dashboard')
            }}
          />
        )}
        {screen === 'consultation' && (
          <ExpertConsultation
            categoryId={category.id}
            requestText={requestText}
            onBack={() => setScreen('dashboard')}
            onComplete={() => {
              setStatus('completed')
              localStorage.setItem('specialist.consultation.status', 'completed')
              localStorage.setItem('specialist.client.consultationComplete', 'true')
              setScreen('earnings')
            }}
          />
        )}
        {screen === 'earnings' && <Earnings status={status}/>}
      </main>
    </AppShell>
  )
}

function WorkspaceTabs({
  current,
  onSelect,
}: {
  current: WorkspaceScreen
  onSelect: (screen: WorkspaceScreen) => void
}) {
  const tabs: { id: WorkspaceScreen; label: string }[] = [
    { id: 'dashboard', label: 'Home' },
    { id: 'opportunity', label: 'Requests' },
    { id: 'earnings', label: 'Earnings' },
  ]

  return (
    <nav className="flex gap-1 px-5 pb-2 flex-shrink-0" aria-label="Expert workspace">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className="flex-1 min-h-9 rounded-xl text-[11px] font-semibold transition-colors"
          style={{
            color: current === tab.id ? 'var(--color-accent-text)' : 'var(--color-slate-400)',
            background: current === tab.id ? 'var(--color-accent-soft)' : 'transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

function Dashboard({
  categoryId,
  available,
  status,
  requestText,
  onAvailabilityChange,
  onOpportunity,
  onConsultation,
  onEarnings,
  onReset,
}: {
  categoryId: CategoryId
  available: boolean
  status: ConsultationStatus
  requestText: string
  onAvailabilityChange: (value: boolean) => void
  onOpportunity: () => void
  onConsultation: () => void
  onEarnings: () => void
  onReset: () => void
}) {
  const category = categories[categoryId]

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-6">
        <p className="text-[11px] uppercase tracking-wide text-[var(--color-slate-400)]">Good morning, Alex</p>
        <h1 className="font-display text-[32px] text-[var(--color-slate-100)]">Expert dashboard</h1>
      </div>

      <div className="rounded-3xl p-5 mb-4 flex items-center justify-between bg-[var(--color-slate-900)] border border-[var(--color-slate-700)]">
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-slate-100)]">Available for requests</p>
          <p className="text-[10px] mt-1 text-[var(--color-slate-400)]">
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
          <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${available ? 'translate-x-5' : 'translate-x-0'}`}/>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <button type="button" onClick={onEarnings} className="rounded-2xl p-4 text-left bg-[var(--color-slate-900)] border border-[var(--color-slate-700)]">
          <span className="block text-[10px] uppercase tracking-wide text-[var(--color-slate-400)]">This month</span>
          <span className="block font-display text-[26px] mt-1 text-[var(--color-slate-100)]">
            {status === 'completed' ? '£17.50' : '£0.00'}
          </span>
          <span className="block text-[10px] text-[var(--color-accent-text)]">View earnings</span>
        </button>
        <div className="rounded-2xl p-4 bg-[var(--color-slate-900)] border border-[var(--color-slate-700)]">
          <span className="block text-[10px] uppercase tracking-wide text-[var(--color-slate-400)]">Profile</span>
          <span className="block font-display text-[26px] mt-1 text-[var(--color-slate-100)]">100%</span>
          <span className="block text-[10px] text-[var(--color-accent-text)]">Verified</span>
        </div>
      </div>

      {status === 'new' && (
        <button
          type="button"
          onClick={onOpportunity}
          className="w-full rounded-3xl p-5 text-left border bg-[var(--color-accent-soft)] border-[var(--color-accent-border)]"
        >
          <span className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-[var(--color-accent-text)]">New consultation request</span>
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"/>
          </span>
          <span className="block text-[15px] font-semibold mb-2 text-[var(--color-slate-100)]">{category.shortName}</span>
          <span className="block text-[12px] leading-relaxed mb-4 text-[var(--color-slate-400)]">{requestText}</span>
          <span className="flex items-center justify-between pt-3 border-t border-[var(--color-accent-border)]">
            <span className="text-[11px] text-[var(--color-slate-400)]">Expert payout</span>
            <span className="text-[13px] font-bold text-[var(--color-accent-text)]">£17.50</span>
          </span>
        </button>
      )}

      {status === 'active' && (
        <button type="button" onClick={onConsultation} className="w-full rounded-3xl p-5 text-left border bg-[var(--color-slate-900)] border-[var(--color-accent)]">
          <span className="text-[10px] uppercase tracking-wide font-semibold text-[var(--color-accent-text)]">Active consultation</span>
          <span className="block text-[15px] font-semibold mt-2 text-[var(--color-slate-100)]">Client is waiting</span>
          <span className="block text-[12px] mt-1 text-[var(--color-slate-400)]">Open the secure workspace to continue.</span>
        </button>
      )}

      {(status === 'completed' || status === 'declined') && (
        <div className="rounded-3xl p-5 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
          <p className="text-[13px] font-semibold text-[var(--color-slate-100)]">
            {status === 'completed' ? 'Consultation completed' : 'Request declined'}
          </p>
          <p className="text-[11px] mt-1 text-[var(--color-slate-400)]">
            {status === 'completed' ? 'Your payout is being processed.' : 'You will not be penalised for declining work outside your scope.'}
          </p>
          <button type="button" onClick={onReset} className="mt-4 text-[11px] font-semibold text-[var(--color-accent-text)]">
            Reset demo request
          </button>
        </div>
      )}

      <div className="rounded-2xl p-4 mt-5 bg-[var(--color-slate-800)]">
        <p className="text-[11px] font-semibold text-[var(--color-slate-200)]">Verification current</p>
        <p className="text-[10px] mt-1 text-[var(--color-slate-400)]">Next document review due in 94 days.</p>
      </div>
    </div>
  )
}

function Opportunity({
  categoryId,
  status,
  requestText,
  onAccept,
  onDecline,
}: {
  categoryId: CategoryId
  status: ConsultationStatus
  requestText: string
  onAccept: () => void
  onDecline: () => void
}) {
  const category = categories[categoryId]

  if (status !== 'new') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center bg-[var(--color-slate-800)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10h12M10 4v12" stroke="var(--color-slate-400)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-[17px] font-semibold text-[var(--color-slate-100)]">No new requests</h2>
        <p className="text-[12px] mt-2 text-[var(--color-slate-400)]">Eligible opportunities will appear here when you are available.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in flex flex-col">
      <div className="pt-2 pb-6">
        <p className="text-[11px] uppercase tracking-wide text-[var(--color-accent-text)]">Respond within 4 minutes</p>
        <h1 className="font-display text-[30px] text-[var(--color-slate-100)]">Review request</h1>
      </div>
      <div className="rounded-3xl p-5 border mb-4 bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <span className="inline-flex rounded-full px-3 py-1.5 mb-4 text-[10px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]">{category.name}</span>
        <p className="text-[13px] leading-[1.65] text-[var(--color-slate-200)]">{requestText}</p>
      </div>
      <div className="rounded-2xl p-4 mb-4 space-y-3 bg-[var(--color-slate-800)]">
        <Detail label="Urgency" value={categoryId === 'plumber' ? 'Now' : 'This week'}/>
        <Detail label="Format" value="Secure text consultation"/>
        <Detail label="Expected duration" value="Up to 30 minutes"/>
        <Detail label="Your payout" value="£17.50"/>
      </div>
      <p className="text-[10px] leading-relaxed mb-5 text-[var(--color-slate-600)]">
        Only accept requests that are within your verified competence. Declining an unsuitable request does not affect your profile.
      </p>
      <button type="button" onClick={onDecline} className="w-full min-h-11 rounded-2xl mb-3 border border-[var(--color-slate-700)] text-[12px] font-semibold text-[var(--color-slate-400)]">
        Decline request
      </button>
      <button type="button" onClick={onAccept} className="w-full min-h-13 mt-auto rounded-2xl bg-[var(--color-accent)] text-white text-[14px] font-semibold">
        Accept consultation · £17.50
      </button>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] text-[var(--color-slate-400)]">{label}</span>
      <span className="text-[11px] font-semibold text-right text-[var(--color-slate-200)]">{value}</span>
    </div>
  )
}

function ExpertConsultation({
  categoryId,
  requestText,
  onBack,
  onComplete,
}: {
  categoryId: CategoryId
  requestText: string
  onBack: () => void
  onComplete: () => void
}) {
  const category = categories[categoryId]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { from: 'client', text: requestText },
  ])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function send() {
    if (!input.trim()) return
    setMessages((current) => [...current, { from: 'expert', text: input.trim() }])
    setInput('')
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-fade-in">
      <div className="flex-shrink-0 px-5 py-3 border-b border-[var(--color-slate-700)] bg-[var(--color-ground-deep)]">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="min-h-10 px-2 text-[11px] font-semibold text-[var(--color-slate-400)]">Back</button>
          <div className="text-center min-w-0">
            <p className="text-[13px] font-semibold text-[var(--color-slate-100)]">Client consultation</p>
            <p className="text-[10px] truncate text-[var(--color-slate-400)]">{category.shortName}</p>
          </div>
          <button type="button" onClick={onComplete} className="min-h-10 px-3 rounded-xl text-[11px] font-semibold bg-[var(--color-slate-800)] text-[var(--color-slate-200)]">Complete</button>
        </div>
      </div>
      <div className="flex-shrink-0 px-5 py-3 bg-[var(--color-accent-soft)]">
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-1 text-[var(--color-accent-text)]">Request summary</p>
        <p className="text-[11px] leading-relaxed line-clamp-2 text-[var(--color-slate-400)]">{requestText}</p>
      </div>
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.from === 'expert' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[84%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
              style={{
                background: message.from === 'expert' ? 'var(--color-accent)' : 'var(--color-slate-900)',
                color: message.from === 'expert' ? 'white' : 'var(--color-slate-200)',
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-shrink-0 flex gap-2 px-4 py-3 bg-[var(--color-ground-base)]">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && send()}
          placeholder="Reply to the client…"
          aria-label="Reply to the client"
          className="flex-1 min-w-0 h-11 rounded-2xl px-4 outline-none text-[13px] bg-[var(--color-ground-deep)] text-[var(--color-slate-100)] border border-[var(--color-slate-700)] focus:border-[var(--color-accent)]"
        />
        <button type="button" onClick={send} disabled={!input.trim()} aria-label="Send message" className="w-11 h-11 rounded-full bg-[var(--color-accent)] disabled:opacity-40 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M14 8L2 2l3 6-3 6z" fill="white"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function Earnings({ status }: { status: ConsultationStatus }) {
  const hasEarnings = status === 'completed'

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-7">
        <p className="text-[11px] uppercase tracking-wide text-[var(--color-slate-400)]">Expert payouts</p>
        <h1 className="font-display text-[32px] text-[var(--color-slate-100)]">Earnings</h1>
      </div>
      <div className="rounded-3xl p-6 mb-4 bg-[var(--color-slate-900)] border border-[var(--color-slate-700)]">
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-slate-400)]">Available balance</p>
        <p className="font-display text-[46px] leading-none mt-3 text-[var(--color-slate-100)]">
          {hasEarnings ? '£17.50' : '£0.00'}
        </p>
        <p className="text-[10px] mt-3 text-[var(--color-slate-600)]">Paid to your verified bank account weekly</p>
      </div>
      {hasEarnings ? (
        <div className="rounded-2xl p-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[var(--color-slate-100)]">Text consultation</span>
            <span className="text-[13px] font-bold text-[var(--color-accent-text)]">£17.50</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--color-slate-600)]">Today</span>
            <span className="rounded-full px-2 py-1 text-[9px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]">Pending payout</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 text-center bg-[var(--color-slate-800)]">
          <p className="text-[12px] font-semibold text-[var(--color-slate-200)]">No earnings yet</p>
          <p className="text-[10px] mt-1 text-[var(--color-slate-400)]">Completed consultations will appear here.</p>
        </div>
      )}
      <div className="rounded-2xl p-4 mt-5 bg-[var(--color-slate-800)]">
        <Detail label="Client price" value="£25.00"/>
        <div className="h-px my-3 bg-[var(--color-slate-700)]"/>
        <Detail label="Your consultation payout" value="£17.50"/>
        <div className="h-px my-3 bg-[var(--color-slate-700)]"/>
        <Detail label="Platform fee and VAT" value="£7.50"/>
      </div>
    </div>
  )
}

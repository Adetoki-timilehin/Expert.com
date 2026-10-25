import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import FeedbackPrompt from '../../components/feedback/FeedbackPrompt'
import { categories, categoryIds, getCategory, type CategoryDefinition, type CategoryId } from '../../data/categories'
import { classifyRequest, type ClassificationResult } from '../../lib/classifyRequest'
import { callPriceFor, eligibleTiersFor, lowestPriceFor, recommendTierFor, tiers, type ExpertTierId, type TierDefinition } from '../../data/tiers'
import { generateSlots, groupSlotsByDay, type CallSlot } from '../../data/availability'

/*
 * 60-30-10 Color Rule applied:
 *
 * 60% Dominant ground  → var(--color-ground-deep) / var(--color-ground-base)  (page shell + primary surfaces)
 * 30% Structural slate → var(--color-slate-900) / var(--color-slate-800) / var(--color-slate-700)  (cards, panels, borders)
 * 10% Calm accent      → var(--color-accent)  (ONLY: CTAs, active states, live indicators,
 *                                   checkmarks, progress arc)
 *
 * Saturation is dialed back ~20% from raw emerald so the accent reads as
 * "purposeful" rather than "urgent" — trust-building, not alarm-raising.
 */

type Screen = 'landing' | 'confirm' | 'pricing' | 'matching' | 'match' | 'chat' | 'complete' | 'history' | 'call-slots' | 'call-confirm' | 'call-upcoming' | 'call-active' | 'call-complete'

const clientScreens: Screen[] = ['landing', 'confirm', 'pricing', 'matching', 'match', 'chat', 'complete', 'history', 'call-slots', 'call-confirm', 'call-upcoming', 'call-active', 'call-complete']

function getInitialClientScreen(): Screen {
  const saved = localStorage.getItem('specialist.client.screen')
  const completed = localStorage.getItem('specialist.consultation.status') === 'completed'
    || localStorage.getItem('specialist.client.consultationComplete') === 'true'
  if (completed && (saved === 'chat' || saved === 'match' || saved === 'matching')) {
    return 'complete'
  }
  return clientScreens.includes(saved as Screen) ? saved as Screen : 'landing'
}

function getInitialCategoryId(): CategoryId {
  const saved = localStorage.getItem('specialist.client.category') as CategoryId | null
  return saved && categoryIds.includes(saved) ? saved : 'legal'
}

export default function ClientDemo() {
  const [screen, setScreen] = useState<Screen>(getInitialClientScreen)
  const [categoryId, setCategoryId] = useState<CategoryId>(getInitialCategoryId)
  const [requestText, setRequestText] = useState(() =>
    localStorage.getItem('specialist.client.request') || ''
  )
  const [classification, setClassification] = useState<ClassificationResult>(
    () => classifyRequest(requestText, categoryId)
  )
  const [urgency, setUrgency] = useState('This week')
  const [selectedTierId, setSelectedTierId] = useState<ExpertTierId>(
    () => (localStorage.getItem('specialist.client.tier') as ExpertTierId | null) ?? 'verified-professional'
  )
  const [consultationComplete, setConsultationComplete] = useState(
    () => localStorage.getItem('specialist.client.consultationComplete') === 'true'
      || localStorage.getItem('specialist.consultation.status') === 'completed'
  )
  const [chatReturnScreen, setChatReturnScreen] = useState<'match' | 'history'>(
    () => localStorage.getItem('specialist.client.chatReturn') === 'history' ? 'history' : 'match'
  )
  const [callSlot, setCallSlot] = useState<CallSlot | null>(null)
  const [callFromChat, setCallFromChat] = useState(false)
  const navigate = useNavigate()
  const category = getCategory(categoryId)

  useEffect(() => {
    localStorage.setItem('specialist.client.screen', screen)
  }, [screen])

  useEffect(() => {
    localStorage.setItem('specialist.client.category', categoryId)
    localStorage.setItem('specialist.client.request', requestText)
  }, [categoryId, requestText])

  useEffect(() => {
    localStorage.setItem('specialist.client.chatReturn', chatReturnScreen)
  }, [chatReturnScreen])

  useEffect(() => {
    localStorage.setItem('specialist.client.tier', selectedTierId)
  }, [selectedTierId])

  function goBack() {
    if (screen === 'chat') {
      setScreen(chatReturnScreen)
      return
    }
    const previousScreen: Record<Screen, Screen | null> = {
      landing: null,
      confirm: 'landing',
      pricing: 'confirm',
      matching: 'pricing',
      match: 'pricing',
      chat: null,
      complete: 'history',
      history: 'landing',
      'call-slots': callFromChat ? 'chat' : 'match',
      'call-confirm': 'call-slots',
      'call-upcoming': 'history',
      'call-active': null,
      'call-complete': 'history',
    }
    const previous = previousScreen[screen]
    if (previous) {
      setScreen(previous)
      return
    }
    navigate('/')
  }

  return (
    <AppShell onBack={goBack} onHome={() => setScreen('landing')}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {screen === 'landing' && (
          <LandingScreen
            initialCategory={categoryId}
            initialQuery={requestText}
            onHistory={() => setScreen('history')}
            onNext={(nextCategory, query) => {
              setRequestText(query)
              const result = classifyRequest(query, nextCategory)
              setClassification(result)
              setCategoryId(result.categoryId)
              setUrgency(categories[result.categoryId].defaultUrgency)
              setScreen('confirm')
            }}
          />
        )}
        {screen === 'confirm' && (
          <ConfirmScreen
            classification={classification}
            categoryId={categoryId}
            question={requestText}
            urgency={urgency}
            onSelectCategory={(nextCategory) => {
              setCategoryId(nextCategory)
              setClassification(classifyRequest(requestText, nextCategory))
              setUrgency(categories[nextCategory].defaultUrgency)
            }}
            onQuestionChange={setRequestText}
            onUrgencyChange={setUrgency}
            onNext={() => setScreen('pricing')}
          />
        )}
        {screen === 'pricing' && (
          <PricingScreen
            category={category}
            categoryId={categoryId}
            classification={classification}
            tierId={selectedTierId}
            onTierChange={setSelectedTierId}
            onNext={() => setScreen('matching')}
          />
        )}
        {screen === 'matching' && (
          <MatchingScreen
            category={category}
            tierId={selectedTierId}
            onNext={() => setScreen('match')}
          />
        )}
        {screen === 'match' && (
          <MatchConfirmationScreen
            category={category}
            tierId={selectedTierId}
            onRematch={() => setScreen('matching')}
            onStartChat={() => {
              setChatReturnScreen('match')
              setScreen('chat')
            }}
            onScheduleCall={() => {
              setCallFromChat(false)
              setScreen('call-slots')
            }}
          />
        )}
        {screen === 'chat' && (
          <ChatScreen
            category={category}
            tierId={selectedTierId}
            onBookCall={() => {
              setCallFromChat(true)
              setScreen('call-slots')
            }}
            onComplete={() => {
              setConsultationComplete(true)
              localStorage.setItem('specialist.client.consultationComplete', 'true')
              setScreen('complete')
            }}
          />
        )}
        {screen === 'call-slots' && (
          <CallSlotsScreen
            category={category}
            tierId={selectedTierId}
            fromChat={callFromChat}
            onSelect={(slot) => {
              setCallSlot(slot)
              setScreen('call-confirm')
            }}
          />
        )}
        {screen === 'call-confirm' && callSlot && (
          <CallConfirmScreen
            category={category}
            tierId={selectedTierId}
            slot={callSlot}
            fromChat={callFromChat}
            onNext={() => setScreen('call-upcoming')}
          />
        )}
        {screen === 'call-upcoming' && callSlot && (
          <CallUpcomingScreen
            category={category}
            tierId={selectedTierId}
            slot={callSlot}
            onJoin={() => setScreen('call-active')}
          />
        )}
        {screen === 'call-active' && (
          <CallActiveScreen
            category={category}
            tierId={selectedTierId}
            onComplete={() => setScreen('call-complete')}
          />
        )}
        {screen === 'call-complete' && (
          <CallCompleteScreen
            category={category}
            onHistory={() => setScreen('history')}
            onHome={() => setScreen('landing')}
          />
        )}
        {screen === 'complete' && (
          <ConsultationCompleteScreen
            category={category}
            tierId={selectedTierId}
            onHistory={() => setScreen('history')}
            onHome={() => setScreen('landing')}
          />
        )}
        {screen === 'history' && (
          <ConsultationHistoryScreen
            category={category}
            tierId={selectedTierId}
            complete={consultationComplete}
            onOpen={() => {
              if (consultationComplete) {
                setScreen('complete')
                return
              }
              setChatReturnScreen('history')
              setScreen('chat')
            }}
            onNewRequest={() => setScreen('landing')}
          />
        )}
      </div>
    </AppShell>
  )
}

// ─── Shared atoms ──────────────────────────────────────────────────────────────

/** Accent CTA button — the 10% accent in its primary form */
function AccentBtn({
  children, onClick, disabled = false, className = '',
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[15px] py-4 rounded-2xl transition-colors duration-200 flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  )
}

/** Progress track — completed segments use accent, pending use structural */
function ProgressTrack({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex gap-1.5 mb-7">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-colors duration-300"
          style={{ background: i < done ? 'var(--color-accent)' : 'var(--color-slate-800)' }}
        />
      ))}
    </div>
  )
}

// ─── Screen 1: Landing ────────────────────────────────────────────────────────

const categoryGridLabel: Record<CategoryId, string> = {
  plumber: 'Home & property',
  medical: 'Medical',
  legal: 'Legal',
  career: 'Career',
  immigration: 'Immigration',
  financial: 'Finance',
  'mental-health': 'Mental health',
}

function LandingScreen({
  initialCategory,
  initialQuery,
  onHistory,
  onNext,
}: {
  initialCategory: CategoryId
  initialQuery: string
  onHistory: () => void
  onNext: (category: CategoryId, query: string) => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(initialCategory)

  function selectCategory(id: CategoryId) {
    setSelectedCategory(id)
    setQuery(categories[id].landingQuery)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 pt-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[var(--color-slate-400)] text-[11px] font-semibold tracking-[0.14em] uppercase">
            UK-Verified Experts · 24/7
          </p>
          <button
            type="button"
            onClick={onHistory}
            className="min-h-10 px-3 rounded-xl text-[11px] font-semibold text-[var(--color-slate-400)] bg-[var(--color-slate-900)] border border-[var(--color-slate-700)]"
          >
            Consultations
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['Identity checked', 'UK based', 'Encrypted'].map((b) => (
            <div
              key={b}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 border"
              style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
            >
              <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4l2 2 3-3" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[var(--color-slate-200)] text-[10px] font-medium">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category grid — tap to select and pre-fill */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-3 text-[var(--color-slate-400)]">
          What do you need help with?
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {categoryIds.map((id) => {
            const selected = selectedCategory === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectCategory(id)}
                aria-pressed={selected}
                className="rounded-2xl p-3 border text-left transition-colors flex items-center gap-2.5 min-h-[56px]"
                style={{
                  background: selected ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                  borderColor: selected ? 'var(--color-accent)' : 'var(--color-slate-700)',
                }}
              >
                <span
                  className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--color-slate-800)' }}
                >
                  <CategoryIcon category={id} />
                </span>
                <span className="text-[12px] font-semibold leading-snug text-[var(--color-slate-100)]">
                  {categoryGridLabel[id]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Text input */}
      <div className="relative mb-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your problem or question…"
          maxLength={500}
          rows={3}
          className="w-full text-[var(--color-slate-100)] text-[14px] leading-[1.65] rounded-2xl px-4 pt-4 pb-4 resize-none outline-none transition-colors duration-200"
          style={{
            background: 'var(--color-ground-deep)',
            border: '1px solid var(--color-slate-700)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-700)')}
        />
        <div className="absolute bottom-3 right-3 text-[11px]" style={{ color: 'var(--color-slate-600)' }}>
          {query.length}/500
        </div>
      </div>

      <AccentBtn onClick={() => onNext(selectedCategory, query)} disabled={!query.trim()}>
        Find an expert
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </AccentBtn>

      <p className="text-center text-[11px] mt-3" style={{ color: 'var(--color-slate-600)' }}>
        From £12 · No subscription required
      </p>
    </div>
  )
}

function CategoryIcon({ category }: { category: CategoryId }) {
  const shared = {
    stroke: 'var(--color-slate-200)',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (category === 'plumber') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 16l8-8M10 6l1.5-1.5a3 3 0 014.2 4.2L14 10.5" {...shared}/>
        <circle cx="5.5" cy="14.5" r="2" {...shared}/>
      </svg>
    )
  }
  if (category === 'medical') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 3v14M3 10h14" {...shared}/>
        <circle cx="10" cy="10" r="7" {...shared}/>
      </svg>
    )
  }
  if (category === 'legal') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 3v14M5 6h10M4 7l-2 5h4L4 7zM16 7l-2 5h4l-2-5zM6 17h8" {...shared}/>
      </svg>
    )
  }
  if (category === 'career') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM5 17c0-3 2-5 5-5" {...shared}/>
        <path d="M12 14l1.5 1.5L16 13" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (category === 'immigration') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7" {...shared}/>
        <path d="M10 3c-2 2-3 4.5-3 7s1 5 3 7M10 3c2 2 3 4.5 3 7s-1 5-3 7M3 10h14" {...shared}/>
      </svg>
    )
  }
  if (category === 'financial') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 4v2M10 14v2M6 8h4a2 2 0 010 4H7a2 2 0 000 4h6" {...shared}/>
        <circle cx="10" cy="10" r="7" {...shared}/>
      </svg>
    )
  }
  if (category === 'mental-health') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 17s-7-4.5-7-9a5 5 0 0110 0" {...shared}/>
        <path d="M13 8a3 3 0 014 4c0 2.5-2 4.5-4 6" {...shared}/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM5 17c0-3 2-5 5-5s5 2 5 5" {...shared}/>
    </svg>
  )
}

// ─── Shared badge ─────────────────────────────────────────────────────────────

function TierBadge({ tierId, size = 'sm' }: { tierId: ExpertTierId; size?: 'sm' | 'md' }) {
  const tier = tiers[tierId]
  const px = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5'
  const text = size === 'md' ? 'text-[11px]' : 'text-[10px]'

  if (tier.badge === 'outlined-supervised') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border ${px} ${text} font-semibold`}
        style={{ borderColor: 'var(--color-slate-600)', color: 'var(--color-slate-400)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full border border-current" />
        Supervised
      </span>
    )
  }
  if (tier.badge === 'slate') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full ${px} ${text} font-semibold`}
        style={{ background: 'var(--color-slate-800)', color: 'var(--color-slate-200)' }}
      >
        Academy
      </span>
    )
  }
  if (tier.badge === 'green-verified') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full ${px} ${text} font-semibold`}
        style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <circle cx="4.5" cy="4.5" r="4" fill="var(--color-accent)"/>
          <path d="M2.5 4.5l1.5 1.5 2.5-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Verified
      </span>
    )
  }
  // green-verified-senior
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${px} ${text} font-semibold`}
      style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}
    >
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <circle cx="4.5" cy="4.5" r="4" fill="var(--color-accent)"/>
        <path d="M2.5 4.5l1.5 1.5 2.5-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Senior Verified
    </span>
  )
}

// ─── Screen 2: Confirm ────────────────────────────────────────────────────────

function ConfirmScreen({
  classification,
  categoryId,
  question,
  urgency,
  onSelectCategory,
  onQuestionChange,
  onUrgencyChange,
  onNext,
}: {
  classification: ClassificationResult
  categoryId: CategoryId
  question: string
  urgency: string
  onSelectCategory: (category: CategoryId) => void
  onQuestionChange: (question: string) => void
  onUrgencyChange: (urgency: string) => void
  onNext: () => void
}) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const category = categories[categoryId]
  const emergencyNumber = classification.safetyMessage?.includes('0800 111 999') ? '0800111999' : '999'

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-slate-600)]">
          Step 1 of 2
        </p>
        <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
          Confirm your request
        </h2>
      </div>

      <ProgressTrack total={2} done={1}/>

      {classification.urgentSafetyFlag && (
        <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
          <p className="text-[11px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-slate-100)]">
            Urgent safety check
          </p>
          <p className="text-[11px] leading-relaxed mb-4 text-[var(--color-slate-400)]">{classification.safetyMessage}</p>
          <button
            type="button"
            onClick={() => { window.location.href = `tel:${emergencyNumber}` }}
            className="w-full min-h-11 rounded-2xl bg-[var(--color-accent)] text-white text-[12px] font-semibold"
          >
            Call {emergencyNumber === '999' ? '999' : 'gas emergency line'}
          </button>
        </div>
      )}

      {/* Category chip — tappable to reveal picker */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowCategoryPicker(!showCategoryPicker)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 border"
          style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent-border)' }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 5.5l2.5 2.5 4.5-5" stroke="var(--color-accent-text)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--color-logo-wordmark)' }}>
            {category.name}
          </span>
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            className={`transition-transform duration-200 ${showCategoryPicker ? 'rotate-180' : ''}`}
          >
            <path d="M2 4l3 3 3-3" stroke="var(--color-accent-text)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showCategoryPicker && (
          <div className="flex flex-wrap gap-2 mt-3">
            {categoryIds.map((cId) => (
              <button
                key={cId}
                type="button"
                onClick={() => { onSelectCategory(cId); setShowCategoryPicker(false) }}
                aria-pressed={categoryId === cId}
                className="min-h-9 rounded-xl px-3 text-[10px] font-semibold border"
                style={{
                  color: categoryId === cId ? 'white' : 'var(--color-slate-400)',
                  background: categoryId === cId ? 'var(--color-accent)' : 'var(--color-slate-900)',
                  borderColor: categoryId === cId ? 'var(--color-accent)' : 'var(--color-slate-700)',
                }}
              >
                {categories[cId].shortName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editable request */}
      <div className="mb-4">
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          rows={6}
          className="w-full text-[var(--color-slate-100)] text-[13.5px] leading-[1.65] rounded-2xl px-4 py-4 resize-none outline-none transition-colors duration-200"
          style={{ background: 'var(--color-ground-deep)', border: '1px solid var(--color-slate-700)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-700)')}
        />
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-slate-600)' }}>
          {question.length} characters
        </p>
      </div>

      {/* Urgency */}
      <div className="mb-4">
        <label className="text-[11px] font-medium uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-slate-400)' }}>
          When do you need help?
        </label>
        <div className="flex gap-2">
          {['Now', 'Today', 'This week'].map((u) => (
            <button
              key={u}
              onClick={() => onUrgencyChange(u)}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150"
              style={{
                background: urgency === u ? 'var(--color-accent)' : 'var(--color-slate-900)',
                borderColor: urgency === u ? 'var(--color-accent)' : 'var(--color-slate-700)',
                color: urgency === u ? 'white' : 'var(--color-slate-400)',
              }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {category.scopeNotice && (
        <p className="text-[10px] leading-relaxed mb-4 text-[var(--color-slate-600)]">{category.scopeNotice}</p>
      )}

      <div className="flex items-start gap-2 mb-6">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
          <path d="M7 1L3 2.5v4c0 3 1.8 5 4 5.5 2.2-.5 4-2.5 4-5.5v-4L7 1z" stroke="var(--color-slate-600)" strokeWidth="1.2"/>
        </svg>
        <p className="text-[11px] leading-relaxed text-[var(--color-slate-600)]">
          Only this request will be shared with eligible experts. Payment details stay private.
        </p>
      </div>

      <AccentBtn onClick={onNext} disabled={!question.trim()} className="mt-auto">
        {classification.urgentSafetyFlag ? 'Continue (not an emergency)' : 'Continue'}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </AccentBtn>
    </div>
  )
}

// ─── Screen 3: Pricing ────────────────────────────────────────────────────────

function PricingScreen({
  category,
  categoryId,
  classification,
  tierId,
  onTierChange,
  onNext,
}: {
  category: CategoryDefinition
  categoryId: CategoryId
  classification: ClassificationResult
  tierId: ExpertTierId
  onTierChange: (tierId: ExpertTierId) => void
  onNext: () => void
}) {
  const [agreed, setAgreed] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showTierPicker, setShowTierPicker] = useState(false)
  const tier = tiers[tierId]
  const vatAmount = +(tier.price - tier.price / 1.2).toFixed(2)
  const platformFee = +(tier.price / 1.2 - tier.expertPayout).toFixed(2)
  const complexity = classification.confidence >= 0.85 ? 'low' : classification.confidence >= 0.65 ? 'standard' : 'complex'
  const recommendedId = recommendTierFor(categoryId, complexity)
  const eligible = eligibleTiersFor(categoryId)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-slate-600)' }}>
          Step 2 of 2
        </p>
        <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
          Review &amp; authorise
        </h2>
      </div>

      <ProgressTrack total={2} done={2}/>

      {/* Inline tier selection */}
      <div className="rounded-2xl border mb-5" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <TierBadge tierId={tierId} size="md" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate text-[var(--color-slate-100)]">{tier.name}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>{tier.responseTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-display text-[20px] text-[var(--color-slate-100)] leading-none">£{tier.price}</span>
            {eligible.length > 1 && (
              <button
                type="button"
                onClick={() => setShowTierPicker(!showTierPicker)}
                className="text-[12px] font-semibold"
                style={{ color: 'var(--color-logo-wordmark)' }}
              >
                Change
              </button>
            )}
          </div>
        </div>

        {showTierPicker && (
          <div className="border-t px-4 pb-4 space-y-2" style={{ borderColor: 'var(--color-slate-800)' }}>
            <p className="text-[10px] uppercase tracking-wide font-semibold pt-3 mb-3" style={{ color: 'var(--color-slate-600)' }}>
              Choose Expert level
            </p>
            {eligible.map((t) => {
              const isSelected = t.id === tierId
              const isRecommended = t.id === recommendedId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { onTierChange(t.id); setShowTierPicker(false) }}
                  className="w-full rounded-xl p-3 border text-left transition-colors"
                  style={{
                    background: isSelected ? 'var(--color-accent-soft)' : 'var(--color-slate-800)',
                    borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-slate-700)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TierBadge tierId={t.id} />
                      <span className="text-[12px] font-semibold truncate text-[var(--color-slate-100)]">{t.name}</span>
                      {isRecommended && (
                        <span className="text-[9px] font-semibold rounded-full px-1.5 py-0.5 flex-shrink-0" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}>
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] font-semibold flex-shrink-0 text-[var(--color-slate-100)]">£{t.price}</span>
                  </div>
                  <p className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--color-slate-400)' }}>{t.suitableFor}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Price card */}
      <div
        className="rounded-3xl p-6 mb-5 border"
        style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-slate-400)' }}>
              Consultation fee
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[52px] text-[var(--color-slate-100)] leading-none">
                £{tier.price}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--color-slate-400)' }}>inc. VAT</span>
            </div>
          </div>
          <div
            className="rounded-2xl p-3 border"
            style={{ background: 'var(--color-slate-800)', borderColor: 'var(--color-slate-700)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="18" height="14" rx="3" stroke="var(--color-slate-400)" strokeWidth="1.6"/>
              <path d="M2 9h18" stroke="var(--color-slate-400)" strokeWidth="1.6"/>
              <circle cx="6.5" cy="13.5" r="1.5" fill="var(--color-slate-400)"/>
            </svg>
          </div>
        </div>

        {/* Call upgrade note */}
        {tier.callPrice && (
          <p className="text-[11px] mb-3 leading-snug" style={{ color: 'var(--color-slate-400)' }}>
            £{tier.price} chat · £{tier.callPrice} call{' '}
            <span style={{ color: 'var(--color-slate-600)' }}>(can upgrade from chat)</span>
          </p>
        )}

        {/* Not-charged-yet notice */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3" style={{ background: 'var(--color-slate-800)' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="var(--color-accent)" strokeWidth="1.3"/>
            <path d="M6.5 5.5v3M6.5 4.5h.01" stroke="var(--color-accent)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] leading-snug" style={{ color: 'var(--color-slate-300)' }}>
            Your card is not charged yet — only if you accept the match.
          </span>
        </div>

        {/* Collapsible fee breakdown */}
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-1.5 text-[11px] font-semibold mb-2"
          style={{ color: 'var(--color-logo-wordmark)' }}
        >
          {showBreakdown ? 'Hide breakdown' : 'See breakdown'}
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            className={`transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`}
          >
            <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showBreakdown && (
          <div className="space-y-2.5 pt-3 border-t" style={{ borderColor: 'var(--color-slate-800)' }}>
            {[
              { label: `Expert ${tier.name} (up to 30 min)`, value: `£${tier.expertPayout.toFixed(2)}` },
              { label: 'Platform fee',                        value: `£${platformFee.toFixed(2)}` },
              { label: 'VAT (20%)',                           value: `£${vatAmount.toFixed(2)}` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'var(--color-slate-400)' }}>{row.label}</span>
                <span className="text-[12px] font-medium" style={{ color: 'var(--color-slate-200)' }}>{row.value}</span>
              </div>
            ))}
            <div
              className="flex items-center justify-between pt-2.5 border-t"
              style={{ borderColor: 'var(--color-slate-800)' }}
            >
              <span className="text-[13px] font-semibold text-[var(--color-slate-100)]">Total (charged at match)</span>
              <span className="text-[15px] font-bold" style={{ color: 'var(--color-logo-wordmark)' }}>£{tier.price.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Refund guarantee */}
      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-5 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0">
          <path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M5.5 8l2 2 3-3" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-[12px] leading-snug" style={{ color: 'var(--color-slate-200)' }}>
          <strong style={{ color: 'var(--color-slate-100)' }}>Full refund</strong> if no suitable expert is found.
        </p>
      </div>

      {/* What's included */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--color-slate-900)' }}>
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-slate-400)' }}>
          What's included
        </p>
        <div className="space-y-2.5">
          {[
            category.includedExpert,
            'Secure, encrypted one-to-one chat session',
            'Written record of advice sent to your email',
            'Free follow-up within 24 hours if needed',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4l2 2 3-3" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[12px] leading-[1.5]" style={{ color: 'var(--color-slate-200)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Saved payment method */}
      <div
        className="rounded-2xl px-4 py-3.5 mb-5 flex items-center justify-between border"
        style={{ background: 'var(--color-ground-deep)', borderColor: 'var(--color-slate-700)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-6 bg-[#1a1f71] rounded-md flex items-center justify-center">
            <span className="text-white text-[9px] font-black tracking-tight">VISA</span>
          </div>
          <div>
            <p className="text-[var(--color-slate-100)] text-[13px] font-medium">Visa ending 4242</p>
            <p className="text-[11px]" style={{ color: 'var(--color-slate-600)' }}>Expires 09/27</p>
          </div>
        </div>
        <button className="text-[12px] font-semibold" style={{ color: 'var(--color-logo-wordmark)' }}>
          Change
        </button>
      </div>

      {/* Terms */}
      <button
        onClick={() => setAgreed(!agreed)}
        className="flex items-start gap-3 mb-6 text-left"
      >
        <div
          className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-150"
          style={{
            background:  agreed ? 'var(--color-accent)' : 'transparent',
            borderColor: agreed ? 'var(--color-accent)' : 'var(--color-slate-700)',
          }}
        >
          {agreed && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <p className="text-[12px] leading-[1.55]" style={{ color: 'var(--color-slate-400)' }}>
          I authorise Peasy to hold £{tier.price.toFixed(2)} on my card. Nothing is charged until I confirm my matched expert. I have read and agree to the{' '}
          <span className="underline" style={{ color: 'var(--color-logo-wordmark)' }}>Terms of Service</span> and{' '}
          <span className="underline" style={{ color: 'var(--color-logo-wordmark)' }}>Privacy Policy</span>.
        </p>
      </button>

      <AccentBtn onClick={onNext} disabled={!agreed} className="mt-auto">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="6" width="12" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
          <path d="M5 6V4.5a3 3 0 016 0V6" stroke="white" strokeWidth="1.6"/>
        </svg>
        Find my expert · £{tier.price} held
      </AccentBtn>
      <p className="text-center text-[11px] mt-3" style={{ color: 'var(--color-slate-600)' }}>
        Secured by Stripe · 256-bit TLS encryption
      </p>
    </div>
  )
}

// ─── Screen 5: Matching ───────────────────────────────────────────────────────

function MatchingScreen({
  category,
  tierId,
  onNext,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  onNext: () => void
}) {
  const [step, setStep] = useState(0)
  const tierName = tiers[tierId].name
  const matchingSteps = [
    'Authorising payment securely',
    `Searching ${tierName} ${category.matchingNoun}`,
    'Checking availability',
    'Confirming your match',
  ]

  useEffect(() => {
    const timers = matchingSteps.map((_, i) =>
      setTimeout(() => setStep(i + 1), 800 + i * 900)
    )
    const done = setTimeout(onNext, 800 + matchingSteps.length * 900 + 400)
    return () => { timers.forEach(clearTimeout); clearTimeout(done) }
  }, [onNext])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain items-center justify-center px-8 py-12 animate-fade-in">
      <div className="mb-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-accent)' }}
        >
          <svg width="36" height="36" viewBox="1 3 13 11" fill="none">
            <path d="M2 9C2 6.5 4.5 5 7.5 5s5.5 1.5 5.5 4-2.5 3.5-5.5 3.5S2 11.5 2 9z" stroke="#f5f2ee" strokeWidth="1.4"/>
            <circle className="pea-1" cx="5" cy="9" r="1.2" fill="#f5f2ee"/>
            <circle className="pea-2" cx="7.5" cy="8.5" r="1.2" fill="#f5f2ee"/>
            <circle className="pea-3" cx="10" cy="9" r="1.2" fill="#f5f2ee"/>
          </svg>
        </div>
      </div>

      <h2 className="font-display text-[28px] text-[var(--color-slate-100)] text-center leading-[1.2] mb-3">
        Finding your<br/>expert
      </h2>
      <p className="text-[14px] text-center leading-[1.6] mb-10 max-w-[240px]" style={{ color: 'var(--color-slate-400)' }}>
        {category.matchingDescription}
      </p>

      {/* Step list — completed steps use accent; pending steps are structural */}
      <div className="w-full space-y-3 mb-10">
        {matchingSteps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{
                background:  i < step ? 'var(--color-accent)' : i === step ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                border:      i === step ? '1px solid var(--color-accent)' : 'none',
              }}
            >
              {i < step ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : i === step ? (
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--color-accent)' }}
                />
              ) : null}
            </div>
            <span
              className="text-[13px] transition-colors duration-300"
              style={{
                color: i < step ? 'var(--color-accent-text)' : i === step ? 'var(--color-slate-100)' : 'var(--color-slate-600)',
              }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full dot-1" style={{ background: 'var(--color-accent)' }}/>
          <div className="w-2 h-2 rounded-full dot-2" style={{ background: 'var(--color-accent)' }}/>
          <div className="w-2 h-2 rounded-full dot-3" style={{ background: 'var(--color-accent)' }}/>
        </div>
        <span className="text-[12px]" style={{ color: 'var(--color-slate-600)' }}>Please wait</span>
      </div>

      <div className="mt-auto flex items-center gap-2">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M5.5 1L2 2.5v3c0 2.5 1.5 4 3.5 4s3.5-1.5 3.5-4v-3L5.5 1z" stroke="var(--color-slate-600)" strokeWidth="1.2"/>
        </svg>
        <span className="text-[11px]" style={{ color: 'var(--color-slate-600)' }}>Your data is encrypted end-to-end</span>
      </div>
    </div>
  )
}

// ─── Screen 6: Match confirmation ─────────────────────────────────────────────

function MatchConfirmationScreen({
  category,
  tierId,
  onRematch,
  onStartChat,
  onScheduleCall,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  onRematch: () => void
  onStartChat: () => void
  onScheduleCall: () => void
}) {
  const expert = category.expert
  const tier = tiers[tierId]

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-accent-text)]">
          Match confirmed
        </p>
        <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
          Your expert is ready
        </h2>
      </div>

      <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <img src={expert.image} alt={expert.name} className="w-16 h-16 rounded-2xl object-cover"/>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--color-slate-900)] bg-[var(--color-slate-700)] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold truncate text-[var(--color-slate-100)]">{expert.name}</h2>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[12px] text-[var(--color-slate-400)]">{expert.title}</p>
              <TierBadge tierId={tierId} />
            </div>
            <p className="text-[11px] font-medium text-[var(--color-accent-text)]">
              {expert.rating} · {expert.reviewCount}
            </p>
          </div>
        </div>

        <div className="rounded-2xl px-3 py-2 mb-4 flex items-center gap-2" style={{ background: 'var(--color-slate-800)' }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1L3 2.5v3c0 2.5 1.5 4 2.5 4s2.5-1.5 2.5-4v-3L5.5 1z" stroke="var(--color-slate-500)" strokeWidth="1"/>
          </svg>
          <span className="text-[10px]" style={{ color: 'var(--color-slate-400)' }}>
            Matched as: <strong style={{ color: 'var(--color-slate-200)' }}>{tier.name}</strong> · £{tier.price}
          </span>
        </div>

        <div className="rounded-2xl p-4 mb-4 bg-[var(--color-accent-soft)]">
          <p className="text-[10px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-accent-text)]">
            Why this match
          </p>
          <p className="text-[12px] leading-relaxed text-[var(--color-slate-200)]">{category.matchReason}</p>
        </div>

        <div className="space-y-3">
          {category.verificationItems.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--color-accent-soft)]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5l2 2 4-4" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="text-[12px] text-[var(--color-slate-200)]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl px-4 py-3 mb-5 bg-[var(--color-slate-800)]">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-slate-600)]">Response time</p>
          <p className="text-[12px] font-semibold text-[var(--color-slate-200)]">Usually within 2 minutes</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-accent-text)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"/>
          Online
        </span>
      </div>

      {/* Payment confirmation notice */}
      <div
        className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 border"
        style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
      >
        <div className="w-10 h-6 bg-[#1a1f71] rounded-md flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[9px] font-black tracking-tight">VISA</span>
        </div>
        <p className="text-[12px] leading-snug text-[var(--color-slate-100)]">
          Confirming will charge <strong>£{tier.price}</strong> to your Visa ending 4242.
        </p>
      </div>

      <button
        type="button"
        onClick={onRematch}
        className="w-full min-h-11 rounded-2xl mb-3 border border-[var(--color-slate-700)] text-[13px] font-semibold text-[var(--color-slate-400)]"
      >
        Request another match
      </button>
      <AccentBtn onClick={onStartChat}>
        Confirm &amp; pay £{tier.price} · Start chat
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="6" width="12" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
          <path d="M5 6V4.5a3 3 0 016 0V6" stroke="white" strokeWidth="1.6"/>
        </svg>
      </AccentBtn>
      {tier.callPrice && (
        <button
          type="button"
          onClick={onScheduleCall}
          className="w-full min-h-12 rounded-2xl mt-3 border text-[13px] font-semibold flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--color-slate-700)', color: 'var(--color-slate-200)', background: 'var(--color-slate-900)' }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 1v3M10 1v3M1 7h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Schedule a 30-min call — £{tier.callPrice}
        </button>
      )}
      {tier.callPrice && (
        <p className="text-center text-[11px] mt-2" style={{ color: 'var(--color-slate-600)' }}>
          Chat fee always counts toward a call
        </p>
      )}
    </div>
  )
}

// ─── Screen 7: Chat ───────────────────────────────────────────────────────────

function ChatScreen({
  category,
  tierId,
  onBookCall,
  onComplete,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  onBookCall: () => void
  onComplete: () => void
}) {
  const [input, setInput] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)
  const expert = category.expert
  const [messages, setMessages] = useState<{ from: 'user' | 'expert'; text: string }[]>([
    {
      from: 'user',
      text: expert.clientMessage,
    },
    {
      from: 'expert',
      text: expert.expertMessage,
    },
  ])

  useEffect(() => {
    const messageList = messagesRef.current
    if (!messageList) return
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    if (!input.trim()) return
    setMessages((m) => [...m, { from: 'user', text: input }])
    setInput('')
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in">
      {/* Expert header — structural panel */}
      <div className="flex-shrink-0 px-5 py-3 border-b" style={{ background: 'var(--color-ground-deep)', borderColor: 'var(--color-slate-900)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[var(--color-slate-800)]">
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online dot — accent, communicates live/active state */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                style={{ background: 'var(--color-accent)', borderColor: 'var(--color-ground-deep)' }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[var(--color-slate-100)] text-[14px] font-semibold truncate">{expert.name}</p>
                <TierBadge tierId={tierId} />
              </div>
              <p className="text-[11px] truncate" style={{ color: 'var(--color-slate-400)' }}>
                {expert.title} · {expert.credentials}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {tiers[tierId].callPrice && (
              <button
                type="button"
                onClick={onBookCall}
                className="min-h-10 px-3 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5"
                style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent-text)' }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                  <rect x="0.5" y="2" width="10" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M3.5 0.5v2M7.5 0.5v2M0.5 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Book call
              </button>
            )}
            <button
              type="button"
              onClick={onComplete}
              className="min-h-10 px-3 rounded-xl border flex-shrink-0 text-[11px] font-semibold"
              style={{ background: 'var(--color-slate-800)', borderColor: 'var(--color-slate-700)' }}
            >
              End
            </button>
          </div>
        </div>

        {/* Stats row — structural only */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="#f59e0b">
              <path d="M5.5 1l1.2 2.5L9.5 4 7.5 6l.5 3L5.5 7.5 3 9l.5-3L1.5 4l2.8-.5z"/>
            </svg>
            <span className="text-[var(--color-slate-100)] text-[12px] font-semibold">{expert.rating}</span>
            <span className="text-[11px]" style={{ color: 'var(--color-slate-600)' }}>({expert.reviewCount})</span>
          </div>
          <div className="w-px h-3" style={{ background: 'var(--color-slate-700)' }}/>
          <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>{expert.location}</span>
          <div className="w-px h-3" style={{ background: 'var(--color-slate-700)' }}/>
          {/* Live indicator — accent for "active" meaning */}
          <div className="flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'var(--color-accent)' }}
            />
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-logo-wordmark)' }}>Online now</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-4 min-h-0">
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: 'var(--color-slate-900)' }}/>
          <span className="text-[10px] font-medium" style={{ color: 'var(--color-slate-600)' }}>Today, 14:23</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-slate-900)' }}/>
        </div>

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-chat-in`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {msg.from === 'expert' && (
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-1 bg-[var(--color-slate-800)]">
                <img
                  src={expert.image}
                  alt={expert.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-[1.65] ${
                msg.from === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
              }`}
              style={
                msg.from === 'user'
                  ? { background: 'var(--color-accent)', color: 'white' }
                  : { background: 'var(--color-slate-900)', color: 'var(--color-slate-200)', border: '1px solid var(--color-slate-800)' }
              }
            >
              {msg.text.split('\n\n').map((para, j) => (
                <p key={j} className={j > 0 ? 'mt-2.5' : ''}>{para}</p>
              ))}
              <p
                className={`text-[10px] mt-1.5 ${msg.from === 'user' ? 'text-right' : ''}`}
                style={{ color: msg.from === 'user' ? 'rgba(255,255,255,0.55)' : 'var(--color-slate-600)' }}
              >
                {msg.from === 'user' ? '14:23 · Sent' : `14:24 · ${expert.firstName}`}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator — structural panel */}
        <div className="flex items-end gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-[var(--color-slate-800)]">
            <img
              src={expert.image}
              alt={expert.firstName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl rounded-bl-md px-4 py-3 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)' }}>
            <div className="flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 rounded-full dot-1" style={{ background: 'var(--color-slate-400)' }}/>
              <div className="w-1.5 h-1.5 rounded-full dot-2" style={{ background: 'var(--color-slate-400)' }}/>
              <div className="w-1.5 h-1.5 rounded-full dot-3" style={{ background: 'var(--color-slate-400)' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Encryption notice — structural, no accent */}
      <div
        className="flex-shrink-0 flex items-center justify-center gap-1.5 py-2 border-t border-b"
        style={{ background: 'var(--color-ground-deep)', borderColor: 'var(--color-slate-900)' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L2 2.5v3C2 8 3.5 9.5 5 9.5S8 8 8 5.5v-3L5 1z" stroke="var(--color-slate-600)" strokeWidth="1.1"/>
        </svg>
        <span className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>
          End-to-end encrypted · Stripe-secured payment
        </span>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 py-3 flex items-end gap-2" style={{ background: 'var(--color-ground-base)' }}>
        <button
          type="button"
          aria-label="Add attachment"
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border"
          style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="var(--color-slate-400)" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Reply to ${expert.firstName}…`}
          aria-label={`Message ${expert.firstName}`}
          className="flex-1 min-w-0 h-11 text-[var(--color-slate-100)] text-[13px] rounded-2xl px-4 outline-none transition-colors duration-200"
          style={{ background: 'var(--color-ground-deep)', border: '1px solid var(--color-slate-700)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-700)')}
        />

        {/* Send — accent CTA, only interactive affordance in the bar */}
        <button
          type="button"
          onClick={sendMessage}
          disabled={!input.trim()}
          aria-label="Send message"
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-accent)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 2l3 6-3 6z" fill="white"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Screen 8: Consultation complete ──────────────────────────────────────────

function ConsultationCompleteScreen({
  category,
  tierId,
  onHistory,
  onHome,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  onHistory: () => void
  onHome: () => void
}) {
  const expert = category.expert
  const tier = tiers[tierId]

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="flex flex-col items-center text-center pt-4 pb-7">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[var(--color-accent)]">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M5 11l4 4 8-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[11px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-accent-text)]">
          Consultation complete
        </p>
        <h2 className="font-display text-[30px] leading-tight text-[var(--color-slate-100)]">
          Your written outcome
        </h2>
      </div>

      <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-slate-700)]">
          <img src={expert.image} alt="" className="w-10 h-10 rounded-xl object-cover"/>
          <div>
            <p className="text-[13px] font-semibold text-[var(--color-slate-100)]">{expert.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-[var(--color-slate-400)]">{expert.title}</p>
              <TierBadge tierId={tierId} />
            </div>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-slate-400)]">
          Expert summary
        </p>
        <p className="text-[12px] leading-[1.65] text-[var(--color-slate-200)]">{category.consultationSummary}</p>
      </div>

      <div className="rounded-2xl p-4 mb-4 bg-[var(--color-slate-900)]">
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-3 text-[var(--color-slate-400)]">
          Recommended next steps
        </p>
        <div className="space-y-3">
          {category.nextSteps.map((step, index) => (
            <div key={step} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]">
                {index + 1}
              </span>
              <span className="text-[12px] leading-relaxed text-[var(--color-slate-200)]">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt */}
      <div className="rounded-2xl p-4 mb-4 border border-[var(--color-slate-700)]" style={{ background: 'var(--color-slate-900)' }}>
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-3" style={{ color: 'var(--color-slate-400)' }}>Receipt</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>Expert level</span>
            <TierBadge tierId={tierId} size="md" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>Consultation fee</span>
            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-slate-100)' }}>£{tier.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>Expert payout</span>
            <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>£{tier.expertPayout.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl px-4 py-3.5 mb-4 flex items-center justify-between border border-[var(--color-slate-700)]">
        <div>
          <p className="text-[12px] font-semibold text-[var(--color-slate-100)]">Follow-up available</p>
          <p className="text-[10px] text-[var(--color-slate-400)]">Message {expert.firstName} within 24 hours</p>
        </div>
        <span className="text-[11px] font-semibold text-[var(--color-accent-text)]">Included</span>
      </div>

      <a
        href="https://tally.so/r/yXPWe6"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full min-h-13 mt-2 mb-3 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[15px] font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        Share your feedback
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
      <p className="text-center text-[10px] text-[var(--color-slate-600)] mb-5">Takes 2 minutes — helps us build this properly</p>

      <AccentBtn onClick={onHistory} className="mt-auto">View consultations</AccentBtn>
      <button
        type="button"
        onClick={onHome}
        className="w-full min-h-11 mt-3 rounded-2xl text-[12px] font-semibold text-[var(--color-slate-400)]"
      >
        Start a new request
      </button>
    </div>
  )
}

// ─── Screen 9: Consultation history ───────────────────────────────────────────

function ConsultationHistoryScreen({
  category,
  tierId,
  complete,
  onOpen,
  onNewRequest,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  complete: boolean
  onOpen: () => void
  onNewRequest: () => void
}) {
  const expert = category.expert
  const tier = tiers[tierId]

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-7">
        <p className="text-[11px] uppercase tracking-wide font-medium text-[var(--color-slate-600)]">Client workspace</p>
        <h2 className="font-display text-[30px] text-[var(--color-slate-100)]">Consultations</h2>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]">
          {complete ? 'Completed' : 'Active'}
        </span>
        <TierBadge tierId={tierId} size="md" />
        <span className="rounded-full px-3 py-1.5 text-[11px] font-medium bg-[var(--color-slate-800)] text-[var(--color-slate-400)]">
          £{tier.price} consultation
        </span>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-3xl p-5 border text-left bg-[var(--color-slate-900)] border-[var(--color-slate-700)]"
      >
        <span className="flex items-center gap-3 mb-4">
          <img src={expert.image} alt="" className="w-12 h-12 rounded-xl object-cover"/>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold truncate text-[var(--color-slate-100)]">{expert.name}</span>
            <span className="block text-[11px] text-[var(--color-slate-400)]">{category.shortName}</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto flex-shrink-0" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="var(--color-slate-400)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="block text-[12px] leading-relaxed mb-4 text-[var(--color-slate-200)]">
          {complete ? category.consultationSummary : `Your secure consultation with ${expert.firstName} is active.`}
        </span>
        <span className="flex items-center justify-between pt-3 border-t border-[var(--color-slate-700)]">
          <span className="text-[10px] text-[var(--color-slate-600)]">Today · £{tier.price.toFixed(2)}</span>
          <span className="text-[11px] font-semibold text-[var(--color-accent-text)]">
            {complete ? 'View outcome' : 'Open chat'}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={onNewRequest}
        className="w-full min-h-12 mt-auto rounded-2xl border border-[var(--color-slate-700)] bg-[var(--color-slate-900)] text-[13px] font-semibold text-[var(--color-slate-200)]"
      >
        Start a new request
      </button>
    </div>
  )
}

// ─── Call screens ─────────────────────────────────────────────────────────────

function CallSlotsScreen({
  category,
  tierId,
  fromChat,
  onSelect,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  fromChat: boolean
  onSelect: (slot: CallSlot) => void
}) {
  const tier = tiers[tierId]
  const callPrice = tier.callPrice!
  const topUp = callPrice - tier.price
  const slots = generateSlots()
  const grouped = groupSlotsByDay(slots)
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const selectedSlot = slots.find((s) => s.id === selected) ?? null
  const activeGroup = grouped[activeDayIndex]

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-2 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-slate-600)' }}>
          30-min call
        </p>
        <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
          Choose a time
        </h2>
      </div>

      {/* Day strip */}
      <div className="flex-shrink-0 flex gap-2 overflow-x-auto px-6 pb-4" style={{ scrollbarWidth: 'none' }}>
        {grouped.map(({ dayLabel }, i) => {
          const [dayName, date, month] = dayLabel.split(' ')
          const active = activeDayIndex === i
          return (
            <button
              key={dayLabel}
              type="button"
              onClick={() => { setActiveDayIndex(i); setSelected(null) }}
              className="flex-shrink-0 flex flex-col items-center rounded-2xl px-3 py-2.5 border min-w-[52px] transition-colors"
              style={{
                background: active ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                borderColor: active ? 'var(--color-accent)' : 'var(--color-slate-700)',
              }}
            >
              <span className="text-[10px] font-semibold uppercase" style={{ color: active ? 'var(--color-accent-text)' : 'var(--color-slate-400)' }}>
                {dayName.slice(0, 3)}
              </span>
              <span className="text-[16px] font-bold leading-tight" style={{ color: active ? 'var(--color-slate-100)' : 'var(--color-slate-200)' }}>
                {date}
              </span>
              <span className="text-[9px]" style={{ color: active ? 'var(--color-accent-text)' : 'var(--color-slate-600)' }}>
                {month}
              </span>
            </button>
          )
        })}
      </div>

      {/* Time slots for selected day */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-4">
        {fromChat && (
          <div className="rounded-2xl px-4 py-3 mb-4 border" style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent-border)' }}>
            <p className="text-[12px] leading-snug" style={{ color: 'var(--color-slate-200)' }}>
              Your £{tier.price} chat payment counts toward this call.{' '}
              <strong style={{ color: 'var(--color-slate-100)' }}>You'll only be charged £{topUp} more.</strong>
            </p>
          </div>
        )}

        <p className="text-[12px] font-semibold mb-3 text-[var(--color-slate-100)]">
          {activeGroup?.dayLabel}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {activeGroup?.slots.map((slot) => {
            const active = selected === slot.id
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelected(slot.id)}
                aria-pressed={active}
                className="rounded-xl py-3 border text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-slate-700)',
                  color: active ? 'var(--color-accent-text)' : 'var(--color-slate-200)',
                }}
              >
                {slot.timeLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 px-6 pb-8 pt-3 border-t" style={{ borderColor: 'var(--color-slate-800)' }}>
        <AccentBtn
          onClick={() => selectedSlot && onSelect(selectedSlot)}
          disabled={!selected}
        >
          Continue to payment
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </AccentBtn>
      </div>
    </div>
  )
}

function CallConfirmScreen({
  category,
  tierId,
  slot,
  fromChat,
  onNext,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  slot: CallSlot
  fromChat: boolean
  onNext: () => void
}) {
  const [agreed, setAgreed] = useState(false)
  const tier = tiers[tierId]
  const callPrice = tier.callPrice!
  const chargeAmount = fromChat ? callPrice - tier.price : callPrice

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-slate-600)' }}>
          Confirm booking
        </p>
        <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
          Review &amp; pay
        </h2>
      </div>

      {/* Booking summary */}
      <div className="rounded-3xl p-5 mb-4 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: 'var(--color-slate-800)' }}>
          <img src={category.expert.image} alt={category.expert.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0"/>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[var(--color-slate-100)] truncate">{category.expert.name}</p>
            <p className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>{category.expert.title}</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Date', value: slot.dayLabel },
            { label: 'Time', value: slot.timeLabel },
            { label: 'Duration', value: '30 minutes' },
            { label: 'Format', value: 'In-app call · recorded' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: 'var(--color-slate-400)' }}>{label}</span>
              <span className="text-[12px] font-medium text-[var(--color-slate-100)]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div className="rounded-2xl p-4 mb-4 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        {fromChat && (
          <div className="flex items-center justify-between mb-2.5 pb-2.5 border-b" style={{ borderColor: 'var(--color-slate-800)' }}>
            <span className="text-[12px]" style={{ color: 'var(--color-slate-400)' }}>Chat already paid</span>
            <span className="text-[12px] font-medium" style={{ color: 'var(--color-slate-400)' }}>−£{tier.price}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[var(--color-slate-100)]">{fromChat ? 'Top-up today' : 'Total today'}</span>
          <span className="text-[17px] font-bold" style={{ color: 'var(--color-logo-wordmark)' }}>£{chargeAmount}</span>
        </div>
        {fromChat && (
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-slate-600)' }}>
            Total call value £{callPrice} · £{tier.price} paid via chat
          </p>
        )}
      </div>

      {/* Card */}
      <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 border" style={{ background: 'var(--color-ground-deep)', borderColor: 'var(--color-slate-700)' }}>
        <div className="w-10 h-6 bg-[#1a1f71] rounded-md flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[9px] font-black tracking-tight">VISA</span>
        </div>
        <p className="text-[12px] leading-snug text-[var(--color-slate-100)]">
          Confirming will charge <strong>£{chargeAmount}</strong> to your Visa ending 4242.
        </p>
      </div>

      {/* Terms */}
      <button onClick={() => setAgreed(!agreed)} className="flex items-start gap-3 mb-6 text-left">
        <div
          className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-150"
          style={{ background: agreed ? 'var(--color-accent)' : 'transparent', borderColor: agreed ? 'var(--color-accent)' : 'var(--color-slate-700)' }}
        >
          {agreed && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <p className="text-[12px] leading-[1.55]" style={{ color: 'var(--color-slate-400)' }}>
          I agree to the call being recorded for quality and auditing purposes. I have read the{' '}
          <span className="underline" style={{ color: 'var(--color-logo-wordmark)' }}>Terms of Service</span>.
        </p>
      </button>

      <AccentBtn onClick={onNext} disabled={!agreed}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="6" width="12" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
          <path d="M5 6V4.5a3 3 0 016 0V6" stroke="white" strokeWidth="1.6"/>
        </svg>
        Confirm &amp; pay £{chargeAmount}
      </AccentBtn>
      <p className="text-center text-[11px] mt-3" style={{ color: 'var(--color-slate-600)' }}>
        Secured by Stripe · 256-bit TLS encryption
      </p>
    </div>
  )
}

function CallUpcomingScreen({
  category,
  tierId,
  slot,
  onJoin,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  slot: CallSlot
  onJoin: () => void
}) {
  const expert = category.expert

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-accent-text)' }}>
          Booking confirmed
        </p>
        <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
          Your call is scheduled
        </h2>
      </div>

      {/* Call card */}
      <div className="rounded-3xl p-5 mb-4 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <img src={expert.image} alt={expert.name} className="w-16 h-16 rounded-2xl object-cover"/>
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold truncate text-[var(--color-slate-100)]">{expert.name}</h2>
            <p className="text-[12px]" style={{ color: 'var(--color-slate-400)' }}>{expert.title}</p>
            <TierBadge tierId={tierId} />
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: '📅', label: slot.dayLabel },
            { icon: '🕐', label: slot.timeLabel + ' · 30 minutes' },
            { icon: '🎙', label: 'In-app call · recorded for auditing' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[16px]">{icon}</span>
              <span className="text-[13px] text-[var(--color-slate-200)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl px-4 py-3 mb-6 border" style={{ background: 'var(--color-slate-800)', borderColor: 'var(--color-slate-700)' }}>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-slate-400)' }}>
          You'll be notified 15 minutes before the call. Join from this screen when it's time.
        </p>
      </div>

      <AccentBtn onClick={onJoin}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 3l9 5-9 5V3z" fill="white"/>
        </svg>
        Join call
      </AccentBtn>
      <p className="text-center text-[11px] mt-3" style={{ color: 'var(--color-slate-600)' }}>
        Demo mode — join anytime
      </p>
    </div>
  )
}

function CallActiveScreen({
  category,
  tierId,
  onComplete,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  onComplete: () => void
}) {
  const expert = category.expert
  const [muted, setMuted] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const secs = (elapsed % 60).toString().padStart(2, '0')
  const remaining = Math.max(0, 1800 - elapsed)
  const remMins = Math.floor(remaining / 60).toString().padStart(2, '0')
  const remSecs = (remaining % 60).toString().padStart(2, '0')

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in" style={{ background: 'var(--color-ground-deep)' }}>
      {/* Expert info */}
      <div className="flex flex-col items-center pt-10 pb-6 px-6">
        <div className="relative mb-4">
          <img src={expert.image} alt={expert.name} className="w-24 h-24 rounded-3xl object-cover"/>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--color-ground-deep)] bg-[var(--color-accent)]"/>
        </div>
        <h2 className="text-[19px] font-semibold text-[var(--color-slate-100)] mb-1">{expert.name}</h2>
        <p className="text-[12px]" style={{ color: 'var(--color-slate-400)' }}>{expert.title}</p>

        {/* Timer */}
        <div className="mt-5 text-center">
          <p className="font-display text-[40px] text-[var(--color-slate-100)] leading-none tracking-tight">{mins}:{secs}</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-slate-600)' }}>{remMins}:{remSecs} remaining</p>
        </div>

        {/* Recording indicator */}
        <div className="flex items-center gap-1.5 mt-4 rounded-full px-3 py-1.5" style={{ background: 'var(--color-slate-900)' }}>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
          <span className="text-[10px] font-semibold text-red-400">Recording</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1"/>
      <div className="px-8 pb-12">
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="w-14 h-14 rounded-full flex items-center justify-center border transition-colors"
            style={{
              background: muted ? 'var(--color-slate-700)' : 'var(--color-slate-900)',
              borderColor: 'var(--color-slate-700)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {muted
                ? <><path d="M3 3l14 14" stroke="var(--color-slate-400)" strokeWidth="1.6" strokeLinecap="round"/><path d="M10 2a3 3 0 013 3v4l-6-6V5a3 3 0 013-3z" stroke="var(--color-slate-400)" strokeWidth="1.4"/><path d="M7 9v1a3 3 0 006 0v-1M10 15v3M7 18h6" stroke="var(--color-slate-400)" strokeWidth="1.4" strokeLinecap="round"/></>
                : <><path d="M10 2a3 3 0 013 3v5a3 3 0 01-6 0V5a3 3 0 013-3z" stroke="var(--color-slate-200)" strokeWidth="1.4"/><path d="M7 10a3 3 0 006 0M10 15v3M7 18h6" stroke="var(--color-slate-200)" strokeWidth="1.4" strokeLinecap="round"/></>
              }
            </svg>
          </button>

          <button
            type="button"
            onClick={onComplete}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 8.5c0-1 .7-2 1.8-2.3A16 16 0 0111 5.5c2.2 0 4.4.3 6.2.7 1.1.3 1.8 1.3 1.8 2.3v1.2c0 .8-.5 1.5-1.3 1.8l-2.4.9c-.7.3-1.5.1-2-.5l-.9-1a8.5 8.5 0 01-2.8 0l-.9 1c-.5.6-1.3.8-2 .5l-2.4-.9C3.5 11.2 3 10.5 3 9.7V8.5z" fill="white"/>
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setSpeakerOn(!speakerOn)}
            className="w-14 h-14 rounded-full flex items-center justify-center border transition-colors"
            style={{
              background: speakerOn ? 'var(--color-slate-900)' : 'var(--color-slate-700)',
              borderColor: 'var(--color-slate-700)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 7h3l4-4v14l-4-4H3V7z" stroke={speakerOn ? 'var(--color-slate-200)' : 'var(--color-slate-400)'} strokeWidth="1.4" strokeLinejoin="round"/>
              {speakerOn && <path d="M14 6a5 5 0 010 8M12 8a2.5 2.5 0 010 4" stroke="var(--color-slate-200)" strokeWidth="1.4" strokeLinecap="round"/>}
            </svg>
          </button>
        </div>

        <p className="text-center text-[11px]" style={{ color: 'var(--color-slate-600)' }}>
          Tap the red button to end the call
        </p>
      </div>
    </div>
  )
}

function CallCompleteScreen({
  category,
  onHistory,
  onHome,
}: {
  category: CategoryDefinition
  onHistory: () => void
  onHome: () => void
}) {
  const expert = category.expert

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="flex flex-col items-center pt-8 pb-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-accent-soft)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M6 14l5.5 5.5 10.5-11" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-[20px] font-semibold text-[var(--color-slate-100)] mb-2">Call complete</h2>
        <p className="text-[13px] leading-relaxed max-w-xs" style={{ color: 'var(--color-slate-400)' }}>
          Your 30-minute call with {expert.firstName} has ended.
        </p>
      </div>

      <div className="rounded-2xl p-4 mb-4 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-slate-400)' }}>
          Recording
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-slate-800)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="7" stroke="var(--color-slate-400)" strokeWidth="1.4"/>
              <path d="M7 6.5l5 2.5-5 2.5V6.5z" fill="var(--color-slate-400)"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--color-slate-100)]">Call recording available</p>
            <p className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>Stored securely · accessible for 90 days</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-6 border" style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}>
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-slate-400)' }}>
          What's next
        </p>
        <div className="space-y-2.5">
          {category.nextSteps.map((step) => (
            <div key={step} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0" style={{ background: 'var(--color-accent-soft)' }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4l2 2 3-3" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[12px] leading-[1.5]" style={{ color: 'var(--color-slate-200)' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <AccentBtn onClick={onHistory} className="mb-3">
        View consultation history
      </AccentBtn>
      <button
        type="button"
        onClick={onHome}
        className="w-full min-h-12 rounded-2xl border border-[var(--color-slate-700)] bg-[var(--color-slate-900)] text-[13px] font-semibold text-[var(--color-slate-200)]"
      >
        Back to home
      </button>
    </div>
  )
}

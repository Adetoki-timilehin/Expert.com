import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import FeedbackPrompt from '../../components/feedback/FeedbackPrompt'
import { categories, categoryIds, getCategory, type CategoryDefinition, type CategoryId } from '../../data/categories'
import { broadCategories, getBroadCategoryForService, type BroadCategoryId } from '../../data/taxonomy'
import { classifyRequest, type ClassificationResult } from '../../lib/classifyRequest'
import { eligibleTiersFor, lowestPriceFor, recommendTierFor, tiers, type ExpertTierId, type TierDefinition } from '../../data/tiers'

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

type Screen = 'landing' | 'classification' | 'intake' | 'review' | 'tier-selection' | 'pricing' | 'matching' | 'match' | 'chat' | 'complete' | 'history'

const clientScreens: Screen[] = ['landing', 'classification', 'intake', 'review', 'tier-selection', 'pricing', 'matching', 'match', 'chat', 'complete', 'history']

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
  return saved && categoryIds.includes(saved) ? saved : 'nanny'
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
      classification: 'landing',
      intake: 'landing',
      review: 'intake',
      'tier-selection': 'review',
      pricing: 'tier-selection',
      matching: 'pricing',
      match: 'pricing',
      chat: null,
      complete: 'history',
      history: 'landing',
    }
    const previous = previousScreen[screen]
    if (previous) {
      setScreen(previous)
      return
    }
    navigate('/')
  }

  return (
    <AppShell onBack={goBack} onHome={() => navigate('/')}>
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
              setScreen('classification')
            }}
          />
        )}
        {screen === 'classification' && (
          <ClassificationScreen
            request={requestText}
            result={classification}
            selectedCategory={categoryId}
            onSelectCategory={(nextCategory) => {
              setCategoryId(nextCategory)
              setUrgency(categories[nextCategory].defaultUrgency)
            }}
            onEdit={() => setScreen('landing')}
            onNext={() => setScreen('intake')}
          />
        )}
        {screen === 'intake' && (
          <IntakeScreen
            category={category}
            question={requestText}
            onQuestionChange={setRequestText}
            urgency={urgency}
            onUrgencyChange={setUrgency}
            onNext={() => setScreen('review')}
          />
        )}
        {screen === 'review' && (
          <RequestReviewScreen
            category={category}
            question={requestText}
            urgency={urgency}
            onEdit={() => setScreen('intake')}
            onNext={() => setScreen('tier-selection')}
          />
        )}
        {screen === 'tier-selection' && (
          <TierSelectionScreen
            categoryId={categoryId}
            classification={classification}
            selectedTierId={selectedTierId}
            onSelect={(tierId) => {
              setSelectedTierId(tierId)
              setScreen('pricing')
            }}
          />
        )}
        {screen === 'pricing' && (
          <PricingScreen
            category={category}
            tierId={selectedTierId}
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
            onNext={() => {
              setChatReturnScreen('match')
              setScreen('chat')
            }}
          />
        )}
        {screen === 'chat' && (
          <ChatScreen
            category={category}
            tierId={selectedTierId}
            onComplete={() => {
              setConsultationComplete(true)
              localStorage.setItem('specialist.client.consultationComplete', 'true')
              setScreen('complete')
            }}
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
  const [activeBroadCategory, setActiveBroadCategory] = useState<BroadCategoryId>(
    () => getBroadCategoryForService(initialCategory).id
  )

  function selectCategory(category: CategoryId) {
    setSelectedCategory(category)
    setQuery(categories[category].landingQuery)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      {/* Logo */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5L9.5 6H12L8.5 9l1 3.5L7 10.5 3.5 12.5l1-3.5L1 6h2.5z" fill="white"/>
            </svg>
          </div>
          <span className="font-logo text-[var(--color-slate-100)] font-semibold text-[15px] tracking-tight">
            Specia<span style={{ color: 'var(--color-accent-text)' }}>L</span>ist
          </span>
        </div>
        <button
          type="button"
          onClick={onHistory}
          className="min-h-10 px-3 rounded-xl text-[11px] font-semibold text-[var(--color-slate-400)] bg-[var(--color-slate-900)] border border-[var(--color-slate-700)]"
        >
          Consultations
        </button>
      </div>

      {/* Hero intro */}
      <div className="mb-6">
        <p className="text-[var(--color-slate-400)] text-[11px] font-semibold tracking-[0.14em] uppercase mb-4">
          UK-Verified Experts · 24/7
        </p>
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

      {/* Broad categories and available specialist services */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-3 text-[var(--color-slate-400)]">
          Browse by category
        </p>
        <div className="flex gap-2 overflow-x-auto pb-3">
          {broadCategories.map((broadCategory) => {
            const active = activeBroadCategory === broadCategory.id
            return (
              <button
                key={broadCategory.id}
                type="button"
                onClick={() => setActiveBroadCategory(broadCategory.id)}
                aria-pressed={active}
                className="w-32 min-h-24 flex-shrink-0 rounded-2xl p-3 border text-left transition-colors"
                style={{
                  background: active ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-slate-700)',
                }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-[var(--color-slate-800)]">
                  <CategoryIcon category={broadCategory.availableService.categoryId}/>
                </span>
                <span className="block text-[11px] font-semibold leading-snug text-[var(--color-slate-100)]">
                  {broadCategory.name}
                </span>
              </button>
            )
          })}
        </div>

        {broadCategories
          .filter((broadCategory) => broadCategory.id === activeBroadCategory)
          .map((broadCategory) => {
            const service = broadCategory.availableService
            const selected = selectedCategory === service.categoryId
            return (
              <div key={broadCategory.id} className="rounded-3xl p-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
                <p className="text-[10px] leading-relaxed mb-3 text-[var(--color-slate-400)]">
                  {broadCategory.description}
                </p>
                <button
                  type="button"
                  onClick={() => selectCategory(service.categoryId)}
                  aria-pressed={selected}
                  className="w-full rounded-2xl p-4 border text-left transition-colors"
                  style={{
                    background: selected ? 'var(--color-accent-soft)' : 'var(--color-ground-deep)',
                    borderColor: selected ? 'var(--color-accent)' : 'var(--color-slate-700)',
                  }}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-[13px] font-semibold text-[var(--color-slate-100)]">{service.name}</span>
                      <span className="block text-[10px] mt-1 text-[var(--color-slate-400)]">{service.specialist}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--color-accent-text)]">
                      From £{lowestPriceFor(service.categoryId)}
                    </span>
                  </span>
                </button>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[9px] uppercase tracking-wide mr-1 py-1 text-[var(--color-slate-600)]">Also planned</span>
                  {broadCategory.plannedServices.map((plannedService) => (
                    <span key={plannedService} className="rounded-full px-2 py-1 text-[9px] bg-[var(--color-slate-800)] text-[var(--color-slate-400)]">
                      {plannedService}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
      </div>

      {/* Search — the input is structural; the focus ring uses accent */}
      <div className="mt-auto">
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

        {/* Primary CTA — the 10% accent at its most prominent */}
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
  if (category === 'beauty') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 17c4-2.5 6-5.5 6-9a6 6 0 00-12 0c0 3.5 2 6.5 6 9zM7 9c1.5 1 4.5 1 6 0" {...shared}/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM5 17c0-3 2-5 5-5" {...shared}/>
      <path d="M12 14l1.5 1.5L16 13" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Screen 2: Classification confirmation ────────────────────────────────────

function ClassificationScreen({
  request,
  result,
  selectedCategory,
  onSelectCategory,
  onEdit,
  onNext,
}: {
  request: string
  result: ClassificationResult
  selectedCategory: CategoryId
  onSelectCategory: (category: CategoryId) => void
  onEdit: () => void
  onNext: () => void
}) {
  const category = categories[selectedCategory]
  const broadCategory = getBroadCategoryForService(selectedCategory)
  const service = broadCategory.availableService
  const manuallyChanged = selectedCategory !== result.categoryId
  const emergencyNumber = result.safetyMessage?.includes('0800 111 999')
    ? '0800111999'
    : '999'

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-6">
        <p className="text-[11px] uppercase tracking-wide font-semibold mb-1 text-[var(--color-accent-text)]">
          Request routing
        </p>
        <h2 className="font-display text-[28px] leading-tight text-[var(--color-slate-100)]">
          Check we understood
        </h2>
      </div>

      {result.urgentSafetyFlag && (
        <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
          <p className="text-[11px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-slate-100)]">
            Urgent safety check
          </p>
          <p className="text-[11px] leading-relaxed mb-4 text-[var(--color-slate-400)]">{result.safetyMessage}</p>
          <button
            type="button"
            onClick={() => { window.location.href = `tel:${emergencyNumber}` }}
            className="w-full min-h-11 rounded-2xl bg-[var(--color-accent)] text-white text-[12px] font-semibold"
          >
            Call {emergencyNumber === '999' ? '999' : 'gas emergency line'}
          </button>
        </div>
      )}

      <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide mb-1 text-[var(--color-slate-600)]">
              Suggested route
            </p>
            <p className="text-[12px] font-semibold text-[var(--color-accent-text)]">
              {manuallyChanged ? 'Client selected' : result.confidenceLabel}
            </p>
          </div>
          <span className="text-[18px] font-display text-[var(--color-slate-100)]">
            {manuallyChanged ? 'Confirmed' : `${Math.round(result.confidence * 100)}%`}
          </span>
        </div>

        <div className="space-y-2">
          <RouteLevel label="Category" value={broadCategory.name}/>
          <RouteLevel label="Service" value={service.name}/>
          <RouteLevel label="Specialist" value={service.specialist}/>
        </div>

        {!manuallyChanged && result.matchedTerms.length > 0 && (
          <p className="text-[9px] leading-relaxed mt-4 text-[var(--color-slate-600)]">
            Routing signals: {result.matchedTerms.join(', ')}
          </p>
        )}
      </div>

      <div className="rounded-2xl p-4 mb-4 bg-[var(--color-slate-800)]">
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-slate-400)]">
          Your request
        </p>
        <p className="text-[11px] leading-relaxed line-clamp-4 text-[var(--color-slate-200)]">{request}</p>
      </div>

      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-slate-400)]">
          Change the service
        </p>
        <div className="flex flex-wrap gap-2">
          {categoryIds.map((categoryId) => (
            <button
              key={categoryId}
              type="button"
              onClick={() => onSelectCategory(categoryId)}
              aria-pressed={selectedCategory === categoryId}
              className="min-h-9 rounded-xl px-3 text-[10px] font-semibold border"
              style={{
                color: selectedCategory === categoryId ? 'white' : 'var(--color-slate-400)',
                background: selectedCategory === categoryId ? 'var(--color-accent)' : 'var(--color-slate-900)',
                borderColor: selectedCategory === categoryId ? 'var(--color-accent)' : 'var(--color-slate-700)',
              }}
            >
              {categories[categoryId].shortName}
            </button>
          ))}
        </div>
      </div>

      {category.scopeNotice && (
        <p className="text-[10px] leading-relaxed mb-4 text-[var(--color-slate-600)]">{category.scopeNotice}</p>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="w-full min-h-11 rounded-2xl mb-3 border border-[var(--color-slate-700)] text-[12px] font-semibold text-[var(--color-slate-400)]"
      >
        Edit request
      </button>
      <AccentBtn onClick={onNext} className="mt-auto">
        {result.urgentSafetyFlag ? 'Continue only if this is not an emergency' : 'Confirm and continue'}
      </AccentBtn>
    </div>
  )
}

function RouteLevel({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-[10px] text-[var(--color-slate-600)]">{label}</span>
      <span className="flex-1 rounded-xl px-3 py-2 text-[11px] font-semibold bg-[var(--color-slate-800)] text-[var(--color-slate-200)]">{value}</span>
    </div>
  )
}

// ─── Screen 3: Intake ─────────────────────────────────────────────────────────

function IntakeScreen({
  category,
  question,
  onQuestionChange,
  urgency,
  onUrgencyChange,
  onNext,
}: {
  category: CategoryDefinition
  question: string
  onQuestionChange: (question: string) => void
  urgency: string
  onUrgencyChange: (urgency: string) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="flex items-center pt-2 pb-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-slate-600)' }}>
            Step 1 of 4
          </p>
          <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
            Confirm your question
          </h2>
        </div>
      </div>

      <ProgressTrack total={4} done={1}/>

      {/* Category chip — structural with a subtle accent-tinted border to signal "confirmed" */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 border"
          style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent-border)' }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 5.5l2.5 2.5 4.5-5" stroke="var(--color-accent-text)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--color-accent-text)' }}>
            {category.name}
          </span>
        </div>
        <span className="text-[11px]" style={{ color: 'var(--color-slate-600)' }}>Auto-detected</span>
      </div>

      {category.scopeNotice && (
        <div className="rounded-2xl p-4 mb-4 bg-[var(--color-slate-800)]">
          <p className="text-[10px] uppercase tracking-wide font-semibold mb-1 text-[var(--color-accent-text)]">
            Scope and safety
          </p>
          <p className="text-[10px] leading-relaxed text-[var(--color-slate-400)]">{category.scopeNotice}</p>
        </div>
      )}

      {/* Question editor */}
      <div className="mb-5">
        <label className="text-[11px] font-medium uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-slate-400)' }}>
          Your question
        </label>
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          rows={7}
          className="w-full text-[var(--color-slate-100)] text-[13.5px] leading-[1.65] rounded-2xl px-4 py-4 resize-none outline-none transition-colors duration-200"
          style={{ background: 'var(--color-ground-deep)', border: '1px solid var(--color-slate-700)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-700)')}
        />
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-slate-600)' }}>
          {question.length} characters · be as specific as possible
        </p>
      </div>

      {/* Attachments */}
      <div className="mb-5">
        <label className="text-[11px] font-medium uppercase tracking-wide mb-2 block" style={{ color: 'var(--color-slate-400)' }}>
          Attachments{' '}
          <span className="normal-case tracking-normal font-normal" style={{ color: 'var(--color-slate-600)' }}>
            (optional)
          </span>
        </label>
        <button
          className="w-full rounded-2xl py-4 flex flex-col items-center gap-2 transition-colors duration-200 border border-dashed"
          style={{ borderColor: 'var(--color-slate-700)' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-600)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-slate-700)')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 4v10M4 9h10" stroke="var(--color-slate-600)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="text-[12px]" style={{ color: 'var(--color-slate-600)' }}>{category.attachmentPrompt}</span>
        </button>
      </div>

      {/* Urgency selector — active state is the only accent usage here */}
      <div className="mb-7">
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

      <AccentBtn onClick={onNext} className="mt-auto">
        Review request
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </AccentBtn>
    </div>
  )
}

// ─── Screen 3: Request review ─────────────────────────────────────────────────

function RequestReviewScreen({
  category,
  question,
  urgency,
  onEdit,
  onNext,
}: {
  category: CategoryDefinition
  question: string
  urgency: string
  onEdit: () => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-slate-600)]">
          Step 2 of 4
        </p>
        <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
          Review your request
        </h2>
      </div>

      <ProgressTrack total={4} done={2}/>

      <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1 text-[var(--color-slate-400)]">
              Detected category
            </p>
            <p className="text-[14px] font-semibold text-[var(--color-slate-100)]">{category.name}</p>
          </div>
          <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]">
            {urgency}
          </span>
        </div>

        <div className="pt-4 border-t border-[var(--color-slate-700)]">
          <p className="text-[10px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-slate-400)]">
            What the expert will see
          </p>
          <p className="text-[13px] leading-[1.65] text-[var(--color-slate-200)]">{question}</p>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-5 bg-[var(--color-slate-800)]">
        <div className="flex items-start gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
            <path d="M8 1.5L3 3.7v4.2c0 3.5 2.2 5.8 5 6.6 2.8-.8 5-3.1 5-6.6V3.7L8 1.5z" stroke="var(--color-slate-400)" strokeWidth="1.3"/>
          </svg>
          <p className="text-[11px] leading-relaxed text-[var(--color-slate-400)]">
            Only this request and any attachments will be shared with eligible experts. Your payment details remain private.
          </p>
        </div>
      </div>

      {category.scopeNotice && (
        <div className="rounded-2xl p-4 mb-5 border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)]">
          <p className="text-[10px] uppercase tracking-wide font-semibold mb-1 text-[var(--color-accent-text)]">Before you continue</p>
          <p className="text-[10px] leading-relaxed text-[var(--color-slate-400)]">{category.scopeNotice}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="w-full min-h-11 rounded-2xl mb-3 border border-[var(--color-slate-700)] text-[13px] font-semibold text-[var(--color-slate-200)]"
      >
        Edit request
      </button>
      <AccentBtn onClick={onNext} className="mt-auto">
        Continue to pricing
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </AccentBtn>
    </div>
  )
}

// ─── Screen 4a: Tier selection ────────────────────────────────────────────────

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

function TierSelectionScreen({
  categoryId,
  classification,
  selectedTierId,
  onSelect,
}: {
  categoryId: CategoryId
  classification: ClassificationResult
  selectedTierId: ExpertTierId
  onSelect: (tierId: ExpertTierId) => void
}) {
  const eligible = eligibleTiersFor(categoryId)
  const complexity = classification.confidence >= 0.85 ? 'low' : classification.confidence >= 0.65 ? 'standard' : 'complex'
  const recommendedId = recommendTierFor(categoryId, complexity)
  const recommended = tiers[recommendedId]
  const others = eligible.filter((t) => t.id !== recommendedId)
  const [showOthers, setShowOthers] = useState(false)
  const [expandedTierId, setExpandedTierId] = useState<ExpertTierId | null>(null)

  const recommendationReason: Record<string, string> = {
    low: `Your request looks suitable for an ${recommended.name} — it reads as a straightforward query within this pathway.`,
    standard: `We recommend ${recommended.name === 'Academy Expert' ? 'an' : 'a'} ${recommended.name} for this request.`,
    complex: `We recommend a ${recommended.name} because your request looks more involved and may benefit from deeper experience.`,
  }

  function TierCard({ tier, isRecommended = false }: { tier: TierDefinition; isRecommended?: boolean }) {
    const expanded = expandedTierId === tier.id
    return (
      <div
        className="rounded-2xl border transition-colors"
        style={{
          background: 'var(--color-slate-900)',
          borderColor: isRecommended ? 'var(--color-accent)' : 'var(--color-slate-700)',
        }}
      >
        <div className="p-4">
          {isRecommended && (
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--color-accent-text)' }}>
              Recommended for your request
            </p>
          )}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[14px] font-semibold text-[var(--color-slate-100)]">{tier.name}</span>
                <TierBadge tierId={tier.id} />
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-slate-400)' }}>
                {tier.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="font-display text-[22px] text-[var(--color-slate-100)] leading-none">£{tier.price}</span>
              <p className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>inc. VAT</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" stroke="var(--color-slate-600)" strokeWidth="1"/>
              <path d="M5.5 3.5v2.5l1.5 1" stroke="var(--color-slate-600)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>{tier.responseTime}</span>
            <span className="text-[10px]" style={{ color: 'var(--color-slate-700)' }}>·</span>
            <span className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>{tier.suitableFor}</span>
          </div>

          {expanded && (
            <div className="mb-3 space-y-1.5 py-3 border-t" style={{ borderColor: 'var(--color-slate-800)' }}>
              {tier.details.map((d) => (
                <div key={d} className="flex items-start gap-2">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0 mt-0.5">
                    <path d="M2 5l2 2 4-4" stroke="var(--color-slate-500)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[11px]" style={{ color: 'var(--color-slate-400)' }}>{d}</span>
                </div>
              ))}
              {tier.hasExternalQualification ? (
                <p className="text-[10px] mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-slate-800)', color: 'var(--color-slate-600)' }}>
                  External professional qualification reviewed by SpeciaList.
                </p>
              ) : (
                <p className="text-[10px] mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-slate-800)', color: 'var(--color-slate-600)' }}>
                  No external professional qualification implied.
                </p>
              )}
              {tier.isSupervised && (
                <p className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>
                  Expert payout: £{tier.expertPayout} of your fee goes to the supervisor and candidate.
                </p>
              )}
              {!tier.isSupervised && (
                <p className="text-[10px]" style={{ color: 'var(--color-slate-600)' }}>
                  Expert payout: £{tier.expertPayout} of your fee.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <AccentBtn
              onClick={() => onSelect(tier.id)}
              className="flex-1"
            >
              Select {tier.name}
            </AccentBtn>
            <button
              type="button"
              onClick={() => setExpandedTierId(expanded ? null : tier.id)}
              className="min-h-11 px-3 rounded-2xl border text-[11px] font-semibold flex-shrink-0"
              style={{ borderColor: 'var(--color-slate-700)', color: 'var(--color-slate-400)' }}
            >
              {expanded ? 'Less' : 'Details'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="pt-2 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-slate-600)]">
          Step 3 of 5
        </p>
        <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
          Choose your Expert level
        </h2>
      </div>

      <ProgressTrack total={5} done={3} />

      {/* Recommendation rationale */}
      <div className="rounded-2xl p-4 mb-4 border" style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent-border)' }}>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-slate-200)' }}>
          {recommendationReason[complexity]}
        </p>
      </div>

      {/* Recommended card */}
      <div className="mb-4">
        <TierCard tier={recommended} isRecommended />
      </div>

      {/* Compare toggle */}
      <button
        type="button"
        onClick={() => setShowOthers(!showOthers)}
        className="w-full min-h-11 rounded-2xl border mb-4 text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors"
        style={{ borderColor: 'var(--color-slate-700)', color: 'var(--color-slate-400)' }}
      >
        {showOthers ? 'Hide other options' : 'Compare other Expert levels'}
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`transition-transform duration-200 ${showOthers ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {showOthers && (
        <div className="space-y-3 mb-4">
          {others.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      )}

      <p className="text-center text-[10px] leading-relaxed" style={{ color: 'var(--color-slate-600)' }}>
        Your chosen level will be matched exactly. If no one is available you will be offered alternatives before any charge.
      </p>
    </div>
  )
}

// ─── Screen 4b: Pricing ───────────────────────────────────────────────────────

function PricingScreen({
  category,
  tierId,
  onNext,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  onNext: () => void
}) {
  const [agreed, setAgreed] = useState(false)
  const tier = tiers[tierId]
  const vatAmount = +(tier.price - tier.price / 1.2).toFixed(2)
  const platformFee = +(tier.price / 1.2 - tier.expertPayout).toFixed(2)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 animate-fade-in">
      <div className="flex items-center pt-2 pb-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-slate-600)' }}>
            Step 4 of 5
          </p>
          <h2 className="text-[var(--color-slate-100)] text-[17px] font-semibold leading-tight">
            Review &amp; authorise
          </h2>
        </div>
      </div>

      <ProgressTrack total={5} done={4}/>

      {/* Selected tier reminder */}
      <div className="flex items-center gap-2 mb-4">
        <TierBadge tierId={tierId} size="md" />
        <span className="text-[12px] font-medium" style={{ color: 'var(--color-slate-200)' }}>{tier.name}</span>
      </div>

      {/* Price card — structural shell, accent only on the total value */}
      <div
        className="rounded-3xl p-6 mb-5 border"
        style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-slate-400)' }}>
              One-off consultation fee
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

        <div className="space-y-2.5 pt-4 border-t" style={{ borderColor: 'var(--color-slate-800)' }}>
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
            <span className="text-[13px] font-semibold text-[var(--color-slate-100)]">Total authorised today</span>
            <span className="text-[15px] font-bold" style={{ color: 'var(--color-accent-text)' }}>£{tier.price.toFixed(2)}</span>
          </div>
        </div>
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
        <button className="text-[12px] font-semibold" style={{ color: 'var(--color-accent-text)' }}>
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
          I authorise SpeciaList to reserve £{tier.price.toFixed(2)} on my card. It will only be charged when an expert accepts. I have read and agree to the{' '}
          <span className="underline" style={{ color: 'var(--color-accent-text)' }}>Terms of Service</span> and{' '}
          <span className="underline" style={{ color: 'var(--color-accent-text)' }}>Privacy Policy</span>.
        </p>
      </button>

      <AccentBtn onClick={onNext} disabled={!agreed} className="mt-auto">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="6" width="12" height="9" rx="2" stroke="white" strokeWidth="1.6"/>
          <path d="M5 6V4.5a3 3 0 016 0V6" stroke="white" strokeWidth="1.6"/>
        </svg>
        Authorise &amp; match — £{tier.price}
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
    'Authorising payment securely…',
    `Searching ${tierName} ${category.matchingNoun}…`,
    'Checking availability…',
    'Confirming your match…',
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
      {/* Progress ring — accent for the live arc, structural for the track */}
      <div className="relative w-36 h-36 mb-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track — structural 30% */}
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-slate-800)" strokeWidth="6"/>
          <circle cx="60" cy="60" r="40" fill="none" stroke="var(--color-slate-900)" strokeWidth="4"/>
          {/* Arc — accent 10%, the only green on the screen */}
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="var(--color-accent)" strokeWidth="6"
            strokeLinecap="round"
            className="progress-arc"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border"
            style={{ background: 'var(--color-slate-900)', borderColor: 'var(--color-slate-700)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 4a5 5 0 100 10 5 5 0 000-10z" stroke="var(--color-slate-400)" strokeWidth="1.8"/>
              <path d="M5 24c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="var(--color-slate-400)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <h2 className="font-display text-[28px] text-[var(--color-slate-100)] text-center leading-[1.2] mb-3">
        Finding your<br/>expert…
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
  onNext,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
  onRematch: () => void
  onNext: () => void
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

      <button
        type="button"
        onClick={onRematch}
        className="w-full min-h-11 rounded-2xl mb-3 border border-[var(--color-slate-700)] text-[13px] font-semibold text-[var(--color-slate-400)]"
      >
        Request another match
      </button>
      <AccentBtn onClick={onNext} className="mt-auto">
        Start consultation
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </AccentBtn>
    </div>
  )
}

// ─── Screen 7: Chat ───────────────────────────────────────────────────────────

function ChatScreen({
  category,
  tierId,
  onComplete,
}: {
  category: CategoryDefinition
  tierId: ExpertTierId
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

          <button
            type="button"
            onClick={onComplete}
            className="min-h-10 px-3 rounded-xl border flex-shrink-0 text-[11px] font-semibold"
            style={{ background: 'var(--color-slate-800)', borderColor: 'var(--color-slate-700)' }}
          >
            End
          </button>
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
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-accent-text)' }}>Online now</span>
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
  const [rating, setRating] = useState(0)
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

      <div className="text-center mb-5">
        <p className="text-[11px] mb-2 text-[var(--color-slate-400)]">How useful was this consultation?</p>
        <div className="flex items-center justify-center gap-2" aria-label="Rate consultation">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              aria-pressed={rating >= value}
              className="w-9 h-9 rounded-xl text-[20px] transition-colors"
              style={{
                color: rating >= value ? '#f59e0b' : 'var(--color-slate-600)',
                background: rating >= value ? 'var(--color-slate-900)' : 'transparent',
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <FeedbackPrompt
        questionId="client-useful-next-step"
        question="Did this consultation give you a useful next step?"
        options={['Yes', 'Partly', 'No']}
      />
      <FeedbackPrompt
        questionId="client-tier-clarity"
        question="Was the difference between Expert levels clear?"
        options={['Yes', 'Somewhat', 'No']}
      />

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

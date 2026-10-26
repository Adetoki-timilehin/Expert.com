import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import FeedbackPrompt from '../../components/feedback/FeedbackPrompt'
import { categories } from '../../data/categories'

type ApplicationStep = 'category' | 'evidence' | 'profile' | 'review' | 'submitted'
type ExpertApplicationCategory = 'plumber'

type Requirement = {
  title: string
  detail: string
  optional?: boolean
}

const requirements: Record<ExpertApplicationCategory, Requirement[]> = {
  plumber: [
    { title: 'Identity and business check', detail: 'Photo identification and trading details' },
    { title: 'Public liability insurance', detail: 'Current policy evidence' },
    { title: 'Trade qualifications', detail: 'City & Guilds, NVQ or equivalent evidence' },
    { title: 'Professional references', detail: 'Two recent customer or trade references' },
    { title: 'Gas Safe registration', detail: 'Required only when offering gas-related work', optional: true },
  ],
}

const orderedSteps: ApplicationStep[] = ['category', 'evidence', 'profile', 'review', 'submitted']

function getInitialStep(): ApplicationStep {
  const saved = localStorage.getItem('specialist.expert.applicationStep') as ApplicationStep | null
  return saved && orderedSteps.includes(saved) ? saved : 'category'
}

export default function ExpertApplication() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ApplicationStep>(getInitialStep)
  const [categoryId, setCategoryId] = useState<ExpertApplicationCategory>(() =>
    'plumber'
  )
  const [completedEvidence, setCompletedEvidence] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('specialist.expert.evidence') || '[]')
    } catch {
      return []
    }
  })
  const [name, setName] = useState(() => localStorage.getItem('specialist.expert.name') || 'Alex Morgan')
  const [title, setTitle] = useState(() => localStorage.getItem('specialist.expert.title') || '')
  const [bio, setBio] = useState(() => localStorage.getItem('specialist.expert.bio') || '')
  const [experience, setExperience] = useState(() => localStorage.getItem('specialist.expert.experience') || '5')

  const category = categories[categoryId]
  const categoryRequirements = requirements[categoryId]
  const allEvidenceReady = categoryRequirements.every((item) => item.optional || completedEvidence.includes(item.title))

  useEffect(() => {
    localStorage.setItem('specialist.expert.applicationStep', step)
    localStorage.setItem('specialist.expert.category', categoryId)
    localStorage.setItem('specialist.expert.evidence', JSON.stringify(completedEvidence))
    localStorage.setItem('specialist.expert.name', name)
    localStorage.setItem('specialist.expert.title', title)
    localStorage.setItem('specialist.expert.bio', bio)
    localStorage.setItem('specialist.expert.experience', experience)
  }, [step, categoryId, completedEvidence, name, title, bio, experience])

  function goBack() {
    const currentIndex = orderedSteps.indexOf(step)
    if (currentIndex <= 0 || step === 'submitted') {
      navigate('/expert')
      return
    }
    setStep(orderedSteps[currentIndex - 1])
  }

  function selectCategory(nextCategory: ExpertApplicationCategory) {
    setCategoryId(nextCategory)
    setCompletedEvidence([])
    setTitle('Emergency Plumbing Specialist')
    setBio('Experienced plumbing professional providing clear guidance for urgent household issues.')
  }

  function toggleEvidence(title: string) {
    setCompletedEvidence((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title]
    )
  }

  const progress = Math.min(orderedSteps.indexOf(step) + 1, 4)

  return (
    <AppShell
      statusLabel="Expert application"
      onBack={goBack}
      onHome={() => navigate('/expert')}
    >
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8">
        {step !== 'submitted' && (
          <div className="flex gap-1.5 pt-2 mb-7" aria-label={`Application step ${progress} of 4`}>
            {[1, 2, 3, 4].map((item) => (
              <span
                key={item}
                className="h-1 flex-1 rounded-full"
                style={{ background: item <= progress ? 'var(--color-accent)' : 'var(--color-slate-800)' }}
              />
            ))}
          </div>
        )}

        {step === 'category' && (
          <CategoryStep
            selected={categoryId}
            onSelect={selectCategory}
            onNext={() => setStep('evidence')}
          />
        )}

        {step === 'evidence' && (
          <EvidenceStep
            categoryId={categoryId}
            items={categoryRequirements}
            completed={completedEvidence}
            onToggle={toggleEvidence}
            onNext={() => setStep('profile')}
            ready={allEvidenceReady}
          />
        )}

        {step === 'profile' && (
          <ProfileStep
            categoryName={category.name}
            name={name}
            title={title}
            bio={bio}
            experience={experience}
            onNameChange={setName}
            onTitleChange={setTitle}
            onBioChange={setBio}
            onExperienceChange={setExperience}
            onNext={() => setStep('review')}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            categoryName={category.name}
            name={name}
            title={title}
            bio={bio}
            experience={experience}
            evidenceCount={completedEvidence.length}
            onEditProfile={() => setStep('profile')}
            onSubmit={() => setStep('submitted')}
          />
        )}

        {step === 'submitted' && (
          <SubmittedStep
            categoryName={category.name}
            onExpertHome={() => navigate('/expert')}
            onApprovedPreview={() => navigate('/expert/dashboard')}
            onRoleHome={() => navigate('/expert')}
          />
        )}
      </main>
    </AppShell>
  )
}

function StepHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mb-7">
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold mb-2 text-[var(--color-slate-400)]">{eyebrow}</p>
      <h1 className="font-display text-[32px] leading-tight mb-3 text-[var(--color-slate-100)]">{title}</h1>
      <p className="text-[13px] leading-relaxed text-[var(--color-slate-400)]">{body}</p>
    </div>
  )
}

function PrimaryAction({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full min-h-13 mt-auto rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[14px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  )
}

function CategoryStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: ExpertApplicationCategory
  onSelect: (category: ExpertApplicationCategory) => void
  onNext: () => void
}) {
  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <StepHeading
        eyebrow="Step 1 of 4"
        title="Choose your professional category"
        body="Your category determines the evidence we review and the requests you can receive."
      />
      <div className="space-y-3 mb-7">
        {(['plumber'] as ExpertApplicationCategory[]).map((id) => {
          const item = categories[id]
          const active = selected === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-pressed={active}
              className="w-full rounded-3xl p-5 border text-left transition-colors"
              style={{
                background: active ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                borderColor: active ? 'var(--color-accent)' : 'var(--color-slate-700)',
              }}
            >
              <span className="block text-[15px] font-semibold mb-1 text-[var(--color-slate-100)]">{item.name}</span>
              <span className="block text-[11px] leading-relaxed text-[var(--color-slate-400)]">{item.intakeLabel}</span>
            </button>
          )
        })}
      </div>
      <PrimaryAction onClick={onNext}>Continue to evidence</PrimaryAction>
    </div>
  )
}

function EvidenceStep({
  categoryId,
  items,
  completed,
  onToggle,
  onNext,
  ready,
}: {
  categoryId: ExpertApplicationCategory
  items: Requirement[]
  completed: string[]
  onToggle: (title: string) => void
  onNext: () => void
  ready: boolean
}) {
  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <StepHeading
        eyebrow="Step 2 of 4"
        title="Confirm your evidence"
        body="For this validation build, select each item to simulate attaching acceptable evidence."
      />
      <div className="space-y-3 mb-5">
        {items.map((item) => {
          const checked = completed.includes(item.title)
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onToggle(item.title)}
              aria-pressed={checked}
              className="w-full rounded-2xl p-4 border flex items-start gap-3 text-left"
              style={{
                background: checked ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                borderColor: checked ? 'var(--color-accent-border)' : 'var(--color-slate-700)',
              }}
            >
              <span
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  background: checked ? 'var(--color-accent)' : 'transparent',
                  borderColor: checked ? 'var(--color-accent)' : 'var(--color-slate-600)',
                }}
              >
                {checked && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span>
                <span className="flex items-center gap-2 text-[13px] font-semibold mb-1 text-[var(--color-slate-100)]">
                  {item.title}
                  {item.optional && (
                    <span className="text-[9px] uppercase tracking-wide font-semibold text-[var(--color-slate-600)]">Optional</span>
                  )}
                </span>
                <span className="block text-[11px] leading-relaxed text-[var(--color-slate-400)]">{item.detail}</span>
              </span>
            </button>
          )
        })}
      </div>
      {categoryId === 'plumber' && (
        <p className="text-[10px] leading-relaxed mb-5 text-[var(--color-slate-600)]">
          Gas Safe registration is only required for experts who choose to handle gas-related requests.
        </p>
      )}
      <PrimaryAction onClick={onNext} disabled={!ready}>Continue to profile</PrimaryAction>
    </div>
  )
}

function ProfileStep({
  categoryName,
  name,
  title,
  bio,
  experience,
  onNameChange,
  onTitleChange,
  onBioChange,
  onExperienceChange,
  onNext,
}: {
  categoryName: string
  name: string
  title: string
  bio: string
  experience: string
  onNameChange: (value: string) => void
  onTitleChange: (value: string) => void
  onBioChange: (value: string) => void
  onExperienceChange: (value: string) => void
  onNext: () => void
}) {
  const ready = name.trim() && title.trim() && bio.trim().length >= 40 && Number(experience) > 0

  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <StepHeading
        eyebrow="Step 3 of 4"
        title="Create your expert profile"
        body={`Clients searching ${categoryName.toLowerCase()} will see this information before starting a consultation.`}
      />
      <div className="space-y-4 mb-6">
        <Field label="Display name" value={name} onChange={onNameChange}/>
        <Field label="Professional title" value={title} onChange={onTitleChange}/>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide font-medium mb-2 text-[var(--color-slate-400)]">Professional summary</span>
          <textarea
            value={bio}
            onChange={(event) => onBioChange(event.target.value)}
            rows={4}
            maxLength={300}
            className="w-full rounded-2xl px-4 py-3 resize-none outline-none text-[13px] leading-relaxed bg-[var(--color-slate-900)] text-[var(--color-slate-100)] border border-[var(--color-slate-700)] focus:border-[var(--color-accent)]"
          />
          <span className="block text-right mt-1 text-[10px] text-[var(--color-slate-600)]">{bio.length}/300</span>
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wide font-medium mb-2 text-[var(--color-slate-400)]">Years of experience</span>
          <input
            type="number"
            min="1"
            max="60"
            value={experience}
            onChange={(event) => onExperienceChange(event.target.value)}
            className="w-full h-12 rounded-2xl px-4 outline-none text-[13px] bg-[var(--color-slate-900)] text-[var(--color-slate-100)] border border-[var(--color-slate-700)] focus:border-[var(--color-accent)]"
          />
        </label>
      </div>
      <PrimaryAction onClick={onNext} disabled={!ready}>Review application</PrimaryAction>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide font-medium mb-2 text-[var(--color-slate-400)]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-12 rounded-2xl px-4 outline-none text-[13px] bg-[var(--color-slate-900)] text-[var(--color-slate-100)] border border-[var(--color-slate-700)] focus:border-[var(--color-accent)]"
      />
    </label>
  )
}

function ReviewStep({
  categoryName,
  name,
  title,
  bio,
  experience,
  evidenceCount,
  onEditProfile,
  onSubmit,
}: {
  categoryName: string
  name: string
  title: string
  bio: string
  experience: string
  evidenceCount: number
  onEditProfile: () => void
  onSubmit: () => void
}) {
  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <StepHeading
        eyebrow="Step 4 of 4"
        title="Review your application"
        body="Check what the review team and future clients will see before submitting."
      />
      <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-[var(--color-accent-soft)] text-[var(--color-accent-text)] font-bold">
          {name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <h2 className="text-[16px] font-semibold text-[var(--color-slate-100)]">{name}</h2>
        <p className="text-[12px] mb-3 text-[var(--color-accent-text)]">{title}</p>
        <p className="text-[12px] leading-relaxed text-[var(--color-slate-400)]">{bio}</p>
      </div>
      <div className="rounded-2xl p-4 mb-5 space-y-3 bg-[var(--color-slate-800)]">
        <SummaryRow label="Category" value={categoryName}/>
        <SummaryRow label="Experience" value={`${experience} years`}/>
        <SummaryRow label="Evidence attached" value={`${evidenceCount} items`}/>
        <SummaryRow label="Application fee" value="No fee"/>
      </div>
      <p className="text-[10px] leading-relaxed mb-5 text-[var(--color-slate-600)]">
        Submission does not guarantee approval. Evidence is reviewed against category-specific requirements before an expert profile can go live.
      </p>
      <button
        type="button"
        onClick={onEditProfile}
        className="w-full min-h-11 rounded-2xl mb-3 border border-[var(--color-slate-700)] text-[12px] font-semibold text-[var(--color-slate-400)]"
      >
        Edit profile
      </button>
      <PrimaryAction onClick={onSubmit}>Submit for review</PrimaryAction>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] text-[var(--color-slate-400)]">{label}</span>
      <span className="text-[11px] font-semibold text-right text-[var(--color-slate-200)]">{value}</span>
    </div>
  )
}

function SubmittedStep({
  categoryName,
  onExpertHome,
  onApprovedPreview,
  onRoleHome,
}: {
  categoryName: string
  onExpertHome: () => void
  onApprovedPreview: () => void
  onRoleHome: () => void
}) {
  return (
    <div className="min-h-full flex flex-col items-center text-center pt-12 animate-fade-in">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 bg-[var(--color-accent)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12l4.5 4.5L19 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-[11px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-accent-text)]">Application submitted</p>
      <h1 className="font-display text-[32px] leading-tight mb-3 text-[var(--color-slate-100)]">Your evidence is under review</h1>
      <p className="text-[13px] leading-relaxed mb-7 text-[var(--color-slate-400)]">
        We’ll review your {categoryName.toLowerCase()} application and request more information if anything is unclear.
      </p>
      <div className="w-full rounded-3xl p-5 text-left mb-6 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <SummaryRow label="Status" value="Under review"/>
        <div className="h-px my-3 bg-[var(--color-slate-700)]"/>
        <SummaryRow label="Typical review time" value="2–3 working days"/>
        <div className="h-px my-3 bg-[var(--color-slate-700)]"/>
        <SummaryRow label="Outstanding actions" value="None"/>
      </div>
      <FeedbackPrompt
        questionId="expert-verification-requirements"
        question="How did the verification requirements feel?"
        options={['Expected', 'Too demanding', 'Unclear']}
      />
      <PrimaryAction onClick={onApprovedPreview}>Preview approved workspace</PrimaryAction>
      <button
        type="button"
        onClick={onExpertHome}
        className="w-full min-h-11 mt-3 rounded-2xl text-[12px] font-semibold text-[var(--color-slate-400)]"
      >
        Return to application workspace
      </button>
      <button type="button" onClick={onRoleHome} className="text-[11px] mt-2 text-[var(--color-slate-600)]">Switch role</button>
    </div>
  )
}

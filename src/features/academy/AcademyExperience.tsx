import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import FeedbackPrompt from '../../components/feedback/FeedbackPrompt'

type AcademyScreen = 'overview' | 'pathway' | 'lesson' | 'assessment' | 'result' | 'progress'

const academyScreens: AcademyScreen[] = ['overview', 'pathway', 'lesson', 'assessment', 'result', 'progress']

function getInitialScreen(): AcademyScreen {
  const saved = localStorage.getItem('specialist.academy.screen') as AcademyScreen | null
  return saved && academyScreens.includes(saved) ? saved : 'overview'
}

export default function AcademyExperience() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<AcademyScreen>(getInitialScreen)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    () => localStorage.getItem('specialist.academy.answer')
  )
  const [passed, setPassed] = useState(
    () => localStorage.getItem('specialist.academy.passed') === 'true'
  )

  useEffect(() => {
    localStorage.setItem('specialist.academy.screen', screen)
    if (selectedAnswer) {
      localStorage.setItem('specialist.academy.answer', selectedAnswer)
    } else {
      localStorage.removeItem('specialist.academy.answer')
    }
    localStorage.setItem('specialist.academy.passed', String(passed))
  }, [screen, selectedAnswer, passed])

  function goBack() {
    const previous: Record<AcademyScreen, AcademyScreen | null> = {
      overview: null,
      pathway: 'overview',
      lesson: 'pathway',
      assessment: 'lesson',
      result: 'assessment',
      progress: 'result',
    }
    const target = previous[screen]
    if (target) {
      setScreen(target)
      return
    }
    navigate('/expert')
  }

  function submitAssessment() {
    if (!selectedAnswer) return
    setPassed(selectedAnswer === 'clarify')
    setScreen('result')
  }

  return (
    <AppShell statusLabel="Peasy Academy" onBack={goBack} onHome={() => navigate('/expert')}>
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8">
        {screen === 'overview' && <AcademyOverview onExplore={() => setScreen('pathway')}/>}
        {screen === 'pathway' && <PathwayDetail onStart={() => setScreen('lesson')}/>}
        {screen === 'lesson' && <SampleLesson onContinue={() => setScreen('assessment')}/>}
        {screen === 'assessment' && (
          <ScenarioAssessment
            selected={selectedAnswer}
            onSelect={setSelectedAnswer}
            onSubmit={submitAssessment}
          />
        )}
        {screen === 'result' && (
          <AssessmentResult
            passed={passed}
            onRetry={() => {
              setSelectedAnswer(null)
              setScreen('assessment')
            }}
            onProgress={() => setScreen('progress')}
          />
        )}
        {screen === 'progress' && (
          <CandidateProgress
            assessmentPassed={passed}
            onExpertHome={() => navigate('/expert')}
            onReset={() => {
              setSelectedAnswer(null)
              setPassed(false)
              setScreen('overview')
            }}
          />
        )}
      </main>
    </AppShell>
  )
}

function AcademyHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="pt-2 mb-7">
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold mb-3 text-[var(--color-slate-400)]">{eyebrow}</p>
      <h1 className="font-display text-[34px] leading-[1.1] mb-3 text-[var(--color-slate-100)]">{title}</h1>
      <p className="text-[13px] leading-relaxed text-[var(--color-slate-400)]">{body}</p>
    </div>
  )
}

function AcademyAction({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
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

function AcademyOverview({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <AcademyHeading
        eyebrow="Build trusted expertise"
        title="Learn, practise and prove what you can do"
        body="Academy pathways combine focused learning, scenario assessment and supervised experience for eligible low-risk specialties."
      />

      <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-accent-soft)] border-[var(--color-accent-border)]">
        <p className="text-[11px] uppercase tracking-wide font-semibold mb-3 text-[var(--color-accent-text)]">What Academy Expert status means</p>
        <div className="space-y-3">
          {[
            'Your identity and assessment results are checked',
            'Practical work is reviewed against a clear standard',
            'Clients can see exactly how your status was earned',
          ].map((item) => (
            <CheckItem key={item}>{item}</CheckItem>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-6 bg-[var(--color-slate-800)]">
        <p className="text-[11px] font-semibold mb-2 text-[var(--color-slate-200)]">Important boundary</p>
        <p className="text-[11px] leading-relaxed text-[var(--color-slate-400)]">
          Academy Expert status is an internal training achievement, not a regulated or external professional qualification. Academy Candidates cannot handle safety-critical, safeguarding-sensitive or regulated requests.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-wide font-semibold mb-3 text-[var(--color-slate-400)]">Available pathway</p>
        <button
          type="button"
          onClick={onExplore}
          className="w-full rounded-3xl p-5 border text-left bg-[var(--color-slate-900)] border-[var(--color-slate-700)] hover:border-[var(--color-accent)] transition-colors"
        >
          <span className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-[15px] font-semibold mb-1 text-[var(--color-slate-100)]">Career Application Specialist</span>
              <span className="block text-[11px] leading-relaxed text-[var(--color-slate-400)]">Help clients strengthen CVs, applications and interview preparation.</span>
            </span>
            <span className="rounded-full px-2.5 py-1 text-[9px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]">Low risk</span>
          </span>
          <span className="flex items-center gap-4 mt-4 text-[10px] text-[var(--color-slate-600)]">
            <span>5 modules</span>
            <span>6 hours</span>
            <span>Assessed</span>
          </span>
        </button>
      </div>

      <AcademyAction onClick={onExplore}>Explore pathway</AcademyAction>
    </div>
  )
}

function PathwayDetail({ onStart }: { onStart: () => void }) {
  const modules = [
    'Understanding the client brief',
    'Evidence-led CV review',
    'Application writing principles',
    'Inclusive interview preparation',
    'Scope, ethics and escalation',
  ]

  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <AcademyHeading
        eyebrow="Career Application Specialist"
        title="A practical route to supported client work"
        body="Build the skills to review career materials clearly, ethically and within a defined non-regulated scope."
      />

      <div className="grid grid-cols-3 gap-2 mb-5">
        <Metric value="5" label="Modules"/>
        <Metric value="80%" label="Pass mark"/>
        <Metric value="3" label="Supervised"/>
      </div>

      <div className="rounded-2xl p-4 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <p className="text-[10px] uppercase tracking-wide mb-2 text-[var(--color-slate-600)]">Client-facing status preview</p>
        <span className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold bg-[var(--color-slate-800)] text-[var(--color-slate-200)]">
          Academy Expert
        </span>
        <p className="text-[10px] leading-relaxed mt-2 text-[var(--color-slate-400)]">
          Career Application pathway · Trained and assessed by Peasy · Not an external professional qualification
        </p>
      </div>

      <div className="rounded-3xl p-5 mb-4 bg-[var(--color-slate-900)] border border-[var(--color-slate-700)]">
        <p className="text-[11px] uppercase tracking-wide font-semibold mb-4 text-[var(--color-slate-400)]">Curriculum</p>
        <div className="space-y-3">
          {modules.map((module, index) => (
            <div key={module} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[var(--color-slate-800)] text-[var(--color-slate-400)]">{index + 1}</span>
              <span className="text-[12px] text-[var(--color-slate-200)]">{module}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-6 bg-[var(--color-accent-soft)]">
        <p className="text-[11px] font-semibold mb-1 text-[var(--color-accent-text)]">Academy Expert requirements</p>
        <p className="text-[11px] leading-relaxed text-[var(--color-slate-400)]">
          Complete all modules, pass the scenario assessment, submit one practical assignment and complete three reviewed consultations.
        </p>
      </div>

      <AcademyAction onClick={onStart}>Start sample module</AcademyAction>
    </div>
  )
}

function SampleLesson({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <AcademyHeading
        eyebrow="Module 1 · Sample lesson"
        title="Clarify before you advise"
        body="A strong application review begins by understanding the client’s target role, evidence and constraints."
      />

      <div className="rounded-3xl p-5 mb-4 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <p className="text-[11px] uppercase tracking-wide font-semibold mb-3 text-[var(--color-accent-text)]">The three-question check</p>
        <div className="space-y-4">
          <LessonPoint number="1" title="What is the target?" body="Identify the exact role, level and sector rather than assuming from a generic job title."/>
          <LessonPoint number="2" title="What evidence exists?" body="Separate demonstrable achievements from claims that need clarification or supporting detail."/>
          <LessonPoint number="3" title="What must remain truthful?" body="Improve relevance and clarity without inventing experience, metrics or qualifications."/>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-5 bg-[var(--color-slate-800)]">
        <p className="text-[11px] font-semibold mb-2 text-[var(--color-slate-200)]">Scope reminder</p>
        <p className="text-[11px] leading-relaxed text-[var(--color-slate-400)]">
          A Career Application Specialist can improve presentation and preparation. They must not guarantee employment, fabricate evidence or provide regulated immigration or legal advice.
        </p>
      </div>

      <AcademyAction onClick={onContinue}>Try scenario assessment</AcademyAction>
    </div>
  )
}

function ScenarioAssessment({
  selected,
  onSelect,
  onSubmit,
}: {
  selected: string | null
  onSelect: (answer: string) => void
  onSubmit: () => void
}) {
  const [answers] = useState(() => {
    const items = [
      { id: 'rewrite', text: 'Rewrite the CV immediately using stronger achievements that sound appropriate for the role.' },
      { id: 'clarify', text: 'Ask which role they are targeting and request examples or evidence for the responsibilities they mention.' },
      { id: 'guarantee', text: 'Promise a complete rewrite that will secure interviews, then request payment for additional sessions.' },
    ]
    for (let index = items.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1))
      const current = items[index]
      items[index] = items[target]
      items[target] = current
    }
    return items
  })

  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <AcademyHeading
        eyebrow="Scenario assessment"
        title="Choose the most responsible first action"
        body="A client shares a generic CV and says, “Make this strong enough for a senior role.” Their target role and measurable achievements are unclear."
      />

      <div className="rounded-2xl p-4 mb-4 flex items-start gap-3 bg-[var(--color-accent-soft)]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
          <path d="M9 2L4 4.2v4.2c0 3.5 2.2 5.8 5 6.6 2.8-.8 5-3.1 5-6.6V4.2L9 2z" stroke="var(--color-accent)" strokeWidth="1.4"/>
          <path d="M7 8.5l1.4 1.4L11.5 7" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <p className="text-[11px] font-semibold text-[var(--color-accent-text)]">Assessment integrity</p>
          <p className="text-[10px] leading-relaxed mt-1 text-[var(--color-slate-400)]">
            Answer order is randomized. Academy Expert status also requires identity checks, reviewed practical work and supervised consultations.
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6" role="radiogroup" aria-label="Assessment answer">
        {answers.map((answer, index) => {
          const active = selected === answer.id
          return (
            <button
              key={answer.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(answer.id)}
              className="w-full rounded-2xl p-4 border flex items-start gap-3 text-left"
              style={{
                background: active ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                borderColor: active ? 'var(--color-accent)' : 'var(--color-slate-700)',
              }}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold bg-[var(--color-slate-800)] text-[var(--color-slate-400)]">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-[12px] leading-relaxed text-[var(--color-slate-200)]">{answer.text}</span>
            </button>
          )
        })}
      </div>

      <AcademyAction onClick={onSubmit} disabled={!selected}>Submit answer</AcademyAction>
    </div>
  )
}

function AssessmentResult({
  passed,
  onRetry,
  onProgress,
}: {
  passed: boolean
  onRetry: () => void
  onProgress: () => void
}) {
  return (
    <div className="min-h-full flex flex-col items-center text-center pt-10 animate-fade-in">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ background: passed ? 'var(--color-accent)' : 'var(--color-slate-800)' }}
      >
        {passed ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l4.5 4.5L19 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <span className="text-[22px] text-[var(--color-slate-400)]">!</span>
        )}
      </div>
      <p className="text-[11px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-accent-text)]">
        {passed ? 'Scenario passed' : 'Development needed'}
      </p>
      <h1 className="font-display text-[32px] leading-tight mb-3 text-[var(--color-slate-100)]">
        {passed ? 'Good judgement' : 'Review the client brief first'}
      </h1>
      <p className="text-[13px] leading-relaxed mb-6 text-[var(--color-slate-400)]">
        {passed
          ? 'Clarifying the target and available evidence protects accuracy and creates a stronger foundation for useful advice.'
          : 'The responsible first step is to clarify the target role and ask for evidence. Specialists must not invent achievements or guarantee an outcome.'}
      </p>

      <div className="w-full rounded-3xl p-5 text-left mb-6 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <ResultRow label="Client discovery" value={passed ? 'Competent' : 'Review'}/>
        <div className="h-px my-3 bg-[var(--color-slate-700)]"/>
        <ResultRow label="Evidence integrity" value={passed ? 'Competent' : 'Review'}/>
        <div className="h-px my-3 bg-[var(--color-slate-700)]"/>
        <ResultRow label="Scope awareness" value={passed ? 'Competent' : 'Review'}/>
      </div>

      <div className="w-full">
        <FeedbackPrompt
          questionId="academy-credibility"
          question="Does this pathway feel professionally credible?"
          options={['Yes', 'Partly', 'No']}
        />
      </div>

      {passed ? (
        <AcademyAction onClick={onProgress}>View candidate progress</AcademyAction>
      ) : (
        <AcademyAction onClick={onRetry}>Review and try again</AcademyAction>
      )}
    </div>
  )
}

function CandidateProgress({
  assessmentPassed,
  onExpertHome,
  onReset,
}: {
  assessmentPassed: boolean
  onExpertHome: () => void
  onReset: () => void
}) {
  const stages = [
    { title: 'Learning modules', detail: '1 of 5 sampled', state: 'active' },
    { title: 'Scenario assessment', detail: assessmentPassed ? 'Sample passed' : 'Not passed', state: assessmentPassed ? 'done' : 'pending' },
    { title: 'Practical assignment', detail: 'Not started', state: 'pending' },
    { title: 'Supervised consultations', detail: '0 of 3', state: 'pending' },
    { title: 'Quality review', detail: 'Locked', state: 'pending' },
  ]

  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      <AcademyHeading
        eyebrow="Academy Candidate"
        title="Your pathway progress"
        body="Complete every stage before applying for Academy Expert status."
      />

      <div className="rounded-3xl p-5 mb-5 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--color-slate-400)]">Pathway completion</p>
            <p className="font-display text-[30px] text-[var(--color-slate-100)]">20%</p>
          </div>
          <span className="text-[10px] font-semibold text-[var(--color-accent-text)]">Career applications</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-[var(--color-slate-800)]">
          <div className="h-full w-1/5 rounded-full bg-[var(--color-accent)]"/>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {stages.map((stage, index) => (
          <div key={stage.title} className="flex items-center gap-3 rounded-2xl p-4 bg-[var(--color-slate-900)]">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
              style={{
                background: stage.state === 'done' ? 'var(--color-accent)' : stage.state === 'active' ? 'var(--color-accent-soft)' : 'var(--color-slate-800)',
                color: stage.state === 'done' ? 'white' : stage.state === 'active' ? 'var(--color-accent-text)' : 'var(--color-slate-600)',
              }}
            >
              {stage.state === 'done' ? '✓' : index + 1}
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-[var(--color-slate-200)]">{stage.title}</span>
              <span className="block text-[10px] mt-0.5 text-[var(--color-slate-600)]">{stage.detail}</span>
            </span>
          </div>
        ))}
      </div>

      <AcademyAction onClick={onExpertHome}>Return to expert workspace</AcademyAction>
      <button type="button" onClick={onReset} className="min-h-10 mt-2 text-[11px] text-[var(--color-slate-600)]">Reset Academy demo</button>
    </div>
  )
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--color-accent)]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <span className="text-[11px] leading-relaxed text-[var(--color-slate-200)]">{children}</span>
    </div>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl p-3 text-center bg-[var(--color-slate-900)] border border-[var(--color-slate-700)]">
      <span className="block font-display text-[24px] text-[var(--color-slate-100)]">{value}</span>
      <span className="block text-[9px] uppercase tracking-wide text-[var(--color-slate-600)]">{label}</span>
    </div>
  )
}

function LessonPoint({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]">{number}</span>
      <span>
        <span className="block text-[12px] font-semibold mb-1 text-[var(--color-slate-200)]">{title}</span>
        <span className="block text-[11px] leading-relaxed text-[var(--color-slate-400)]">{body}</span>
      </span>
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[var(--color-slate-400)]">{label}</span>
      <span className="text-[11px] font-semibold text-[var(--color-accent-text)]">{value}</span>
    </div>
  )
}

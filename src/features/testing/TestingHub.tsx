import { useState } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import {
  clearFeedbackResponses,
  downloadFeedbackResponses,
  getFeedbackResponses,
  resetJourneyState,
} from '../../lib/feedback'

type Scenario = {
  id: 'client' | 'expert' | 'academy'
  title: string
  duration: string
  task: string
  observe: string[]
  path: string
}

const scenarios: Scenario[] = [
  {
    id: 'client',
    title: 'Find expert help',
    duration: '5–7 min',
    task: 'You need a vetted nanny for two children in Clapham, starting in three weeks. Find suitable help and complete the consultation.',
    observe: ['Role selection', 'Request clarity', '£25 pricing comprehension', 'Trust in the match', 'Usefulness of the outcome'],
    path: '/client',
  },
  {
    id: 'expert',
    title: 'Join as an expert',
    duration: '6–8 min',
    task: 'You are an experienced nanny with current DBS and first-aid evidence. Apply, then preview how an approved Expert handles a request.',
    observe: ['Verification burden', 'Profile setup', 'Scope confidence', 'Payout clarity', 'Request acceptance'],
    path: '/expert',
  },
  {
    id: 'academy',
    title: 'Build expertise',
    duration: '5–6 min',
    task: 'You want to provide career-application support but lack formal credentials. Explore the pathway and complete the sample assessment.',
    observe: ['Academy Expert credibility', 'Scope boundaries', 'Assessment quality', 'Candidate status', 'Interest in continuing'],
    path: '/academy',
  },
]

export default function TestingHub() {
  const navigate = useNavigate()
  const [responses, setResponses] = useState(getFeedbackResponses)

  function startScenario(scenario: Scenario) {
    resetJourneyState()
    localStorage.setItem('specialist.role', scenario.id === 'client' ? 'client' : 'expert')
    if (scenario.id === 'client' || scenario.id === 'expert') {
      localStorage.setItem('specialist.client.category', 'nanny')
    }
    navigate(scenario.path)
  }

  return (
    <AppShell
      statusLabel="Testing guide"
      onBack={() => navigate('/')}
      onHome={() => navigate('/')}
    >
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8">
        <div className="pt-2 pb-7">
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold mb-2 text-[var(--color-accent-text)]">
            Validation build
          </p>
          <h1 className="font-display text-[34px] leading-tight mb-3 text-[var(--color-slate-100)]">
            Usability testing guide
          </h1>
          <p className="text-[12px] leading-relaxed text-[var(--color-slate-400)]">
            Ask the participant to think aloud. Avoid explaining the interface unless they are completely blocked.
          </p>
        </div>

        <div className="rounded-2xl p-4 mb-5 bg-[var(--color-accent-soft)]">
          <p className="text-[11px] font-semibold mb-1 text-[var(--color-accent-text)]">Before each scenario</p>
          <p className="text-[10px] leading-relaxed text-[var(--color-slate-400)]">
            Starting a scenario resets product progress but keeps previously captured feedback responses.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {scenarios.map((scenario, index) => (
            <section key={scenario.id} className="rounded-3xl p-5 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-slate-600)]">Scenario {index + 1}</p>
                  <h2 className="text-[15px] font-semibold text-[var(--color-slate-100)]">{scenario.title}</h2>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[9px] font-semibold bg-[var(--color-slate-800)] text-[var(--color-slate-400)]">{scenario.duration}</span>
              </div>
              <p className="text-[11px] leading-relaxed mb-4 text-[var(--color-slate-200)]">{scenario.task}</p>
              <details className="mb-4">
                <summary className="cursor-pointer text-[10px] font-semibold text-[var(--color-accent-text)]">What to observe</summary>
                <ul className="mt-2 space-y-1">
                  {scenario.observe.map((item) => (
                    <li key={item} className="text-[10px] text-[var(--color-slate-400)]">• {item}</li>
                  ))}
                </ul>
              </details>
              <button
                type="button"
                onClick={() => startScenario(scenario)}
                className="w-full min-h-11 rounded-2xl bg-[var(--color-accent)] text-white text-[12px] font-semibold"
              >
                Start scenario
              </button>
            </section>
          ))}
        </div>

        <section className="rounded-3xl p-5 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-slate-600)]">Session evidence</p>
              <h2 className="text-[15px] font-semibold text-[var(--color-slate-100)]">Captured feedback</h2>
            </div>
            <span className="font-display text-[28px] text-[var(--color-accent-text)]">{responses.length}</span>
          </div>
          {responses.length > 0 ? (
            <div className="space-y-2 mb-4">
              {responses.map((response) => (
                <div key={response.questionId} className="rounded-xl p-3 bg-[var(--color-slate-800)]">
                  <p className="text-[10px] font-semibold text-[var(--color-slate-200)]">{response.answer}</p>
                  <p className="text-[9px] mt-1 text-[var(--color-slate-600)]">{response.questionId}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] leading-relaxed mb-4 text-[var(--color-slate-400)]">
              Feedback selected during Client, Expert and Academy milestones will appear here.
            </p>
          )}
          <button
            type="button"
            onClick={downloadFeedbackResponses}
            disabled={responses.length === 0}
            className="w-full min-h-11 rounded-2xl bg-[var(--color-accent)] text-white text-[11px] font-semibold disabled:opacity-40"
          >
            Download feedback JSON
          </button>
          <button
            type="button"
            onClick={() => {
              clearFeedbackResponses()
              setResponses([])
            }}
            disabled={responses.length === 0}
            className="w-full min-h-10 mt-2 text-[10px] font-semibold text-[var(--color-slate-600)] disabled:opacity-40"
          >
            Clear captured feedback
          </button>
        </section>
      </main>
    </AppShell>
  )
}

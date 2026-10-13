import { useState } from 'react'
import { useLocation } from 'react-router'
import { getFeedbackResponses, saveFeedbackResponse } from '../../lib/feedback'

type FeedbackPromptProps = {
  questionId: string
  question: string
  options: string[]
}

export default function FeedbackPrompt({
  questionId,
  question,
  options,
}: FeedbackPromptProps) {
  const location = useLocation()
  const [answer, setAnswer] = useState(
    () => getFeedbackResponses().find((item) => item.questionId === questionId)?.answer || ''
  )

  function respond(nextAnswer: string) {
    setAnswer(nextAnswer)
    saveFeedbackResponse({
      questionId,
      answer: nextAnswer,
      pathname: location.pathname,
    })
  }

  return (
    <section className="rounded-2xl p-4 mb-5 border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]">
      <p className="text-[10px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-accent-text)]">
        Prototype feedback
      </p>
      <p className="text-[12px] font-semibold mb-3 text-[var(--color-slate-200)]">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => respond(option)}
            aria-pressed={answer === option}
            className="min-h-9 rounded-xl px-3 text-[10px] font-semibold border transition-colors"
            style={{
              color: answer === option ? 'white' : 'var(--color-slate-400)',
              background: answer === option ? 'var(--color-accent)' : 'var(--color-slate-800)',
              borderColor: answer === option ? 'var(--color-accent)' : 'var(--color-slate-700)',
            }}
          >
            {option}
          </button>
        ))}
      </div>
      {answer && (
        <p className="text-[10px] mt-3 text-[var(--color-slate-600)]">
          Saved for this testing session.
        </p>
      )}
    </section>
  )
}

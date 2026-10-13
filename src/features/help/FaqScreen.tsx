import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import { faqCategories, faqItems, type FaqCategory } from '../../data/faq'

type CategoryFilter = 'All' | FaqCategory

export default function FaqScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('All')

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return faqItems.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesQuery = !normalizedQuery
        || item.question.toLowerCase().includes(normalizedQuery)
        || item.answer.toLowerCase().includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  return (
    <AppShell
      statusLabel="Help centre"
      onBack={() => navigate(-1)}
      onHome={() => navigate('/')}
    >
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8">
        <div className="pt-2 pb-6">
          <p className="text-[11px] uppercase tracking-[0.14em] font-semibold mb-2 text-[var(--color-accent-text)]">
            Clear answers
          </p>
          <h1 className="font-display text-[34px] leading-tight mb-3 text-[var(--color-slate-100)]">
            Frequently asked questions
          </h1>
          <p className="text-[12px] leading-relaxed text-[var(--color-slate-400)]">
            How verification, pricing, Expert applications, Academy integrity and safety are intended to work.
          </p>
        </div>

        <div className="relative mb-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="var(--color-slate-400)" strokeWidth="1.4"/>
            <path d="M10.5 10.5L14 14" stroke="var(--color-slate-400)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions"
            aria-label="Search frequently asked questions"
            className="w-full h-12 rounded-2xl pl-11 pr-4 outline-none text-[13px] bg-[var(--color-slate-900)] text-[var(--color-slate-100)] border border-[var(--color-slate-700)] focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" aria-label="FAQ categories">
          {(['All', ...faqCategories] as CategoryFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className="min-h-9 px-3 rounded-full flex-shrink-0 text-[10px] font-semibold border transition-colors"
              style={{
                color: category === item ? 'white' : 'var(--color-slate-400)',
                background: category === item ? 'var(--color-accent)' : 'var(--color-slate-900)',
                borderColor: category === item ? 'var(--color-accent)' : 'var(--color-slate-700)',
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="text-[10px] mb-3 text-[var(--color-slate-600)]">
          {filteredItems.length} {filteredItems.length === 1 ? 'answer' : 'answers'}
        </p>

        {filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border bg-[var(--color-slate-900)] border-[var(--color-slate-700)]"
              >
                <summary className="min-h-14 cursor-pointer list-none flex items-center justify-between gap-4 px-4 py-3">
                  <span>
                    <span className="block text-[9px] uppercase tracking-wide font-semibold mb-1 text-[var(--color-accent-text)]">
                      {item.category}
                    </span>
                    <span className="block text-[12px] font-semibold leading-relaxed text-[var(--color-slate-200)]">
                      {item.question}
                    </span>
                  </span>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--color-slate-800)] text-[var(--color-slate-400)] group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  <div className="h-px mb-3 bg-[var(--color-slate-700)]"/>
                  <p className="text-[11px] leading-[1.7] text-[var(--color-slate-400)]">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-6 text-center bg-[var(--color-slate-900)]">
            <p className="text-[12px] font-semibold text-[var(--color-slate-200)]">No matching answer</p>
            <p className="text-[10px] mt-1 text-[var(--color-slate-600)]">Try a broader search or another category.</p>
          </div>
        )}

        <div className="rounded-2xl p-4 mt-5 bg-[var(--color-accent-soft)]">
          <p className="text-[11px] font-semibold mb-1 text-[var(--color-accent-text)]">Validation-stage policies</p>
          <p className="text-[10px] leading-relaxed text-[var(--color-slate-400)]">
            These answers describe the intended MVP operating model. Legal, tax, safeguarding, payment and data-retention policies require specialist review before a live pilot.
          </p>
        </div>
      </main>
    </AppShell>
  )
}

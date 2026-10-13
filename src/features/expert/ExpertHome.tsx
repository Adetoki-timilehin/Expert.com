import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'

export default function ExpertHome() {
  const navigate = useNavigate()

  return (
    <AppShell
      statusLabel="Expert mode"
      onBack={() => navigate('/')}
      onHome={() => navigate('/')}
    >
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8">
          <div className="flex items-center justify-between pt-3 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1.5L9.5 6H12L8.5 9l1 3.5L7 10.5 3.5 12.5l1-3.5L1 6h2.5z" fill="white"/>
                </svg>
              </div>
              <span className="font-logo text-[var(--color-slate-100)] font-semibold text-[16px] tracking-tight">
                Specia<span className="text-[var(--color-accent-text)]">L</span>ist
              </span>
            </div>
          </div>

          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3 text-[var(--color-slate-400)]">
            Expert workspace
          </p>
          <h1 className="font-display text-[36px] leading-tight text-[var(--color-slate-100)] mb-3">
            Build your expert profile
          </h1>
          <p className="text-[13px] leading-relaxed mb-8 text-[var(--color-slate-400)]">
            This is the starting point for qualified professionals and people exploring a structured expertise pathway.
          </p>

          <button
            type="button"
            onClick={() => navigate('/expert/apply')}
            className="w-full rounded-3xl p-5 border mb-4 text-left bg-[var(--color-slate-900)] border-[var(--color-slate-700)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-[var(--color-accent-soft)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 3a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM4 17c0-3 2.7-5 6-5s6 2 6 5" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold mb-2 text-[var(--color-slate-100)]">
              Already have professional expertise?
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--color-slate-400)]">
              Select your category, provide evidence and create your client-facing profile.
            </p>
            <span className="flex items-center gap-1 mt-4 text-[11px] font-semibold text-[var(--color-accent-text)]">
              Start application
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/academy')}
            className="w-full rounded-3xl p-5 border text-left bg-[var(--color-slate-900)] border-[var(--color-slate-700)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-[var(--color-slate-800)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 5.5L10 3l6 2.5L10 8 4 5.5zM6 7v4.5c2.5 1.7 5.5 1.7 8 0V7" stroke="var(--color-slate-200)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold mb-2 text-[var(--color-slate-100)]">
              Want to build your expertise?
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--color-slate-400)]">
              Eligible low-risk specialties will offer assessed learning and supervised experience through SpeciaList Academy.
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-[11px] font-semibold text-[var(--color-accent-text)]">
              Explore Academy
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/expert/dashboard')}
            className="w-full min-h-12 mt-4 rounded-2xl border border-[var(--color-slate-700)] text-[12px] font-semibold text-[var(--color-slate-200)]"
          >
            Preview approved Expert workspace
          </button>
      </main>
    </AppShell>
  )
}

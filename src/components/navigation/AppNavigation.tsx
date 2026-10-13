import { useNavigate } from 'react-router'

type AppNavigationProps = {
  onBack: () => void
  onHome: () => void
}

export default function AppNavigation({ onBack, onHome }: AppNavigationProps) {
  const navigate = useNavigate()

  return (
    <nav
      aria-label="App navigation"
      className="flex items-center justify-between px-5 py-1 flex-shrink-0"
    >
      <button
        type="button"
        onClick={onBack}
        className="min-h-10 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)] hover:bg-[var(--color-slate-900)] transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <button
        type="button"
        onClick={onHome}
        className="min-h-10 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)] hover:bg-[var(--color-slate-900)] transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2.5 7.2L8 2.8l5.5 4.4V14h-4v-4h-3v4h-4V7.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        Home
      </button>

      <button
        type="button"
        onClick={() => navigate('/faq')}
        className="min-h-10 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)] hover:bg-[var(--color-slate-900)] transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M6.4 6.2a1.7 1.7 0 113 1.1c-.8.7-1.4 1-1.4 2M8 12h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        Help
      </button>
    </nav>
  )
}

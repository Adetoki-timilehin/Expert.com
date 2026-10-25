import { useNavigate } from 'react-router'

type AppNavigationProps = {
  onBack?: () => void
  onHome: () => void
}

export default function AppNavigation({ onBack, onHome }: AppNavigationProps) {
  const navigate = useNavigate()

  return (
    <nav
      aria-label="App navigation"
      className="flex items-center justify-between px-5 py-1 flex-shrink-0"
    >
      {onBack ? (
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
      ) : (
        <span className="w-16"/>
      )}

      <button
        type="button"
        onClick={onHome}
        aria-label="Go to home"
        className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition-opacity hover:opacity-70"
      >
        <div className="w-6 h-6 rounded-lg bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="1 3 13 11" fill="none" aria-hidden="true">
            <path d="M2 9C2 6.5 4.5 5 7.5 5s5.5 1.5 5.5 4-2.5 3.5-5.5 3.5S2 11.5 2 9z" stroke="#f5f2ee" strokeWidth="1.4"/>
            <circle cx="5" cy="9" r="1.2" fill="#f5f2ee"/>
            <circle cx="7.5" cy="8.5" r="1.2" fill="#f5f2ee"/>
            <circle cx="10" cy="9" r="1.2" fill="#f5f2ee"/>
          </svg>
        </div>
        <span className="font-logo font-semibold text-[16px] tracking-tight uppercase" style={{ color: 'var(--color-logo-wordmark)' }}>
          Peasy
        </span>
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

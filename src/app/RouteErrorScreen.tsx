import { useNavigate, useRouteError } from 'react-router'
import AppShell from '../components/layout/AppShell'

export default function RouteErrorScreen() {
  const navigate = useNavigate()
  const error = useRouteError()

  console.error('SpeciaList route error', error)

  return (
    <AppShell statusLabel="Recovery">
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-8 pb-8">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 bg-[var(--color-slate-800)]">
          <span className="text-[24px] text-[var(--color-slate-400)]">!</span>
        </div>
        <p className="text-[11px] uppercase tracking-wide font-semibold mb-2 text-[var(--color-slate-400)]">
          Something went wrong
        </p>
        <h1 className="font-display text-[32px] leading-tight mb-3 text-[var(--color-slate-100)]">
          This screen could not be loaded
        </h1>
        <p className="text-[12px] leading-relaxed mb-7 text-[var(--color-slate-400)]">
          Your saved demo progress is still available. Reload this screen or return to role selection.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full min-h-13 rounded-2xl bg-[var(--color-accent)] text-white text-[14px] font-semibold"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full min-h-11 mt-3 rounded-2xl text-[12px] font-semibold text-[var(--color-slate-400)]"
        >
          Return home
        </button>
      </main>
    </AppShell>
  )
}

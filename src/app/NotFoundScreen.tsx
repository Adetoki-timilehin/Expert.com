import { useNavigate } from 'react-router'
import AppShell from '../components/layout/AppShell'

export default function NotFoundScreen() {
  const navigate = useNavigate()

  return (
    <AppShell statusLabel="Page not found">
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-8 pb-8">
        <p className="font-display text-[64px] leading-none mb-4 text-[var(--color-slate-600)]">404</p>
        <h1 className="font-display text-[30px] leading-tight mb-3 text-[var(--color-slate-100)]">
          We couldn’t find that screen
        </h1>
        <p className="text-[12px] leading-relaxed mb-7 text-[var(--color-slate-400)]">
          Return to role selection and continue from your saved Client, Expert or Academy progress.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full min-h-13 rounded-2xl bg-[var(--color-accent)] text-white text-[14px] font-semibold"
        >
          Return home
        </button>
      </main>
    </AppShell>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import { resetDemoState } from '../../lib/demoState'

type AppRole = 'client' | 'expert'

const roles: {
  value: AppRole
  title: string
  description: string
  detail: string
}[] = [
  {
    value: 'client',
    title: 'I need expert help',
    description: 'Find a trusted specialist for a focused consultation.',
    detail: 'Describe what you need, review the price and get matched.',
  },
  {
    value: 'expert',
    title: 'I provide expert help',
    description: 'Manage requests, consultations and your expert profile.',
    detail: 'For qualified experts and people exploring an expert pathway.',
  },
]

export default function RoleSelectionScreen() {
  const navigate = useNavigate()
  const [role, setRole] = useState<AppRole>(() =>
    localStorage.getItem('specialist.role') === 'expert' ? 'expert' : 'client'
  )

  function continueWithRole() {
    localStorage.setItem('specialist.role', role)
    navigate(role === 'client' ? '/client' : '/expert')
  }

  return (
    <AppShell statusLabel="UK expert marketplace">
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 flex flex-col">
          <div className="flex items-center gap-2 pt-4 mb-12">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
              <svg width="26" height="26" viewBox="1 3 13 11" fill="none" aria-hidden="true">
                <path d="M2 9C2 6.5 4.5 5 7.5 5s5.5 1.5 5.5 4-2.5 3.5-5.5 3.5S2 11.5 2 9z" stroke="#f5f2ee" strokeWidth="1.4"/><circle cx="5" cy="9" r="1.2" fill="#f5f2ee"/><circle cx="7.5" cy="8.5" r="1.2" fill="#f5f2ee"/><circle cx="10" cy="9" r="1.2" fill="#f5f2ee"/>
              </svg>
            </div>
            <span className="font-logo font-semibold text-[22px] tracking-tight uppercase" style={{ color: 'var(--color-logo-wordmark)' }}>
              Peasy
            </span>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-4 text-[var(--color-slate-400)]">
              Welcome to Peasy
            </p>
            <h1 className="font-display text-[38px] leading-[1.08] text-[var(--color-slate-100)] mb-4">
              How will you use the app today?
            </h1>
            <p className="text-[14px] leading-relaxed text-[var(--color-slate-400)]">
              Choose a role to enter the right workspace. You can switch roles later.
            </p>
          </div>

          <div className="space-y-3 mb-7" role="radiogroup" aria-label="Choose how to use Peasy">
            {roles.map((option) => {
              const selected = role === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRole(option.value)}
                  className="w-full min-h-32 rounded-3xl p-5 border text-left transition-all duration-200"
                  style={{
                    background: selected ? 'var(--color-accent-soft)' : 'var(--color-slate-900)',
                    borderColor: selected ? 'var(--color-accent)' : 'var(--color-slate-700)',
                    boxShadow: selected ? '0 8px 24px rgba(26, 127, 90, 0.1)' : 'none',
                  }}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-[15px] font-semibold mb-1.5 text-[var(--color-slate-100)]">
                        {option.title}
                      </span>
                      <span className="block text-[12px] leading-relaxed mb-2 text-[var(--color-slate-400)]">
                        {option.description}
                      </span>
                      <span className="block text-[10px] leading-relaxed text-[var(--color-slate-600)]">
                        {option.detail}
                      </span>
                    </span>
                    <span
                      className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                      style={{ borderColor: selected ? 'var(--color-accent)' : 'var(--color-slate-700)' }}
                    >
                      {selected && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"/>}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={continueWithRole}
            className="w-full min-h-13 mt-auto rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[15px] font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Continue as {role === 'client' ? 'Client' : 'Expert'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <p className="text-center text-[10px] leading-relaxed mt-4 text-[var(--color-slate-600)]">
            No account or password is required for this validation build.
          </p>
          <button
            type="button"
            onClick={() => navigate('/testing')}
            className="min-h-10 text-[10px] font-semibold text-[var(--color-accent-text)]"
          >
            Open usability testing guide
          </button>
          <button
            type="button"
            onClick={() => navigate('/faq')}
            className="min-h-10 text-[10px] font-semibold text-[var(--color-slate-400)]"
          >
            Read frequently asked questions
          </button>
          <button
            type="button"
            onClick={() => {
              resetDemoState()
              window.location.reload()
            }}
            className="min-h-10 text-[10px] font-semibold text-[var(--color-slate-600)]"
          >
            Reset all demo progress
          </button>
        </main>
    </AppShell>
  )
}

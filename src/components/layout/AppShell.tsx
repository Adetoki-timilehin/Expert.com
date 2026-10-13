import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import AppNavigation from '../navigation/AppNavigation'

type Theme = 'light' | 'dark'

type AppShellProps = {
  children: ReactNode
  statusLabel?: string
  onBack?: () => void
  onHome?: () => void
}

function getInitialTheme(): Theme {
  return localStorage.getItem('specialist.theme') === 'dark' ? 'dark' : 'light'
}

export default function AppShell({
  children,
  statusLabel,
  onBack,
  onHome,
}: AppShellProps) {
  const location = useLocation()
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsDismissed, setNotificationsDismissed] = useState(
    () => localStorage.getItem('specialist.notifications.dismissed') === 'true'
  )

  useEffect(() => {
    const updateOnlineStatus = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  function toggleTheme() {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      localStorage.setItem('specialist.theme', next)
      return next
    })
  }

  const notifications = getNotifications(location.pathname)

  return (
    <div
      data-theme={theme}
      className="theme-shell h-dvh overflow-hidden bg-[var(--color-ground-deep)] flex items-center justify-center p-0 sm:p-4 transition-colors duration-300"
    >
      <div
        className="w-full h-full max-w-none max-h-none relative overflow-hidden rounded-none flex flex-col transition-colors duration-300 sm:max-w-[390px] sm:max-h-[844px] sm:rounded-[44px]"
        style={{ background: 'var(--color-ground-base)', boxShadow: 'var(--app-shadow)' }}
      >
        <div className="flex items-center justify-between px-8 pt-4 pb-2 flex-shrink-0">
          <span className="text-[var(--color-slate-100)] text-[13px] font-semibold tracking-tight">9:41</span>
          <div className="flex items-center gap-2">
            {statusLabel && (
              <span className="max-w-20 truncate text-[var(--color-slate-400)] text-[10px] font-medium">
                {statusLabel}
              </span>
            )}
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
              className="relative w-7 h-7 rounded-full border border-[var(--color-slate-700)] bg-[var(--color-slate-900)] flex items-center justify-center"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3.5 11.5h9l-1.2-1.8V6.5A3.3 3.3 0 008 3.2a3.3 3.3 0 00-3.3 3.3v3.2l-1.2 1.8zM6.5 13a1.7 1.7 0 003 0" stroke="var(--color-slate-200)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {!notificationsDismissed && notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[var(--color-slate-900)] bg-[var(--color-accent)]"/>
              )}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="w-7 h-7 rounded-full border border-[var(--color-slate-700)] bg-[var(--color-slate-900)] flex items-center justify-center transition-colors duration-200"
            >
              {theme === 'light' ? (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 2.2V1M8 15v-1.2M13.8 8H15M1 8h1.2M12.1 3.9l.9-.9M3 13l.9-.9M12.1 12.1l.9.9M3 3l.9.9" stroke="var(--color-slate-400)" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="8" cy="8" r="3" stroke="var(--color-slate-200)" strokeWidth="1.4"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M13.5 10.4A5.8 5.8 0 015.6 2.5a5.8 5.8 0 107.9 7.9z" stroke="var(--color-slate-200)" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="var(--color-slate-200)" aria-hidden="true">
              <rect x="0" y="3" width="3" height="9" rx="1"/>
              <rect x="4.5" y="2" width="3" height="10" rx="1"/>
              <rect x="9" y="0.5" width="3" height="11.5" rx="1"/>
              <rect x="13.5" y="0" width="3" height="12" rx="1" opacity="0.35"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="var(--color-slate-200)" aria-hidden="true">
              <path d="M8 2.4C5.4 2.4 3.1 3.5 1.5 5.3L0 3.8C2 1.5 4.8 0 8 0s6 1.5 8 3.8l-1.5 1.5C12.9 3.5 10.6 2.4 8 2.4z"/>
              <path d="M8 5.6c-1.6 0-3 .7-4 1.7L2.5 5.8C3.9 4.4 5.8 3.6 8 3.6s4.1.8 5.5 2.2L12 7.3c-1-1-2.4-1.7-4-1.7z"/>
              <circle cx="8" cy="10" r="2"/>
            </svg>
            <div className="w-[22px] h-[11px] rounded-[3px] border border-[var(--color-slate-200)]/60 p-[1.5px] flex items-center" aria-hidden="true">
              <div className="w-[14px] h-full bg-[var(--color-slate-200)] rounded-[1.5px]"/>
            </div>
          </div>
        </div>

        {!online && (
          <div className="flex-shrink-0 px-5 py-2 text-center bg-[var(--color-slate-800)]" role="status">
            <p className="text-[10px] font-semibold text-[var(--color-slate-200)]">
              You’re offline. Drafts remain available and live updates will resume when you reconnect.
            </p>
          </div>
        )}

        {notificationsOpen && (
          <NotificationPanel
            notifications={notificationsDismissed ? [] : notifications}
            onClose={() => setNotificationsOpen(false)}
            onClear={() => {
              localStorage.setItem('specialist.notifications.dismissed', 'true')
              setNotificationsDismissed(true)
            }}
          />
        )}

        {onBack && onHome && <AppNavigation onBack={onBack} onHome={onHome} />}
        {children}
      </div>
    </div>
  )
}

type NotificationItem = {
  title: string
  detail: string
  time: string
}

function getNotifications(pathname: string): NotificationItem[] {
  if (pathname.startsWith('/academy')) {
    return [
      { title: 'Sample module ready', detail: 'Continue your Career Application Specialist pathway.', time: 'Now' },
    ]
  }
  if (pathname.startsWith('/expert')) {
    return [
      { title: 'New consultation request', detail: 'A matching Client request is ready for review.', time: '2m' },
      { title: 'Verification current', detail: 'No credential action is required today.', time: '1d' },
    ]
  }
  if (pathname.startsWith('/client')) {
    return [
      { title: 'Follow-up included', detail: 'Your consultation includes one follow-up within 24 hours.', time: 'Now' },
      { title: 'Secure request draft saved', detail: 'You can safely continue where you left off.', time: '5m' },
    ]
  }
  return [
    { title: 'Welcome to SpeciaList', detail: 'Choose Client or Expert to begin the validation experience.', time: 'Now' },
  ]
}

function NotificationPanel({
  notifications,
  onClose,
  onClear,
}: {
  notifications: NotificationItem[]
  onClose: () => void
  onClear: () => void
}) {
  return (
    <section
      aria-label="Notifications"
      className="absolute z-50 top-14 left-4 right-4 max-h-[70%] overflow-y-auto rounded-3xl border p-4 bg-[var(--color-ground-base)] border-[var(--color-slate-700)]"
      style={{ boxShadow: 'var(--app-shadow)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-slate-400)]">Updates</p>
          <h2 className="text-[16px] font-semibold text-[var(--color-slate-100)]">Notifications</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close notifications" className="w-10 h-10 rounded-full bg-[var(--color-slate-800)] text-[var(--color-slate-400)]">
          ×
        </button>
      </div>

      {notifications.length > 0 ? (
        <>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div key={notification.title} className="rounded-2xl p-4 bg-[var(--color-slate-900)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--color-slate-100)]">{notification.title}</p>
                    <p className="text-[10px] leading-relaxed mt-1 text-[var(--color-slate-400)]">{notification.detail}</p>
                  </div>
                  <span className="text-[9px] flex-shrink-0 text-[var(--color-slate-600)]">{notification.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={onClear} className="w-full min-h-10 mt-3 text-[11px] font-semibold text-[var(--color-accent-text)]">
            Mark all as read
          </button>
        </>
      ) : (
        <div className="rounded-2xl p-6 text-center bg-[var(--color-slate-900)]">
          <p className="text-[12px] font-semibold text-[var(--color-slate-200)]">You’re all caught up</p>
          <p className="text-[10px] mt-1 text-[var(--color-slate-600)]">New updates will appear here.</p>
        </div>
      )}
    </section>
  )
}

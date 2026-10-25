export default function RouteHydrateFallback() {
  return (
    <div
      data-theme="light"
      className="theme-shell h-dvh overflow-hidden bg-[var(--color-ground-deep)] flex items-center justify-center p-0 sm:p-4"
    >
      <div
        className="w-full h-full max-w-none max-h-none overflow-hidden rounded-none flex items-center justify-center sm:max-w-[390px] sm:max-h-[844px] sm:rounded-[44px]"
        style={{ background: 'var(--color-ground-base)', boxShadow: 'var(--app-shadow)' }}
      >
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="26" height="26" viewBox="1 3 13 11" fill="none" aria-hidden="true">
              <path d="M2 9C2 6.5 4.5 5 7.5 5s5.5 1.5 5.5 4-2.5 3.5-5.5 3.5S2 11.5 2 9z" stroke="#f5f2ee" strokeWidth="1.4"/>
              <circle className="pea-1" cx="5" cy="9" r="1.2" fill="#f5f2ee"/>
              <circle className="pea-2" cx="7.5" cy="8.5" r="1.2" fill="#f5f2ee"/>
              <circle className="pea-3" cx="10" cy="9" r="1.2" fill="#f5f2ee"/>
            </svg>
          </div>
          <span className="font-logo font-semibold text-[22px] tracking-tight uppercase" style={{ color: 'var(--color-logo-wordmark)' }}>
            Peasy
          </span>
        </div>
      </div>
    </div>
  )
}

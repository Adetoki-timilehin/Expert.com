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
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.5L9.5 6H12L8.5 9l1 3.5L7 10.5 3.5 12.5l1-3.5L1 6h2.5z" fill="white"/>
            </svg>
          </div>
          <span className="text-[12px] font-medium text-[var(--color-slate-400)]">
            Loading SpeciaList…
          </span>
        </div>
      </div>
    </div>
  )
}

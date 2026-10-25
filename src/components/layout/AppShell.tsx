import { type ReactNode } from 'react'
import AppNavigation from '../navigation/AppNavigation'

type AppShellProps = {
  children: ReactNode
  statusLabel?: string
  onBack?: () => void
  onHome?: () => void
}

export default function AppShell({
  children,
  onBack,
  onHome,
}: AppShellProps) {
  return (
    <div
      data-theme="light"
      className="theme-shell h-dvh overflow-hidden bg-[var(--color-ground-deep)] flex items-center justify-center p-0 sm:p-4"
    >
      <div
        className="w-full h-full max-w-none max-h-none relative overflow-hidden rounded-none flex flex-col sm:max-w-[390px] sm:max-h-[844px] sm:rounded-[44px]"
        style={{ background: 'var(--color-ground-base)', boxShadow: 'var(--app-shadow)', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {onHome && <AppNavigation onBack={onBack} onHome={onHome} />}
        {children}
      </div>
    </div>
  )
}

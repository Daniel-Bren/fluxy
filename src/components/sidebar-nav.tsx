'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, ClipboardCheck, History } from 'lucide-react'
import { Suspense } from 'react'
import { Users } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Controle', href: '/dashboard/controle', icon: ClipboardCheck },
  { label: 'Transações', href: '/dashboard/transacoes', icon: ArrowLeftRight },
  { label: 'Histórico', href: '/dashboard/historico', icon: History },
  { label: 'Grupo', href: '/dashboard/grupo', icon: Users },
]

type SidebarNavProps = {
  variant?: 'sidebar' | 'mobile'
}

function SidebarNavInner({ variant = 'sidebar' }: SidebarNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mes = searchParams.get('mes')
  const modo = searchParams.get('modo')

  return (
    <nav
      aria-label={variant === 'mobile' ? 'Navegação principal móvel' : 'Navegação principal'}
      className={variant === 'mobile'
        ? 'grid h-16 grid-cols-5 px-1'
        : 'flex-1 space-y-1 px-3 py-4'}
    >
      {navItems.map((item) => {
        const params = new URLSearchParams()
        if (mes) params.set('mes', mes)
        if (modo) params.set('modo', modo)
        const href = params.toString() ? `${item.href}?${params.toString()}` : item.href ?? '/'
        const ativo = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={href}
            className={variant === 'mobile'
              ? `flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors ${
                  ativo ? 'text-blue-300' : 'text-white/60 hover:text-white'
                }`
              : `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
          >
            <Icon size={variant === 'mobile' ? 20 : 18} />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function SidebarNav({ variant = 'sidebar' }: SidebarNavProps) {
  return (
    <Suspense fallback={
      <nav className={variant === 'mobile' ? 'grid h-16 grid-cols-5 px-1' : 'flex-1 space-y-1 px-3 py-4'}>
        {navItems.map((item) => (
          <div key={item.href} className={variant === 'mobile' ? 'm-2 rounded-lg bg-white/5 animate-pulse' : 'h-10 rounded-lg bg-white/5 animate-pulse'} />
        ))}
      </nav>
    }>
      <SidebarNavInner variant={variant} />
    </Suspense>
  )
}

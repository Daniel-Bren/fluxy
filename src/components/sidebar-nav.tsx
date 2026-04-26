'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, History } from 'lucide-react'
import { Suspense } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transações', href: '/dashboard/transacoes', icon: ArrowLeftRight },
  { label: 'Histórico', href: '/dashboard/historico', icon: History },
]

function SidebarNavInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mes = searchParams.get('mes')

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const href = mes ? `${item.href}?mes=${mes}` : item.href
        const ativo = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              ativo
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function SidebarNav({ email }: { email: string }) {
  return (
    <Suspense fallback={
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.href} className="h-10 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </nav>
    }>
      <SidebarNavInner />
    </Suspense>
  )
}
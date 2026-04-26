import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  LogOut,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transações', href: '/dashboard/transacoes', icon: ArrowLeftRight },
  { label: 'Categorias', href: '/dashboard/categorias', icon: Tag },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const primeiroNome = user.user_metadata?.nome?.split(' ')[0] ?? user.email

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] flex flex-col fixed h-full">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <span className="text-white text-xl font-bold tracking-tight">
            💸 Fluxy
          </span>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Usuário + Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 text-white/50 text-xs mb-2">
            {user.email}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium w-full"
            >
              <LogOut size={18} />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 ml-64 bg-[#F9FAFB] min-h-screen">
        {children}
      </main>
    </div>
  )
}
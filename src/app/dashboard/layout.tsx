import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import { LogOut } from 'lucide-react'
import SidebarNav from '@/components/sidebar-nav'
import Image from 'next/image'

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

  return (
    <div className="min-h-dvh bg-[#F9FAFB]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#0F172A] lg:flex">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Image
              src="/android-chrome-192x192.png"
              alt="Fluxy"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg"
            />
            <span className="text-white text-xl font-bold tracking-tight">Fluxy</span>
          </div>
        </div>

        {/* Navegação */}
        <SidebarNav />

        {/* Usuário + Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-white/90 text-sm font-medium">
              {user!.user_metadata?.nome ?? user!.email}
            </p>
            <p className="text-white/40 text-xs">{user!.email}</p>
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

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#0F172A] px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Image
            src="/android-chrome-192x192.png"
            alt="Fluxy"
            width={28}
            height={28}
            className="h-7 w-7 rounded-lg"
          />
          <span className="text-lg font-bold text-white">Fluxy</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sair"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} />
          </button>
        </form>
      </header>

      <main className="min-h-dvh min-w-0 bg-[#F9FAFB] pb-[calc(5rem+env(safe-area-inset-bottom))] lg:ml-64 lg:pb-0">
        {children}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0F172A] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <SidebarNav variant="mobile" />
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import { LogOut } from 'lucide-react'
import SidebarNav from '@/components/sidebar-nav'

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
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#0F172A] flex flex-col fixed h-full">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src="/android-chrome-192x192.png"
              alt="Fluxy"
              className="w-7 h-7 rounded-lg"
            />
            <span className="text-white text-xl font-bold tracking-tight">Fluxy</span>
          </div>
        </div>

        {/* Navegação */}
        <SidebarNav email={user!.email ?? ''} />

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

      <main className="flex-1 ml-64 bg-[#F9FAFB] min-h-screen">
        {children}
      </main>
    </div>
  )
}
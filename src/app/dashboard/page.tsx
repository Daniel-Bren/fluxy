import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827]">
          Olá, {user.email}
        </h1>

        <form action={logout}>
          <Button variant="outline" type="submit">
            Sair
          </Button>
        </form>
      </div>

      <p className="text-[#6B7280] mt-1">
        Seu dashboard está sendo construído.
      </p>
    </main>
  )
}
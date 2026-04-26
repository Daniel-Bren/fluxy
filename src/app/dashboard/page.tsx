import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8">
      <h1 className="text-2xl font-bold text-[#111827]">
        Olá, {user.email}
      </h1>
      <p className="text-[#6B7280] mt-1">
        Seu dashboard está sendo construído.
      </p>
    </main>
  )
}
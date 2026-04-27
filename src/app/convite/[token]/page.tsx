import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ token: string }>
}

export default async function ConvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Busca o convite pelo token
  const { data: convite } = await supabase
    .from('convites')
    .select('id, grupo_id, usado, grupos(nome)')
    .eq('token', token)
    .single()

  if (!convite) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm max-w-md w-full text-center">
          <p className="text-xl font-bold text-[#111827] mb-2">Link inválido</p>
          <p className="text-[#6B7280] text-sm">Este link de convite não existe ou expirou.</p>
        </div>
      </main>
    )
  }

  if (convite.usado) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm max-w-md w-full text-center">
          <p className="text-xl font-bold text-[#111827] mb-2">Convite já utilizado</p>
          <p className="text-[#6B7280] text-sm">Este link já foi usado. Peça um novo convite ao dono do grupo.</p>
        </div>
      </main>
    )
  }

  // Se não está logado, redireciona para cadastro com o token na URL
  if (!user) {
    redirect(`/cadastro?convite=${token}`)
  }
  console.log('user:', user?.id)
  console.log('convite:', convite)

  // Se está logado, processa o convite automaticamente
  const { data: membroExistente } = await supabase
    .from('membros_grupo')
    .select('id')
    .eq('grupo_id', convite.grupo_id)
    .eq('user_id', user.id)
    .single()

  if (!membroExistente) {
    await supabase.from('membros_grupo').insert({
      grupo_id: convite.grupo_id,
      user_id: user.id,
    })

    await supabase
      .from('convites')
      .update({ usado: true })
      .eq('id', convite.id)
  }

  redirect('/dashboard')
}
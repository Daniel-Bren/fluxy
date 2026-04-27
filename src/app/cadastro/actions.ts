'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function cadastrarUsuario(formData: {
  nome: string
  email: string
  senha: string
  convite?: string | null
}) {
  const supabase = await createClient()

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.senha,
    options: {
      data: { nome: formData.nome },
    },
  })

  if (error) return { erro: 'Não foi possível criar a conta. Tente novamente.' }

  const userId = signUpData?.user?.id

  if (formData.convite && userId) {
    const { data: convite } = await supabase
      .from('convites')
      .select('id, grupo_id, usado')
      .eq('token', formData.convite)
      .eq('usado', false)
      .single()

    if (convite) {
      await supabase.rpc('adicionar_membro_grupo', {
        p_grupo_id: convite.grupo_id,
        p_user_id: userId,
      })

      await supabase
        .from('convites')
        .update({ usado: true })
        .eq('id', convite.id)
    }
  }

  redirect('/dashboard')
}
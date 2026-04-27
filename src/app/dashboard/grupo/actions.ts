'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function criarGrupo(nome: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { data: grupoExistente } = await supabase
    .from('grupos')
    .select('id')
    .eq('dono_id', user.id)
    .single()

  if (grupoExistente) return { erro: 'Você já tem um grupo criado.' }

  const { data: grupo, error: erroGrupo } = await supabase
    .from('grupos')
    .insert({ nome, dono_id: user.id })
    .select('id')
    .single()

  if (erroGrupo) return { erro: erroGrupo.message }

  const { error: erroMembro } = await supabase
    .from('membros_grupo')
    .insert({
      grupo_id: grupo.id,
      user_id: user.id,
    })

  if (erroMembro) return { erro: erroMembro.message }

  revalidatePath('/dashboard/grupo')
  redirect('/dashboard/grupo')
}

export async function gerarConvite(grupoId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { data: convite, error } = await supabase
    .from('convites')
    .insert({ grupo_id: grupoId })
    .select('token')
    .single()

  if (error) return { erro: error.message }

  return { sucesso: true, token: convite.token }
}

export async function sairDoGrupo(grupoId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { error } = await supabase
    .from('membros_grupo')
    .delete()
    .eq('grupo_id', grupoId)
    .eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/grupo')
  return { sucesso: true }
}

export async function removerMembro(grupoId: string, userId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { data: grupo } = await supabase
    .from('grupos')
    .select('dono_id')
    .eq('id', grupoId)
    .single()

  if (grupo?.dono_id !== user.id) return { erro: 'Apenas o dono pode remover membros.' }

  const { error } = await supabase
    .from('membros_grupo')
    .delete()
    .eq('grupo_id', grupoId)
    .eq('user_id', userId)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/grupo')
  return { sucesso: true }
}
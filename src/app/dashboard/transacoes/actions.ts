'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function criarTransacao(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const tipo = formData.get('tipo') as string
  const valor = parseFloat(formData.get('valor') as string)
  const data = formData.get('data') as string
  const categoria_id = formData.get('categoria_id') as string
  const descricao = formData.get('descricao') as string
  const recorrente = formData.get('recorrente') === 'on'

  if (!tipo || !valor || !data || !categoria_id) {
    return { erro: 'Preencha todos os campos obrigatórios.' }
  }

  const { error } = await supabase.from('transacoes').insert({
    user_id: user.id,
    tipo,
    valor,
    data,
    categoria_id,
    descricao,
    recorrente,
  })

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/transacoes')
  revalidatePath('/dashboard')
  return { sucesso: true }
}

export async function deletarTransacao(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { error } = await supabase
    .from('transacoes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/transacoes')
  revalidatePath('/dashboard')
  return { sucesso: true }
}

export async function criarCategoria(nome: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  if (!nome.trim()) return { erro: 'Digite um nome para a categoria.' }

  const { data, error } = await supabase
  .from('categorias')
  .insert({ nome: nome.trim(), user_id: user.id })
  .select('id, nome, user_id')
  .single()

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/transacoes')
  return { sucesso: true as const, categoria: data as { id: string; nome: string; user_id: string } }
}

export async function deletarCategoria(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/transacoes')
  return { sucesso: true }
}
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function adicionarMes(data: string, deslocamento: number) {
  const [ano, mes, dia] = data.split('-').map(Number)
  const mesAlvo = new Date(Date.UTC(ano, mes - 1 + deslocamento, 1))
  const ultimoDia = new Date(
    Date.UTC(mesAlvo.getUTCFullYear(), mesAlvo.getUTCMonth() + 1, 0),
  ).getUTCDate()
  const diaAlvo = Math.min(dia, ultimoDia)

  return `${mesAlvo.getUTCFullYear()}-${String(mesAlvo.getUTCMonth() + 1).padStart(2, '0')}-${String(diaAlvo).padStart(2, '0')}`
}

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
  const mesesRecorrencia = recorrente ? parseInt(formData.get('meses_recorrencia') as string) || 12 : 1
  const grupo_id = formData.get('grupo_id') as string | null

  if (!tipo || !valor || !data || !categoria_id) {
  return { erro: 'Preencha todos os campos obrigatórios.' }
  }

  if (recorrente) {
    const recorrencia_id = crypto.randomUUID()
    const registros = []

    for (let i = 0; i < mesesRecorrencia; i++) {
      registros.push({
        user_id: user.id,
        tipo,
        valor,
        data: adicionarMes(data, i),
        categoria_id,
        descricao,
        recorrente: true,
        recorrencia_id,
        recorrencia_origem: i === 0,
        grupo_id: grupo_id || null,
      })
    }

    const { error } = await supabase.from('transacoes').insert(registros)
    if (error) return { erro: error.message }

  } else {
    const { error } = await supabase.from('transacoes').insert({
      user_id: user.id,
      tipo,
      valor,
      data,
      categoria_id,
      descricao,
      recorrente: false,
      grupo_id: grupo_id || null,
    })
    if (error) return { erro: error.message }
  }

  revalidatePath('/dashboard/transacoes')
  revalidatePath('/dashboard')
  return { sucesso: true }
}

export async function deletarTransacao(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { data: transacao, error: erroConsulta } = await supabase
    .from('transacoes')
    .select('conta_a_pagar_id')
    .eq('id', id)
    .single()

  if (erroConsulta) return { erro: erroConsulta.message }
  if (transacao.conta_a_pagar_id) {
    return { erro: 'Desfaça o pagamento na tela Controle antes de excluir esta transação.' }
  }

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

export async function cancelarRecorrencia(recorrenciaId: string, dataAtual: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado' }

  const { error } = await supabase
    .from('transacoes')
    .delete()
    .eq('recorrencia_id', recorrenciaId)
    .eq('user_id', user.id)
    .gte('data', dataAtual)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/transacoes')
  revalidatePath('/dashboard')
  return { sucesso: true }
}

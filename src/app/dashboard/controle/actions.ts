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

function revalidarControle() {
  revalidatePath('/dashboard/controle')
  revalidatePath('/dashboard/transacoes')
  revalidatePath('/dashboard/historico')
  revalidatePath('/dashboard')
}

export async function criarConta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { erro: 'Não autenticado' }

  const valor = Number(formData.get('valor'))
  const vencimento = String(formData.get('vencimento') ?? '')
  const categoriaId = String(formData.get('categoria_id') ?? '')
  const descricao = String(formData.get('descricao') ?? '').trim()
  const recorrente = formData.get('recorrente') === 'on'
  const mesesRecorrencia = recorrente
    ? Math.min(Math.max(Number(formData.get('meses_recorrencia')) || 12, 2), 120)
    : 1
  const grupoId = String(formData.get('grupo_id') ?? '') || null

  if (!valor || valor <= 0 || !vencimento || !categoriaId || !descricao) {
    return { erro: 'Preencha descrição, vencimento, valor e categoria.' }
  }

  const recorrenciaId = recorrente ? crypto.randomUUID() : null
  const contas = Array.from({ length: mesesRecorrencia }, (_, indice) => ({
    user_id: user.id,
    grupo_id: grupoId,
    categoria_id: categoriaId,
    descricao,
    valor,
    vencimento: adicionarMes(vencimento, indice),
    recorrente,
    recorrencia_id: recorrenciaId,
    recorrencia_origem: recorrente && indice === 0,
  }))

  const { error } = await supabase.from('contas_a_pagar').insert(contas)
  if (error) return { erro: error.message }

  revalidarControle()
  return { sucesso: true as const }
}

export async function marcarContaComoPaga(id: string, dataPagamento: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { erro: 'Não autenticado' }
  if (!dataPagamento) return { erro: 'Informe a data do pagamento.' }

  const { error } = await supabase.rpc('marcar_conta_como_paga', {
    p_conta_id: id,
    p_data_pagamento: dataPagamento,
  })

  if (error) return { erro: error.message }

  revalidarControle()
  return { sucesso: true as const }
}

export async function desfazerPagamentoConta(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { erro: 'Não autenticado' }

  const { error } = await supabase.rpc('desfazer_pagamento_conta', {
    p_conta_id: id,
  })

  if (error) return { erro: error.message }

  revalidarControle()
  return { sucesso: true as const }
}

export async function deletarConta(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { erro: 'Não autenticado' }

  const { data, error } = await supabase
    .from('contas_a_pagar')
    .delete()
    .eq('id', id)
    .eq('status', 'pendente')
    .select('id')
    .maybeSingle()

  if (error) return { erro: error.message }
  if (!data) return { erro: 'Desfaça o pagamento antes de excluir esta conta.' }

  revalidarControle()
  return { sucesso: true as const }
}

export async function cancelarRecorrenciaConta(recorrenciaId: string, vencimentoAtual: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { erro: 'Não autenticado' }

  const { error } = await supabase
    .from('contas_a_pagar')
    .delete()
    .eq('recorrencia_id', recorrenciaId)
    .eq('status', 'pendente')
    .gte('vencimento', vencimentoAtual)

  if (error) return { erro: error.message }

  revalidarControle()
  return { sucesso: true as const }
}

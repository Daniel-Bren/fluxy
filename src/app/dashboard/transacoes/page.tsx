import { createClient } from '@/lib/supabase/server'
import NovaTransacaoModal from '@/components/transacoes/nova-transacao-modal'
import ListaTransacoes from '@/components/transacoes/lista-transacoes'
import SeletorMes from '@/components/seletor-mes'
import FiltrosTransacoes from '@/components/transacoes/filtros-transacoes'
import { Suspense } from 'react'

type Props = {
  searchParams: Promise<{ mes?: string; tipo?: string; categoria_id?: string }>
}

export default async function TransacoesPage({ searchParams }: Props) {
  const { mes, tipo, categoria_id } = await searchParams
  const supabase = await createClient()

  const ano = mes ? parseInt(mes.split('-')[0]) : new Date().getFullYear()
  const mesNum = mes ? parseInt(mes.split('-')[1]) - 1 : new Date().getMonth()

  const primeiroDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-01`
  const ultimoDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-${new Date(ano, mesNum + 1, 0).getDate()}`

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nome, user_id')
    .order('nome')

  let query = supabase
    .from('transacoes')
    .select(`
      id,
      tipo,
      valor,
      data,
      descricao,
      recorrente,
      recorrencia_id,
      categorias (
        nome
      )
    `)
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)
    .order('data', { ascending: false })

  if (tipo && tipo !== 'todos') {
    query = query.eq('tipo', tipo)
  }

  if (categoria_id) {
    query = query.eq('categoria_id', categoria_id)
  }

  const { data: transacoes } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Transações</h1>
          <p className="text-[#6B7280] mt-1">
            Gerencie suas entradas e saídas
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="w-48 h-8 bg-gray-100 rounded-lg animate-pulse" />}>
            <SeletorMes />
          </Suspense>
          <NovaTransacaoModal categorias={categorias ?? []} />
        </div>
      </div>

      <div className="mb-4">
        <Suspense fallback={<div className="w-full h-9 bg-gray-100 rounded-lg animate-pulse" />}>
          <FiltrosTransacoes categorias={categorias ?? []} />
        </Suspense>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <ListaTransacoes transacoes={(transacoes ?? []) as any} />
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import PlanilhaTransacoes from '@/components/transacoes/planilha-transacoes'
import type { CategoriaPlanilha, TransacaoPlanilha } from '@/components/transacoes/planilha-transacoes'
import SeletorMes from '@/components/seletor-mes'
import FiltrosTransacoes from '@/components/transacoes/filtros-transacoes'
import ToggleModo from '@/components/toggle-modo'
import { Suspense } from 'react'

type Props = {
  searchParams: Promise<{ mes?: string; tipo?: string; categoria_id?: string; modo?: string }>
}

export default async function TransacoesPage({ searchParams }: Props) {
  const { mes, tipo, categoria_id, modo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ano = mes ? parseInt(mes.split('-')[0]) : new Date().getFullYear()
  const mesNum = mes ? parseInt(mes.split('-')[1]) - 1 : new Date().getMonth()

  const primeiroDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-01`
  const ultimoDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-${new Date(ano, mesNum + 1, 0).getDate()}`

  const { data: membro } = await supabase
    .from('membros_grupo')
    .select('grupo_id')
    .eq('user_id', user!.id)
    .single()

  const grupoId = membro?.grupo_id
  const modoCompartilhado = modo === 'compartilhado' && !!grupoId

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

  if (modoCompartilhado) {
    query = query.eq('grupo_id', grupoId)
  } else {
    query = query.eq('user_id', user!.id).is('grupo_id', null)
  }

  if (tipo && tipo !== 'todos') {
    query = query.eq('tipo', tipo)
  }

  if (categoria_id) {
    query = query.eq('categoria_id', categoria_id)
  }

  const { data: transacoes } = await query

  return (
    <div className="space-y-5 p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Planilha mensal</h1>
          <p className="mt-1 text-[#6B7280]">
            Lance, revise e acompanhe as movimentações do mês em uma visão única.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {grupoId && (
            <Suspense fallback={<div className="w-40 h-9 bg-gray-100 rounded-lg animate-pulse" />}>
              <ToggleModo />
            </Suspense>
          )}
          <Suspense fallback={<div className="w-48 h-8 bg-gray-100 rounded-lg animate-pulse" />}>
            <SeletorMes />
          </Suspense>
        </div>
      </div>

      <div>
        <Suspense fallback={<div className="w-full h-9 bg-gray-100 rounded-lg animate-pulse" />}>
          <FiltrosTransacoes categorias={categorias ?? []} />
        </Suspense>
      </div>

      <PlanilhaTransacoes
        transacoes={(transacoes ?? []) as TransacaoPlanilha[]}
        categorias={(categorias ?? []) as CategoriaPlanilha[]}
        grupoId={modoCompartilhado ? grupoId : null}
      />
    </div>
  )
}

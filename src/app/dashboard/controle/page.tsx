import { createClient } from '@/lib/supabase/server'
import PlanilhaControle from '@/components/controle/planilha-controle'
import type { CategoriaControle, ContaControle } from '@/components/controle/planilha-controle'
import FiltrosControle from '@/components/controle/filtros-controle'
import SeletorMes from '@/components/seletor-mes'
import ToggleModo from '@/components/toggle-modo'
import { Suspense } from 'react'

type Props = {
  searchParams: Promise<{
    mes?: string
    status?: string
    categoria_id?: string
    modo?: string
  }>
}

function hojeIso() {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
}

export default async function ControlePage({ searchParams }: Props) {
  const { mes, status, categoria_id, modo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ano = mes ? Number(mes.split('-')[0]) : new Date().getFullYear()
  const mesNumero = mes ? Number(mes.split('-')[1]) - 1 : new Date().getMonth()
  const primeiroDia = `${ano}-${String(mesNumero + 1).padStart(2, '0')}-01`
  const ultimoDia = `${ano}-${String(mesNumero + 1).padStart(2, '0')}-${new Date(ano, mesNumero + 1, 0).getDate()}`

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
    .from('contas_a_pagar')
    .select(`
      id,
      valor,
      vencimento,
      descricao,
      status,
      paga_em,
      recorrente,
      recorrencia_id,
      categorias (
        nome
      )
    `)
    .gte('vencimento', primeiroDia)
    .lte('vencimento', ultimoDia)
    .order('vencimento', { ascending: true })

  if (modoCompartilhado) {
    query = query.eq('grupo_id', grupoId)
  } else {
    query = query.eq('user_id', user!.id).is('grupo_id', null)
  }

  if (status === 'paga' || status === 'pendente') {
    query = query.eq('status', status)
  }

  if (status === 'vencida') {
    query = query.eq('status', 'pendente').lt('vencimento', hojeIso())
  }

  if (categoria_id) {
    query = query.eq('categoria_id', categoria_id)
  }

  const { data: contas } = await query

  return (
    <div className="space-y-5 p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Controle</h1>
          <p className="mt-1 text-gray-500">
            Acompanhe as contas a pagar do mês e registre os pagamentos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {grupoId && (
            <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-lg bg-gray-100" />}>
              <ToggleModo />
            </Suspense>
          )}
          <Suspense fallback={<div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />}>
            <SeletorMes />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />}>
        <FiltrosControle categorias={categorias ?? []} />
      </Suspense>

      <PlanilhaControle
        contas={(contas ?? []) as ContaControle[]}
        categorias={(categorias ?? []) as CategoriaControle[]}
        grupoId={modoCompartilhado ? grupoId : null}
      />
    </div>
  )
}

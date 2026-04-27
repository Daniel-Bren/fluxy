import { createClient } from '@/lib/supabase/server'
import SeletorMes from '@/components/seletor-mes'
import GraficoCategorias from '@/components/grafico-categorias'
import ToggleModo from '@/components/toggle-modo'
import { Suspense } from 'react'

type Props = {
  searchParams: Promise<{ mes?: string; modo?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { mes, modo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const primeiroNome = user?.user_metadata?.nome?.split(' ')[0] ?? user?.email

  const ano = mes ? parseInt(mes.split('-')[0]) : new Date().getFullYear()
  const mesNum = mes ? parseInt(mes.split('-')[1]) - 1 : new Date().getMonth()
  const dataRef = new Date(ano, mesNum, 1)

  const primeiroDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-01`
  const ultimoDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-${new Date(ano, mesNum + 1, 0).getDate()}`

  // Busca grupo do usuário
  const { data: membro } = await supabase
    .from('membros_grupo')
    .select('grupo_id')
    .eq('user_id', user!.id)
    .single()

  const grupoId = membro?.grupo_id
  const modoCompartilhado = modo === 'compartilhado' && !!grupoId

  // Query base
  let queryTransacoes = supabase
    .from('transacoes')
    .select('tipo, valor')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)

  let queryRecentes = supabase
    .from('transacoes')
    .select('id, tipo, valor, data, descricao, categorias(nome)')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)
    .order('data', { ascending: false })
    .limit(5)

  let queryGastos = supabase
    .from('transacoes')
    .select('valor, categorias(nome)')
    .eq('tipo', 'saida')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)

  if (modoCompartilhado) {
    queryTransacoes = queryTransacoes.eq('grupo_id', grupoId)
    queryRecentes = queryRecentes.eq('grupo_id', grupoId)
    queryGastos = queryGastos.eq('grupo_id', grupoId)
  } else {
    queryTransacoes = queryTransacoes.eq('user_id', user!.id).is('grupo_id', null)
    queryRecentes = queryRecentes.eq('user_id', user!.id).is('grupo_id', null)
    queryGastos = queryGastos.eq('user_id', user!.id).is('grupo_id', null)
  }

  const { data: transacoes } = await queryTransacoes
  const { data: transacoesRecentes } = await queryRecentes
  const { data: gastosPorCategoria } = await queryGastos

  const totalEntradas = transacoes
    ?.filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const totalSaidas = transacoes
    ?.filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const saldo = totalEntradas - totalSaidas
  const mesAtual = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const categoriaMap: Record<string, number> = {}
  for (const t of gastosPorCategoria ?? []) {
    const cat = t.categorias as any
    const nome = (Array.isArray(cat) ? cat[0]?.nome : cat?.nome) ?? 'Outros'
    categoriaMap[nome] = (categoriaMap[nome] ?? 0) + Number(t.valor)
  }
  const dadosGrafico = Object.entries(categoriaMap)
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => b.valor - a.valor)

  function formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Olá, {primeiroNome}! 👋
          </h1>
          <p className="text-[#6B7280] mt-1">
            Aqui está o resumo da sua vida financeira.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Saldo atual</p>
          <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-[#111827]' : 'text-[#DC2626]'}`}>
            {formatarMoeda(saldo)}
          </p>
          <p className="text-xs text-[#6B7280] mt-2 capitalize">em {mesAtual}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total recebido</p>
          <p className="text-3xl font-bold text-[#16A34A]">
            {formatarMoeda(totalEntradas)}
          </p>
          <p className="text-xs text-[#6B7280] mt-2 capitalize">em {mesAtual}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total gasto</p>
          <p className="text-3xl font-bold text-[#DC2626]">
            {formatarMoeda(totalSaidas)}
          </p>
          <p className="text-xs text-[#6B7280] mt-2 capitalize">em {mesAtual}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Gastos por categoria</h2>
          <GraficoCategorias dados={dadosGrafico} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#111827]">Transações recentes</h2>
            <a href="/dashboard/transacoes" className="text-sm text-[#2563EB] hover:underline">
              Ver todas
            </a>
          </div>

          {transacoesRecentes && transacoesRecentes.length > 0 ? (
            <div className="space-y-3">
              {(transacoesRecentes as any[]).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      t.tipo === 'entrada' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <span className={`text-xs font-bold ${
                        t.tipo === 'entrada' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                      }`}>
                        {t.tipo === 'entrada' ? '↓' : '↑'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        {t.descricao || t.categorias?.[0]?.nome || '—'}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    t.tipo === 'entrada' ? 'text-[#16A34A]' : 'text-[#DC2626]'
                  }`}>
                    {t.tipo === 'saida' ? '- ' : ''}
                    {Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#6B7280] text-sm">
              Nenhuma transação ainda. Adicione a primeira!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import SeletorMes from '@/components/seletor-mes'
import { Suspense } from 'react'

type Props = {
  searchParams: Promise<{ mes?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { mes } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const primeiroNome = user?.user_metadata?.nome?.split(' ')[0] ?? user?.email

  const ano = mes ? parseInt(mes.split('-')[0]) : new Date().getFullYear()
  const mesNum = mes ? parseInt(mes.split('-')[1]) - 1 : new Date().getMonth()
  const dataRef = new Date(ano, mesNum, 1)

  const primeiroDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-01`
  const ultimoDia = `${ano}-${String(mesNum + 1).padStart(2, '0')}-${new Date(ano, mesNum + 1, 0).getDate()}`

  const { data: transacoes } = await supabase
    .from('transacoes')
    .select('tipo, valor')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)

  const { data: transacoesRecentes } = await supabase
    .from('transacoes')
    .select(`
      id,
      tipo,
      valor,
      data,
      descricao,
      categorias (
        nome
      )
    `)
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)
    .order('data', { ascending: false })
    .limit(5)

  const totalEntradas = transacoes
    ?.filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const totalSaidas = transacoes
    ?.filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const saldo = totalEntradas - totalSaidas

  const mesAtual = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

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

        <Suspense fallback={<div className="w-48 h-8 bg-gray-100 rounded-lg animate-pulse" />}>
          <SeletorMes />
        </Suspense>
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

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#111827]">Transações recentes</h2>
          <a href="/dashboard/transacoes" className="text-sm text-[#2563EB] hover:underline">
            Ver todas
          </a>
        </div>

        {transacoesRecentes && transacoesRecentes.length > 0 ? (
          <div className="space-y-3">
            {transacoesRecentes.map((t: any) => (
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
  )
}
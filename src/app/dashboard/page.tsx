import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const primeiroNome = user?.user_metadata?.nome?.split(' ')[0] ?? user?.email

  const agora = new Date()
  const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString()

  const { data: transacoes } = await supabase
    .from('transacoes')
    .select('tipo, valor')
    .gte('data', primeiroDia)
    .lte('data', ultimoDia)

  const totalEntradas = transacoes
    ?.filter((t) => t.tipo === 'entrada')
    .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const totalSaidas = transacoes
    ?.filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + Number(t.valor), 0) ?? 0

  const saldo = totalEntradas - totalSaidas

  const mesAtual = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  function formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">
          Olá, {primeiroNome}! 👋
        </h1>
        <p className="text-[#6B7280] mt-1">
          Aqui está o resumo da sua vida financeira.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Saldo atual</p>
          <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-[#111827]' : 'text-[#DC2626]'}`}>
            {formatarMoeda(saldo)}
          </p>
          <p className="text-xs text-[#6B7280] mt-2">em {mesAtual}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total recebido</p>
          <p className="text-3xl font-bold text-[#16A34A]">
            {formatarMoeda(totalEntradas)}
          </p>
          <p className="text-xs text-[#6B7280] mt-2">em {mesAtual}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total gasto</p>
          <p className="text-3xl font-bold text-[#DC2626]">
            {formatarMoeda(totalSaidas)}
          </p>
          <p className="text-xs text-[#6B7280] mt-2">em {mesAtual}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#111827]">Transações recentes</h2>
          <a href="/dashboard/transacoes" className="text-sm text-[#2563EB] hover:underline">
            Ver todas
          </a>
        </div>

        <div className="text-center py-8 text-[#6B7280] text-sm">
          Nenhuma transação ainda. Adicione a primeira!
        </div>
      </div>
    </div>
  )
}
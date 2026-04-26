import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const primeiroNome = user?.user_metadata?.nome?.split(' ')[0] ?? user?.email

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">
          Olá, {primeiroNome}! 👋
        </h1>
        <p className="text-[#6B7280] mt-1">
          Aqui está o resumo da sua vida financeira.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Saldo atual</p>
          <p className="text-3xl font-bold text-[#111827]">R$ 0,00</p>
          <p className="text-xs text-[#6B7280] mt-2">em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total recebido</p>
          <p className="text-3xl font-bold text-[#16A34A]">R$ 0,00</p>
          <p className="text-xs text-[#6B7280] mt-2">em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-[#6B7280] mb-1">Total gasto</p>
          <p className="text-3xl font-bold text-[#DC2626]">R$ 0,00</p>
          <p className="text-xs text-[#6B7280] mt-2">em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Transações recentes */}
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
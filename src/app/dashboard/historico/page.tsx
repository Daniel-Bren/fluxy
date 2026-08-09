import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default async function HistoricoPage() {
  const supabase = await createClient()

  const { data: transacoes } = await supabase
    .from('transacoes')
    .select('tipo, valor, data')
    .order('data', { ascending: false })

  if (!transacoes || transacoes.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-[#111827]">Histórico</h1>
          <p className="text-[#6B7280] mt-1">Resumo financeiro por mês.</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-8 text-center text-sm text-[#6B7280] shadow-sm sm:p-12">
          Nenhuma transação encontrada ainda.
        </div>
      </div>
    )
  }

  // Agrupa transações por mês
  const meses: Record<string, { entradas: number; saidas: number }> = {}

  for (const t of transacoes) {
    const data = new Date(t.data)
    const chave = `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`

    if (!meses[chave]) {
      meses[chave] = { entradas: 0, saidas: 0 }
    }

    if (t.tipo === 'entrada') {
      meses[chave].entradas += Number(t.valor)
    } else {
      meses[chave].saidas += Number(t.valor)
    }
  }

  const mesesOrdenados = Object.entries(meses).sort((a, b) => b[0].localeCompare(a[0]))

  function formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarMes(chave: string) {
    const [ano, mes] = chave.split('-')
    const data = new Date(parseInt(ano), parseInt(mes) - 1, 1)
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Histórico</h1>
        <p className="text-[#6B7280] mt-1">Resumo financeiro por mês.</p>
      </div>

      <div className="space-y-4">
        {mesesOrdenados.map(([chave, dados]) => {
          const saldo = dados.entradas - dados.saidas

          return (
            <Link
              key={chave}
              href={`/dashboard?mes=${chave}`}
              className="group flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-[#2563EB] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div>
                <p className="text-base font-semibold text-[#111827] capitalize group-hover:text-[#2563EB] transition-colors">
                  {formatarMes(chave)}
                </p>
                <p className={`text-sm font-medium mt-1 ${saldo >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  Saldo: {formatarMoeda(saldo)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2 sm:flex sm:gap-6">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle size={16} className="text-[#16A34A]" />
                  <span className="text-[#16A34A] font-medium">{formatarMoeda(dados.entradas)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpCircle size={16} className="text-[#DC2626]" />
                  <span className="text-[#DC2626] font-medium">{formatarMoeda(dados.saidas)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

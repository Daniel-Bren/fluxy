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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111827]">Histórico</h1>
          <p className="text-[#6B7280] mt-1">Resumo financeiro por mês.</p>
        </div>
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center text-[#6B7280] text-sm">
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
    <div className="p-8">
      <div className="mb-8">
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
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between hover:border-[#2563EB] transition-colors group"
            >
              <div>
                <p className="text-base font-semibold text-[#111827] capitalize group-hover:text-[#2563EB] transition-colors">
                  {formatarMes(chave)}
                </p>
                <p className={`text-sm font-medium mt-1 ${saldo >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  Saldo: {formatarMoeda(saldo)}
                </p>
              </div>

              <div className="flex gap-6 text-sm">
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
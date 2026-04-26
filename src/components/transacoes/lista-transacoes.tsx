'use client'

import { deletarTransacao } from '@/app/dashboard/transacoes/actions'
import { Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

type Transacao = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: number
  data: string
  descricao: string | null
  categorias: {
    nome: string
  } | null
}

type Props = {
  transacoes: Transacao[]
}

export default function ListaTransacoes({ transacoes }: Props) {
  if (transacoes.length === 0) {
    return (
      <div className="text-center py-12 text-[#6B7280] text-sm">
        Nenhuma transação ainda. Adicione a primeira!
      </div>
    )
  }

  async function handleDeletar(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    await deletarTransacao(id)
  }

  return (
    <div className="space-y-3">
      {transacoes.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            {t.tipo === 'entrada' ? (
              <ArrowDownCircle size={22} className="text-[#16A34A]" />
            ) : (
              <ArrowUpCircle size={22} className="text-[#DC2626]" />
            )}

            <div>
              <p className="text-sm font-medium text-[#111827]">
                {t.descricao || t.categorias?.nome || '—'}
              </p>
              <p className="text-xs text-[#6B7280]">
                {t.categorias?.nome} •{' '}
                {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`text-sm font-semibold ${
                t.tipo === 'entrada' ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {t.tipo === 'saida' ? '- ' : ''}
              {t.valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>

            <button
              onClick={() => handleDeletar(t.id)}
              className="text-[#6B7280] hover:text-[#DC2626] transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
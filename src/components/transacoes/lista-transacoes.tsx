'use client'

import { deletarTransacao, cancelarRecorrencia } from '@/app/dashboard/transacoes/actions'
import { Trash2, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'

type Transacao = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: number
  data: string
  descricao: string | null
  recorrente: boolean
  recorrencia_id: string | null
  categorias: {
    nome: string
  }[] | null
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

  async function handleCancelarRecorrencia(recorrenciaId: string, data: string) {
    if (!confirm('Cancelar recorrência a partir deste mês? Os meses anteriores serão mantidos.')) return
    await cancelarRecorrencia(recorrenciaId, data)
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
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#111827]">
                  {t.descricao || t.categorias?.[0]?.nome || '—'}
                </p>
                {t.recorrente && (
                  <span className="flex items-center gap-1 text-xs text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                    <RefreshCw size={10} />
                    Recorrente
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                {t.categorias?.[0]?.nome} •{' '}
                {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

            {t.recorrente && t.recorrencia_id && (
              <button
                onClick={() => handleCancelarRecorrencia(t.recorrencia_id!, t.data)}
                className="text-[#6B7280] hover:text-[#2563EB] transition-colors"
                title="Cancelar recorrência a partir deste mês"
              >
                <RefreshCw size={15} />
              </button>
            )}

            <button
              onClick={() => handleDeletar(t.id)}
              className="text-[#6B7280] hover:text-[#DC2626] transition-colors"
              title="Excluir transação"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
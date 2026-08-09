'use client'

import { useState, useTransition } from 'react'
import { deletarTransacao, cancelarRecorrencia } from '@/app/dashboard/transacoes/actions'
import { Trash2, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'

type CategoriaRelacao = { nome: string } | { nome: string }[] | null

export type TransacaoLista = {
  id: string
  tipo: 'entrada' | 'saida'
  valor: number
  data: string
  descricao: string | null
  recorrente: boolean
  recorrencia_id: string | null
  categorias: CategoriaRelacao
}

type Props = {
  transacoes: TransacaoLista[]
}

function nomeCategoria(categorias: CategoriaRelacao) {
  if (Array.isArray(categorias)) return categorias[0]?.nome ?? 'Sem categoria'
  return categorias?.nome ?? 'Sem categoria'
}

export default function ListaTransacoes({ transacoes }: Props) {
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleDeletar(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    setErro('')
    startTransition(async () => {
      const resultado = await deletarTransacao(id)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  function handleCancelarRecorrencia(recorrenciaId: string, data: string) {
    if (!confirm('Cancelar recorrência a partir deste mês? Os meses anteriores serão mantidos.')) return
    setErro('')
    startTransition(async () => {
      const resultado = await cancelarRecorrencia(recorrenciaId, data)
      if (resultado?.erro) setErro(resultado.erro)
    })
  }

  return (
    <div className="divide-y divide-gray-100">
      {erro && (
        <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {erro}
        </div>
      )}

      {transacoes.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">
          Nenhuma transação neste mês. Adicione a primeira.
        </div>
      )}

      {transacoes.map((t) => (
        <div
          key={t.id}
          className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            {t.tipo === 'entrada' ? (
              <ArrowDownCircle size={22} className="text-[#16A34A]" />
            ) : (
              <ArrowUpCircle size={22} className="text-[#DC2626]" />
            )}

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-[#111827]">
                  {t.descricao || nomeCategoria(t.categorias)}
                </p>
                {t.recorrente && (
                  <span className="flex items-center gap-1 text-xs text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                    <RefreshCw size={10} />
                    Recorrente
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                {nomeCategoria(t.categorias)} •{' '}
                {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
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
                disabled={isPending}
                className="text-[#6B7280] hover:text-[#2563EB] transition-colors"
                title="Cancelar recorrência a partir deste mês"
              >
                <RefreshCw size={15} />
              </button>
            )}

            <button
              onClick={() => handleDeletar(t.id)}
              disabled={isPending}
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

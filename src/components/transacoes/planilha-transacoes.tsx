'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import {
  cancelarRecorrencia,
  criarTransacao,
  deletarTransacao,
} from '@/app/dashboard/transacoes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'

export type CategoriaPlanilha = {
  id: string
  nome: string
  user_id: string | null
}

type CategoriaRelacao =
  | {
      nome: string
    }
  | {
      nome: string
    }[]
  | null

export type TransacaoPlanilha = {
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
  transacoes: TransacaoPlanilha[]
  categorias: CategoriaPlanilha[]
  grupoId?: string | null
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function nomeCategoria(categorias: CategoriaRelacao) {
  if (Array.isArray(categorias)) return categorias[0]?.nome ?? 'Sem categoria'
  return categorias?.nome ?? 'Sem categoria'
}

function hojeIso() {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
}

export default function PlanilhaTransacoes({ transacoes, categorias, grupoId }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida')
  const [erro, setErro] = useState('')
  const [data, setData] = useState(hojeIso())
  const [recorrente, setRecorrente] = useState(false)
  const [isPending, startTransition] = useTransition()

  const resumo = useMemo(() => {
    return transacoes.reduce(
      (acc, transacao) => {
        const valor = Number(transacao.valor)
        if (transacao.tipo === 'entrada') acc.entradas += valor
        if (transacao.tipo === 'saida') acc.saidas += valor
        return acc
      },
      { entradas: 0, saidas: 0 },
    )
  }, [transacoes])

  const saldo = resumo.entradas - resumo.saidas

  function handleSubmit(formData: FormData) {
    setErro('')
    formData.set('tipo', tipo)
    if (grupoId) formData.set('grupo_id', grupoId)

    startTransition(async () => {
      const resultado = await criarTransacao(formData)

      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }

      formRef.current?.reset()
      setTipo('saida')
      setData(hojeIso())
      setRecorrente(false)
    })
  }

  function handleDeletar(id: string) {
    if (!confirm('Excluir esta transação?')) return
    startTransition(async () => {
      await deletarTransacao(id)
    })
  }

  function handleCancelarRecorrencia(recorrenciaId: string, dataAtual: string) {
    if (!confirm('Cancelar recorrência a partir deste mês? Os meses anteriores serão mantidos.')) return
    startTransition(async () => {
      await cancelarRecorrencia(recorrenciaId, dataAtual)
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Linhas</p>
          <p className="mt-1 text-xl font-semibold text-gray-950">{transacoes.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Entradas</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">{formatarMoeda(resumo.entradas)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Saídas</p>
          <p className="mt-1 text-xl font-semibold text-rose-700">{formatarMoeda(resumo.saidas)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Saldo</p>
          <p className={`mt-1 text-xl font-semibold ${saldo >= 0 ? 'text-gray-950' : 'text-rose-700'}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>
      </div>

      <form
        ref={formRef}
        action={handleSubmit}
        className="rounded-lg border border-gray-200 bg-white"
      >
        <div className="grid grid-cols-1 gap-2 border-b border-gray-200 p-3 lg:grid-cols-[136px_140px_160px_1fr_1fr_142px_44px]">
          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-gray-200 text-sm">
            <button
              type="button"
              onClick={() => setTipo('entrada')}
              className={`px-3 py-2 font-medium transition-colors ${
                tipo === 'entrada' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo('saida')}
              className={`px-3 py-2 font-medium transition-colors ${
                tipo === 'saida' ? 'bg-rose-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Saída
            </button>
          </div>

          <Input
            name="data"
            type="date"
            value={data}
            onChange={(event) => setData(event.target.value)}
            required
            className="h-10 rounded-md"
          />

          <Input
            name="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            required
            className="h-10 rounded-md"
          />

          <select
            name="categoria_id"
            required
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-400"
          >
            <option value="">Categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>

          <Input
            name="descricao"
            type="text"
            placeholder="Descrição"
            className="h-10 rounded-md"
          />

          <label className="flex h-10 items-center gap-2 rounded-md border border-gray-200 px-3 text-sm text-gray-600">
            <input
              name="recorrente"
              type="checkbox"
              checked={recorrente}
              onChange={(event) => setRecorrente(event.target.checked)}
              className="rounded border-gray-300"
            />
            Recorrente
          </label>

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-md bg-gray-950 px-0 hover:bg-gray-800"
            title="Adicionar linha"
          >
            {isPending ? <Check size={17} /> : <Plus size={17} />}
          </Button>
        </div>

        {recorrente && (
          <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-500">Repetir por</span>
            <Input
              name="meses_recorrencia"
              type="number"
              min="2"
              max="120"
              defaultValue="12"
              className="h-8 w-20 rounded-md"
            />
            <span className="text-sm text-gray-500">meses</span>
          </div>
        )}

        {erro && (
          <div className="border-b border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {erro}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="w-32 px-3 py-2">Data</th>
                <th className="w-32 px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Descrição</th>
                <th className="w-48 px-3 py-2">Categoria</th>
                <th className="w-36 px-3 py-2 text-right">Valor</th>
                <th className="w-32 px-3 py-2">Status</th>
                <th className="w-24 px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-gray-500">
                    Nenhuma linha neste mês. Use a primeira linha acima para lançar a primeira transação.
                  </td>
                </tr>
              ) : (
                transacoes.map((transacao) => (
                  <tr key={transacao.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-700">{formatarData(transacao.data)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
                          transacao.tipo === 'entrada'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {transacao.tipo === 'entrada' ? (
                          <ArrowDownCircle size={13} />
                        ) : (
                          <ArrowUpCircle size={13} />
                        )}
                        {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-950">
                      {transacao.descricao || nomeCategoria(transacao.categorias)}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{nomeCategoria(transacao.categorias)}</td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${
                        transacao.tipo === 'entrada' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {transacao.tipo === 'saida' ? '- ' : ''}
                      {formatarMoeda(Number(transacao.valor))}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {transacao.recorrente ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                          <RefreshCw size={12} />
                          Recorrente
                        </span>
                      ) : (
                        <span className="text-xs">Única</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        {transacao.recorrente && transacao.recorrencia_id && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelarRecorrencia(transacao.recorrencia_id!, transacao.data)
                            }
                            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
                            title="Cancelar recorrência"
                          >
                            <RefreshCw size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletar(transacao.id)}
                          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                          title="Excluir linha"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  )
}

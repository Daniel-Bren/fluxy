'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import {
  cancelarRecorrenciaConta,
  criarConta,
  deletarConta,
  desfazerPagamentoConta,
  editarConta,
  marcarContaComoPaga,
} from '@/app/dashboard/controle/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'

export type CategoriaControle = {
  id: string
  nome: string
  user_id: string | null
}

type CategoriaRelacao = { nome: string } | { nome: string }[] | null

export type ContaControle = {
  id: string
  categoria_id: string
  valor: number
  vencimento: string
  descricao: string
  status: 'pendente' | 'paga'
  paga_em: string | null
  recorrente: boolean
  recorrencia_id: string | null
  categorias: CategoriaRelacao
}

type Props = {
  contas: ContaControle[]
  categorias: CategoriaControle[]
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

export default function PlanilhaControle({ contas, categorias, grupoId }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [vencimento, setVencimento] = useState(hojeIso())
  const [recorrente, setRecorrente] = useState(false)
  const [erro, setErro] = useState('')
  const [contaEdicao, setContaEdicao] = useState<ContaControle | null>(null)
  const [contaPagamento, setContaPagamento] = useState<ContaControle | null>(null)
  const [dataPagamento, setDataPagamento] = useState(hojeIso())
  const [isPending, startTransition] = useTransition()

  const resumo = useMemo(() => {
    return contas.reduce(
      (total, conta) => {
        const valor = Number(conta.valor)
        total.previsto += valor
        if (conta.status === 'paga') total.pago += valor
        if (conta.status === 'pendente') total.pendente += valor
        return total
      },
      { previsto: 0, pago: 0, pendente: 0 },
    )
  }, [contas])

  function executar(acao: () => Promise<{ erro?: string } | undefined>, aoConcluir?: () => void) {
    setErro('')
    startTransition(async () => {
      const resultado = await acao()

      if (resultado?.erro) {
        setErro(resultado.erro)
        return
      }

      aoConcluir?.()
    })
  }

  function handleSubmit(formData: FormData) {
    if (grupoId) formData.set('grupo_id', grupoId)

    executar(() => criarConta(formData), () => {
      formRef.current?.reset()
      setVencimento(hojeIso())
      setRecorrente(false)
    })
  }

  function abrirPagamento(conta: ContaControle) {
    setErro('')
    setContaPagamento(conta)
    setDataPagamento(hojeIso())
  }

  function abrirEdicao(conta: ContaControle) {
    setErro('')
    setContaEdicao(conta)
  }

  function salvarEdicao(formData: FormData) {
    if (!contaEdicao) return

    executar(
      () => editarConta(contaEdicao.id, formData),
      () => setContaEdicao(null),
    )
  }

  function confirmarPagamento() {
    if (!contaPagamento) return

    executar(
      () => marcarContaComoPaga(contaPagamento.id, dataPagamento),
      () => setContaPagamento(null),
    )
  }

  function handleDesfazerPagamento(id: string) {
    if (!confirm('Desfazer o pagamento e remover a saída vinculada?')) return
    executar(() => desfazerPagamentoConta(id))
  }

  function handleDeletar(id: string) {
    if (!confirm('Excluir esta conta?')) return
    executar(() => deletarConta(id))
  }

  function handleCancelarRecorrencia(recorrenciaId: string, dataAtual: string) {
    if (!confirm('Cancelar as contas pendentes desta recorrência a partir deste mês?')) return
    executar(() => cancelarRecorrenciaConta(recorrenciaId, dataAtual))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Contas</p>
          <p className="mt-1 text-xl font-semibold text-gray-950">{contas.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Total previsto</p>
          <p className="mt-1 text-xl font-semibold text-gray-950">{formatarMoeda(resumo.previsto)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Pago</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">{formatarMoeda(resumo.pago)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase text-gray-500">Pendente</p>
          <p className="mt-1 text-xl font-semibold text-amber-700">{formatarMoeda(resumo.pendente)}</p>
        </div>
      </div>

      <form ref={formRef} action={handleSubmit} className="rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-1 gap-2 border-b border-gray-200 p-3 lg:grid-cols-[160px_160px_minmax(180px,1fr)_minmax(220px,1.4fr)_142px_44px]">
          <Input
            name="vencimento"
            type="date"
            value={vencimento}
            onChange={(event) => setVencimento(event.target.value)}
            required
            className="h-10 rounded-md"
            aria-label="Vencimento"
          />

          <Input
            name="valor"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Valor"
            required
            className="h-10 rounded-md"
          />

          <select
            name="categoria_id"
            required
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400"
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
            placeholder="Descrição da conta"
            required
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
            title="Adicionar conta"
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
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="w-36 px-3 py-2">Vencimento</th>
                <th className="px-3 py-2">Conta</th>
                <th className="w-48 px-3 py-2">Categoria</th>
                <th className="w-36 px-3 py-2 text-right">Valor</th>
                <th className="w-40 px-3 py-2">Status</th>
                <th className="w-32 px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-gray-500">
                    Nenhuma conta neste mês. Use a linha acima para adicionar a primeira.
                  </td>
                </tr>
              ) : (
                contas.map((conta) => {
                  const vencida = conta.status === 'pendente' && conta.vencimento < hojeIso()

                  return (
                    <tr key={conta.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className={`px-3 py-2 font-medium ${vencida ? 'text-rose-700' : 'text-gray-700'}`}>
                        {formatarData(conta.vencimento)}
                      </td>
                      <td className="px-3 py-2 text-gray-950">
                        <div className="flex items-center gap-2">
                          <span>{conta.descricao}</span>
                          {conta.recorrente && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                              <RefreshCw size={12} />
                              Recorrente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{nomeCategoria(conta.categorias)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-950">
                        {formatarMoeda(Number(conta.valor))}
                      </td>
                      <td className="px-3 py-2">
                        {conta.status === 'paga' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={13} />
                            Paga em {formatarData(conta.paga_em!)}
                          </span>
                        ) : vencida ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                            <AlertTriangle size={13} />
                            Vencida
                          </span>
                        ) : (
                          <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => abrirEdicao(conta)}
                            disabled={isPending}
                            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                            title="Editar conta"
                          >
                            <Pencil size={15} />
                          </button>

                          {conta.status === 'pendente' ? (
                            <button
                              type="button"
                              onClick={() => abrirPagamento(conta)}
                              disabled={isPending}
                              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                              title="Marcar como paga"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDesfazerPagamento(conta.id)}
                              disabled={isPending}
                              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-700"
                              title="Desfazer pagamento"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}

                          {conta.status === 'pendente' && conta.recorrente && conta.recorrencia_id && (
                            <button
                              type="button"
                              onClick={() => handleCancelarRecorrencia(conta.recorrencia_id!, conta.vencimento)}
                              disabled={isPending}
                              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
                              title="Cancelar recorrência"
                            >
                              <RefreshCw size={15} />
                            </button>
                          )}

                          {conta.status === 'pendente' && (
                            <button
                              type="button"
                              onClick={() => handleDeletar(conta.id)}
                              disabled={isPending}
                              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                              title="Excluir conta"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </form>

      {contaEdicao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar edição"
            className="absolute inset-0 bg-black/45"
            onClick={() => setContaEdicao(null)}
          />
          <form
            action={salvarEdicao}
            className="relative z-10 w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-950">Editar conta</h2>
                <p className="mt-1 text-sm text-gray-500">
                  A transação vinculada também será atualizada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContaEdicao(null)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="editar_descricao">
                  Descrição
                </label>
                <Input
                  id="editar_descricao"
                  name="descricao"
                  type="text"
                  defaultValue={contaEdicao.descricao}
                  required
                  className="mt-2 h-10 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="editar_categoria">
                  Categoria
                </label>
                <select
                  id="editar_categoria"
                  name="categoria_id"
                  defaultValue={contaEdicao.categoria_id}
                  required
                  className="mt-2 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400"
                >
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="editar_valor">
                  Valor
                </label>
                <Input
                  id="editar_valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={Number(contaEdicao.valor)}
                  required
                  className="mt-2 h-10 rounded-md"
                />
              </div>

              {erro && (
                <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {erro}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setContaEdicao(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-blue-700 hover:bg-blue-800">
                <Check size={16} />
                Salvar alterações
              </Button>
            </div>
          </form>
        </div>
      )}

      {contaPagamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar confirmação"
            className="absolute inset-0 bg-black/45"
            onClick={() => setContaPagamento(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-950">Marcar como paga</h2>
                <p className="mt-1 text-sm text-gray-500">{contaPagamento.descricao}</p>
              </div>
              <button
                type="button"
                onClick={() => setContaPagamento(null)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-gray-700" htmlFor="data_pagamento">
              Data do pagamento
            </label>
            <Input
              id="data_pagamento"
              type="date"
              value={dataPagamento}
              onChange={(event) => setDataPagamento(event.target.value)}
              className="mt-2 h-10 rounded-md"
            />

            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setContaPagamento(null)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmarPagamento}
                disabled={isPending || !dataPagamento}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                <CheckCircle2 size={16} />
                Confirmar pagamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { criarTransacao, criarCategoria, deletarCategoria } from '@/app/dashboard/transacoes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, Trash2, Settings } from 'lucide-react'

type Categoria = {
  id: string
  nome: string
  user_id: string | null
}

type Props = {
  categorias: Categoria[]
  grupoId?: string | null
}

export default function NovaTransacaoModal({ categorias: categoriasProp, grupoId }: Props) {
  const [aberto, setAberto] = useState(false)
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const hoje = new Date()
  const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
  const [data, setData] = useState(dataHoje)

  const [categorias, setCategorias] = useState<Categoria[]>(categoriasProp)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [criandoCategoria, setCriandoCategoria] = useState(false)
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false)
  const [gerenciando, setGerenciando] = useState(false)
  const [recorrente, setRecorrente] = useState(false)

  const categoriasPessoais = categorias.filter(c => c.user_id)

  async function handleSubmit(formData: FormData) {
    setErro('')
    setCarregando(true)
    if (grupoId) formData.set('grupo_id', grupoId)

    const resultado = await criarTransacao(formData)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
      return
    }

    setAberto(false)
    setTipo('entrada')
    setCarregando(false)
  }

  async function handleCriarCategoria() {
    if (!novaCategoria.trim()) return
    setCriandoCategoria(true)

    const resultado = await criarCategoria(novaCategoria)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCriandoCategoria(false)
      return
    }

    if (resultado.categoria) {
      setCategorias((prev) => [...prev, resultado.categoria as Categoria])
    }

    setNovaCategoria('')
    setMostrarNovaCategoria(false)
    setCriandoCategoria(false)
  }

  async function handleDeletarCategoria(id: string) {
    const resultado = await deletarCategoria(id)
    if (resultado?.sucesso) {
      setCategorias((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <>
      <Button
        className="bg-[#2563EB] hover:bg-[#1d4ed8]"
        onClick={() => setAberto(true)}
      >
        + Nova Transação
      </Button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAberto(false)}
          />

          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#111827]">
                Nova Transação
              </h2>
              <button
                onClick={() => setAberto(false)}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                <X size={20} />
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('entrada')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tipo === 'entrada'
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-gray-100 text-[#6B7280]'
                    }`}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('saida')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tipo === 'saida'
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-gray-100 text-[#6B7280]'
                    }`}
                  >
                    Saída
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="categoria_id">Categoria</Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMostrarNovaCategoria(!mostrarNovaCategoria)}
                      className="text-xs text-[#2563EB] hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} />
                      Nova
                    </button>
                    {categoriasPessoais.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setGerenciando(!gerenciando)}
                        className="text-xs text-[#6B7280] hover:text-[#111827] flex items-center gap-1"
                      >
                        <Settings size={12} />
                        Gerenciar
                      </button>
                    )}
                  </div>
                </div>

                <select
                  id="categoria_id"
                  name="categoria_id"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>

                {/* Campo nova categoria */}
                {mostrarNovaCategoria && (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Nome da categoria"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCriarCategoria())}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      onClick={handleCriarCategoria}
                      disabled={criandoCategoria}
                      className="bg-[#2563EB] hover:bg-[#1d4ed8] shrink-0"
                    >
                      <Plus size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMostrarNovaCategoria(false)}
                      className="shrink-0"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}

                {/* Gerenciar categorias pessoais */}
                {gerenciando && categoriasPessoais.length > 0 && (
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    {categoriasPessoais.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <span className="text-xs text-[#111827]">{cat.nome}</span>
                        <button
                          type="button"
                          onClick={() => handleDeletarCategoria(cat.id)}
                          className="text-[#6B7280] hover:text-[#DC2626] transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  name="descricao"
                  type="text"
                  placeholder="Ex: Almoço, Salário..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="recorrente"
                    name="recorrente"
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => setRecorrente(e.target.checked)}
                  />
                  <Label htmlFor="recorrente">Transação recorrente</Label>
                </div>

                {recorrente && (
                  <div className="flex items-center gap-2 pl-6">
                    <Input
                      id="meses_recorrencia"
                      name="meses_recorrencia"
                      type="number"
                      min="2"
                      max="120"
                      placeholder="Ex: 12"
                      className="w-24 text-sm"
                    />
                    <Label htmlFor="meses_recorrencia" className="text-sm text-[#6B7280]">
                      meses
                    </Label>
                  </div>
                )}
              </div>

              {erro && <p className="text-sm text-[#DC2626]">{erro}</p>}

              <Button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1d4ed8]"
                disabled={carregando}
              >
                {carregando ? 'Salvando...' : 'Salvar transação'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
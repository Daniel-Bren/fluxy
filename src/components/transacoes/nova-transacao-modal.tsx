'use client'

import { useState } from 'react'
import { criarTransacao } from '@/app/dashboard/transacoes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

type Categoria = {
  id: string
  nome: string
}

type Props = {
  categorias: Categoria[]
}

export default function NovaTransacaoModal({ categorias }: Props) {
  const [aberto, setAberto] = useState(false)
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const hoje = new Date()
  const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
  const [data, setData] = useState(dataHoje)

  async function handleSubmit(formData: FormData) {
    setErro('')
    setCarregando(true)
    formData.set('tipo', tipo)

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

          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl z-10">
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
                <Label htmlFor="categoria_id">Categoria</Label>
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

              <div className="flex items-center gap-2">
                <input
                  id="recorrente"
                  name="recorrente"
                  type="checkbox"
                  className="rounded border-gray-300"
                />
                <Label htmlFor="recorrente">Transação recorrente</Label>
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
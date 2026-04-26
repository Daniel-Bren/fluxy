'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type Categoria = {
  id: string
  nome: string
}

type Props = {
  categorias: Categoria[]
}

export default function FiltrosTransacoes({ categorias }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tipoAtual = searchParams.get('tipo') ?? 'todos'
  const categoriaAtual = searchParams.get('categoria_id') ?? ''

  function atualizar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (valor === '' || valor === 'todos') {
      params.delete(chave)
    } else {
      params.set(chave, valor)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      {/* Filtro de tipo */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        {[
          { label: 'Todos', valor: 'todos' },
          { label: 'Entradas', valor: 'entrada' },
          { label: 'Saídas', valor: 'saida' },
        ].map((op) => (
          <button
            key={op.valor}
            onClick={() => atualizar('tipo', op.valor)}
            className={`px-3 py-1.5 transition-colors ${
              tipoAtual === op.valor
                ? 'bg-[#2563EB] text-white'
                : 'text-[#6B7280] hover:bg-gray-50'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Filtro de categoria */}
      <select
        value={categoriaAtual}
        onChange={(e) => atualizar('categoria_id', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#6B7280] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
      >
        <option value="">Todas as categorias</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nome}
          </option>
        ))}
      </select>
    </div>
  )
}
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Filtro de tipo */}
      <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-gray-200 text-sm">
        {[
          { label: 'Todos', valor: 'todos' },
          { label: 'Entradas', valor: 'entrada' },
          { label: 'Saídas', valor: 'saida' },
        ].map((op) => (
          <button
            key={op.valor}
            onClick={() => atualizar('tipo', op.valor)}
            className={`px-3 py-2 transition-colors sm:py-1.5 ${
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
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] sm:h-auto sm:w-auto sm:text-sm"
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

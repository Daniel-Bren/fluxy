'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Categoria = {
  id: string
  nome: string
}

type Props = {
  categorias: Categoria[]
}

const estados = [
  { label: 'Todas', valor: 'todas' },
  { label: 'Pendentes', valor: 'pendente' },
  { label: 'Pagas', valor: 'paga' },
  { label: 'Vencidas', valor: 'vencida' },
]

export default function FiltrosControle({ categorias }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const statusAtual = searchParams.get('status') ?? 'todas'
  const categoriaAtual = searchParams.get('categoria_id') ?? ''

  function atualizar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (!valor || valor === 'todas') {
      params.delete(chave)
    } else {
      params.set(chave, valor)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="grid grid-cols-4 overflow-hidden rounded-lg border border-gray-200 text-sm">
        {estados.map((estado) => (
          <button
            key={estado.valor}
            type="button"
            onClick={() => atualizar('status', estado.valor)}
            className={`min-w-0 px-2 py-2 transition-colors sm:px-3 sm:py-1.5 ${
              statusAtual === estado.valor
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {estado.label}
          </button>
        ))}
      </div>

      <select
        value={categoriaAtual}
        onChange={(event) => atualizar('categoria_id', event.target.value)}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 outline-none focus:ring-2 focus:ring-blue-600 sm:h-auto sm:w-auto sm:text-sm"
      >
        <option value="">Todas as categorias</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </select>
    </div>
  )
}

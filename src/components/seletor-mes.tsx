'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SeletorMes() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const mesParam = searchParams.get('mes')
  const ano = mesParam ? parseInt(mesParam.split('-')[0]) : new Date().getFullYear()
  const mes = mesParam ? parseInt(mesParam.split('-')[1]) - 1 : new Date().getMonth()
  const dataAtual = new Date(ano, mes, 1)

  const label = dataAtual.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  function navegar(direcao: 'anterior' | 'proximo') {
    const nova = new Date(ano, direcao === 'anterior' ? mes - 1 : mes + 1, 1)
    const param = `${nova.getFullYear()}-${String(nova.getMonth() + 1).padStart(2, '0')}`
    router.push(`${pathname}?mes=${param}`)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navegar('anterior')}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#6B7280]"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm font-medium text-[#111827] capitalize min-w-[140px] text-center">
        {label}
      </span>

      <button
        onClick={() => navegar('proximo')}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#6B7280]"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
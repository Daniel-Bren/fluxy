'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Users, User } from 'lucide-react'

export default function ToggleModo() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const modo = searchParams.get('modo') ?? 'pessoal'

  function alternar(novoModo: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modo', novoModo)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
      <button
        onClick={() => alternar('pessoal')}
        className={`flex items-center gap-2 px-4 py-2 transition-colors ${
          modo === 'pessoal'
            ? 'bg-[#2563EB] text-white'
            : 'text-[#6B7280] hover:bg-gray-50'
        }`}
      >
        <User size={15} />
        Pessoal
      </button>
      <button
        onClick={() => alternar('compartilhado')}
        className={`flex items-center gap-2 px-4 py-2 transition-colors ${
          modo === 'compartilhado'
            ? 'bg-[#2563EB] text-white'
            : 'text-[#6B7280] hover:bg-gray-50'
        }`}
      >
        <Users size={15} />
        Compartilhado
      </button>
    </div>
  )
}
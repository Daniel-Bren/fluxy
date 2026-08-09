'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { salvarModoPreferido, type ModoFinanceiro } from '@/app/dashboard/actions'
import { Users, User } from 'lucide-react'

export default function ToggleModo() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const modoUrl: ModoFinanceiro = searchParams.get('modo') === 'compartilhado'
    ? 'compartilhado'
    : 'pessoal'
  const [isPending, startTransition] = useTransition()

  function alternar(novoModo: ModoFinanceiro) {
    if (novoModo === modoUrl) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('modo', novoModo)

    startTransition(async () => {
      const resultado = await salvarModoPreferido(novoModo)

      if (resultado?.erro) return

      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="grid w-full grid-cols-2 overflow-hidden rounded-lg border border-gray-200 text-sm sm:w-auto">
      <button
        type="button"
        onClick={() => alternar('pessoal')}
        disabled={isPending}
        className={`flex min-w-0 items-center justify-center gap-2 px-3 py-2 transition-colors sm:px-4 ${
          modoUrl === 'pessoal'
            ? 'bg-[#2563EB] text-white'
            : 'text-[#6B7280] hover:bg-gray-50'
        }`}
      >
        <User size={15} />
        Pessoal
      </button>
      <button
        type="button"
        onClick={() => alternar('compartilhado')}
        disabled={isPending}
        className={`flex min-w-0 items-center justify-center gap-2 px-3 py-2 transition-colors sm:px-4 ${
          modoUrl === 'compartilhado'
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

'use client'

import { useState } from 'react'
import { gerarConvite } from './actions'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

type Props = {
  grupoId: string
}

export default function GrupoClient({ grupoId }: Props) {
  const [link, setLink] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleGerarConvite() {
    setCarregando(true)
    const resultado = await gerarConvite(grupoId)

    if (resultado?.token) {
      const url = `${window.location.origin}/convite/${resultado.token}`
      setLink(url)
    }
    setCarregando(false)
  }

  async function handleCopiar() {
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGerarConvite}
        disabled={carregando}
        className="bg-[#2563EB] hover:bg-[#1d4ed8]"
      >
        {carregando ? 'Gerando...' : 'Gerar link de convite'}
      </Button>

      {link && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#6B7280] truncate">
            {link}
          </div>
          <button
            onClick={handleCopiar}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {copiado ? (
              <Check size={16} className="text-[#16A34A]" />
            ) : (
              <Copy size={16} className="text-[#6B7280]" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
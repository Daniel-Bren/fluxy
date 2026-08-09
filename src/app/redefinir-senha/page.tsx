'use client'

import { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [verificando, setVerificando] = useState(true)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setErro('Este link expirou ou é inválido. Solicite uma nova recuperação.')
      }
      setVerificando(false)
    })
  }, [])

  async function redefinirSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })

    if (error) {
      setErro('Não foi possível alterar a senha. Solicite um novo link e tente novamente.')
      setCarregando(false)
      return
    }

    await supabase.auth.signOut()
    router.replace('/login?senha=alterada')
    router.refresh()
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#080C14] p-4 sm:p-6">
      <section className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <Image src="/android-chrome-192x192.png" alt="Fluxy" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold text-white">Fluxy</span>
        </div>

        <h1 className="text-2xl font-bold text-white">Criar nova senha</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">
          Escolha uma senha nova com pelo menos 6 caracteres.
        </p>

        {verificando ? (
          <p className="mt-7 text-sm text-white/50">Validando link...</p>
        ) : (
          <form onSubmit={redefinirSenha} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="senha" className="text-sm font-medium text-white/60">Nova senha</label>
              <input
                id="senha"
                type="password"
                autoComplete="new-password"
                required
                disabled={!!erro && !senha}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500/50 disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirmacao" className="text-sm font-medium text-white/60">Confirmar nova senha</label>
              <input
                id="confirmacao"
                type="password"
                autoComplete="new-password"
                required
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-500/50"
              />
            </div>

            {erro && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando || (!!erro && !senha)}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {carregando ? 'Alterando senha...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        {!verificando && erro && !senha && (
          <Link href="/recuperar-senha" className="mt-6 inline-block text-sm font-medium text-blue-400 hover:text-blue-300">
            Solicitar novo link
          </Link>
        )}
      </section>
    </main>
  )
}

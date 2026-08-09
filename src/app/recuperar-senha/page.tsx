'use client'

import { FormEvent, Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function RecuperarSenhaForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState(
    searchParams.get('erro') === 'link-invalido'
      ? 'Este link expirou ou já foi utilizado. Solicite um novo e-mail.'
      : ''
  )
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function enviarRecuperacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setCarregando(true)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/redefinir-senha`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })

    setCarregando(false)

    if (error) {
      setErro('Não foi possível enviar o e-mail agora. Tente novamente.')
      return
    }

    setEnviado(true)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#080C14] p-4 sm:p-6">
      <section className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <Image src="/android-chrome-192x192.png" alt="Fluxy" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold text-white">Fluxy</span>
        </div>

        {enviado ? (
          <div>
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
              <Mail size={21} />
            </div>
            <h1 className="text-2xl font-bold text-white">Verifique seu e-mail</h1>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Enviamos as instruções para <strong className="font-medium text-white/80">{email}</strong>.
              O link permite cadastrar uma nova senha.
            </p>
            <button
              type="button"
              onClick={() => setEnviado(false)}
              className="mt-6 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white">Recuperar senha</h1>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Informe o e-mail da sua conta para receber um link de recuperação.
            </p>

            <form onSubmit={enviarRecuperacao} className="mt-7 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-white/60">E-mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-blue-500/50"
                />
              </div>

              {erro && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          </>
        )}

        <Link href="/login" className="mt-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft size={16} />
          Voltar para o login
        </Link>
      </section>
    </main>
  )
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense>
      <RecuperarSenhaForm />
    </Suspense>
  )
}

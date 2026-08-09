'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const convite = searchParams.get('convite')
  const senhaAlterada = searchParams.get('senha') === 'alterada'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin() {
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('Email ou senha incorretos.')
      setCarregando(false)
      return
    }

    if (convite) {
      router.push(`/convite/${convite}`)
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <main className="flex min-h-dvh bg-[#080C14]">
      {/* Lado esquerdo — visual */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden">
        {/* Fundo com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#080C14] to-[#080C14]" />

        {/* Glow azul */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2563EB]/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#06B6D4]/10 rounded-full blur-[80px]" />

        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Image src="/android-chrome-192x192.png" alt="Fluxy" width={56} height={56} className="h-14 w-14 rounded-2xl shadow-2xl shadow-blue-500/30" />
            <span className="text-white text-4xl font-bold tracking-tight">Fluxy</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Controle financeiro<br />
            <span className="bg-gradient-to-r from-[#60A5FA] to-[#06B6D4] bg-clip-text text-transparent">
              simples e visual
            </span>
          </h2>

          {/* Cards flutuantes decorativos */}
          <div className="mt-16 flex flex-col gap-3 items-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-72 flex items-center justify-between backdrop-blur-sm">
              <div className="text-left">
                <p className="text-white/40 text-xs">Saldo do mês</p>
                <p className="text-white font-semibold text-lg">R$ 2.500,00</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 text-lg">↑</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-64 flex items-center justify-between backdrop-blur-sm">
              <div className="text-left">
                <p className="text-white/40 text-xs">Total recebido</p>
                <p className="text-green-400 font-semibold">R$ 4.000,00</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 text-sm">↓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-8 sm:px-8 lg:w-[480px]">
        {/* Borda sutil à esquerda */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Image src="/android-chrome-192x192.png" alt="Fluxy" width={32} height={32} className="h-8 w-8 rounded-lg" />
            <span className="text-white text-xl font-bold">Fluxy</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">
              {convite ? 'Entre para acessar o grupo' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-white/40 text-sm">
              {convite ? 'Faça login e entre automaticamente no grupo.' : 'Entre na sua conta para continuar'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-white/60 text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-white/60">Senha</label>
                <Link
                  href="/recuperar-senha"
                  className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            {erro && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            {senhaAlterada && !erro && (
              <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                Senha alterada com sucesso. Entre novamente.
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={carregando}
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="text-center text-white/30 text-sm pt-2">
              Não tem conta?{' '}
              <Link
                href={convite ? `/cadastro?convite=${convite}` : '/cadastro'}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

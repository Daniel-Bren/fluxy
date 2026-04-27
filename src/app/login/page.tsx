'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const convite = searchParams.get('convite')

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
    <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-[#111827]">
            {convite ? 'Entre para acessar o grupo' : 'Entrar no Fluxy'}
          </CardTitle>
          <CardDescription className="text-[#6B7280]">
            {convite
              ? 'Faça login e entre automaticamente no grupo compartilhado.'
              : 'Digite seu email e senha para continuar'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && <p className="text-sm text-[#DC2626]">{erro}</p>}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full bg-[#2563EB] hover:bg-[#1d4ed8]"
            onClick={handleLogin}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>

          <p className="text-sm text-[#6B7280]">
            Não tem conta?{' '}
            <Link href={convite ? `/cadastro?convite=${convite}` : '/cadastro'} className="text-[#2563EB] hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
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
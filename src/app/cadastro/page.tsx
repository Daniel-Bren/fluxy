'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { cadastrarUsuario } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'

function CadastroForm() {
  const searchParams = useSearchParams()
  const convite = searchParams.get('convite')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleCadastro() {
    setErro('')

    if (nome.trim().length < 2) {
      setErro('Digite seu nome completo.')
      return
    }

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setCarregando(true)

    const resultado = await cadastrarUsuario({
      nome,
      email,
      senha,
      convite,
    })

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-[#111827]">
            {convite ? 'Criar conta para entrar no grupo' : 'Criar conta no Fluxy'}
          </CardTitle>
          <CardDescription className="text-[#6B7280]">
            {convite
              ? 'Crie sua conta e entre automaticamente no grupo compartilhado.'
              : 'Comece a organizar suas finanças agora'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && <p className="text-sm text-[#DC2626]">{erro}</p>}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full bg-[#2563EB] hover:bg-[#1d4ed8]"
            onClick={handleCadastro}
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </Button>

          <p className="text-sm text-[#6B7280]">
            Já tem conta?{' '}
            <Link href={convite ? `/login?convite=${convite}` : '/login'} className="text-[#2563EB] hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroForm />
    </Suspense>
  )
}
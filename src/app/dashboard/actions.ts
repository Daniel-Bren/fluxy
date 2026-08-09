'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type ModoFinanceiro = 'pessoal' | 'compartilhado'

export async function salvarModoPreferido(modo: ModoFinanceiro) {
  if (modo !== 'pessoal' && modo !== 'compartilhado') {
    return { erro: 'Modo inválido.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { erro: 'Não autenticado' }

  const cookieStore = await cookies()
  cookieStore.set('fluxy_modo', modo, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return { sucesso: true as const }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

import { createClient } from '@/lib/supabase/server'
import { criarGrupo, sairDoGrupo, removerMembro } from './actions'
import { Users, LogOut, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GrupoClient from './grupo-client'

type Grupo = {
  id: string
  nome: string
  dono_id?: string
}

type MembroGrupo = {
  user_id: string
  nome: string | null
}

export default async function GrupoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: grupoProrio } = await supabase
    .from('grupos')
    .select('id, nome')
    .eq('dono_id', user!.id)
    .single()

  const { data: membroGrupo } = await supabase
    .from('membros_grupo')
    .select('grupo_id, grupos(id, nome, dono_id)')
    .eq('user_id', user!.id)
    .single()

  const grupoComoMembro = membroGrupo?.grupos as unknown as Grupo | null
  const grupo = grupoProrio ?? grupoComoMembro
  const isDono = !!grupoProrio

  const { data: membros } = grupo
    ? await supabase.rpc('get_membros_grupo', { p_grupo_id: grupo.id })
    : { data: null }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Grupo</h1>
        <p className="text-[#6B7280] mt-1">Gerencie seu grupo compartilhado.</p>
      </div>

      {!grupo ? (
        <div className="w-full max-w-md rounded-lg border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users size={20} className="text-[#2563EB]" />
            </div>
            <div>
              <p className="font-semibold text-[#111827]">Criar um grupo</p>
              <p className="text-sm text-[#6B7280]">Convide alguém para compartilhar o dashboard</p>
            </div>
          </div>

          <form action={async (formData) => {
            'use server'
            await criarGrupo(formData.get('nome') as string)
          }} className="space-y-4">
            <Input
              name="nome"
              placeholder="Nome do grupo. Ex: Família Silva"
              required
            />
            <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1d4ed8]">
              Criar grupo
            </Button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-lg space-y-4 sm:space-y-6">
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
              <div>
                <p className="font-semibold text-[#111827] text-lg">{grupo.nome}</p>
                <p className="text-sm text-[#6B7280]">{membros?.length ?? 0} membros</p>
              </div>
              {!isDono && (
                <form action={async () => {
                  'use server'
                  await sairDoGrupo(grupo.id)
                }}>
                  <Button variant="outline" type="submit" className="text-[#DC2626] border-red-200 hover:bg-red-50">
                    <LogOut size={16} className="mr-2" />
                    Sair do grupo
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-2">
              {(membros as unknown as MembroGrupo[])?.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between gap-3 border-b border-gray-50 py-2 last:border-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-[#2563EB]">
                      {m.nome?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="truncate text-sm text-[#111827]">{m.nome ?? 'Usuário'}</span>
                    {isDono && m.user_id === user!.id && (
                      <span className="text-xs bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded-full">dono</span>
                    )}
                    {!isDono && m.user_id === grupoComoMembro?.dono_id && (
                      <span className="text-xs bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded-full">dono</span>
                    )}
                  </div>
                  {isDono && m.user_id !== user!.id && (
                    <form action={async () => {
                      'use server'
                      await removerMembro(grupo.id, m.user_id)
                    }}>
                      <button type="submit" className="text-[#6B7280] hover:text-[#DC2626] transition-colors">
                        <UserMinus size={16} />
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isDono && (
            <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <p className="font-semibold text-[#111827] mb-1">Convidar pessoa</p>
              <p className="text-sm text-[#6B7280] mb-4">
                Gere um link de convite e compartilhe com quem quiser adicionar ao grupo.
              </p>
              <GrupoClient grupoId={grupo.id} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import NovaTransacaoModal from '@/components/transacoes/nova-transacao-modal'
import ListaTransacoes from '@/components/transacoes/lista-transacoes'

export default async function TransacoesPage() {
  const supabase = await createClient()

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nome')
    .order('nome')

  const { data: transacoes } = await supabase
    .from('transacoes')
    .select(`
      id,
      tipo,
      valor,
      data,
      descricao,
      categorias (
        nome
      )
    `)
    .order('data', { ascending: false })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Transações</h1>
          <p className="text-[#6B7280] mt-1">
            Gerencie suas entradas e saídas
          </p>
        </div>

        <NovaTransacaoModal categorias={categorias ?? []} />
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <ListaTransacoes transacoes={transacoes ?? []} />
      </div>
    </div>
  )
}
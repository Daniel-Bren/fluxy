import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: categorias, error } = await supabase
    .from('categorias')
    .select('*')
    .is('user_id', null)

  if (error) {
    return <p>Erro ao conectar: {error.message}</p>
  }

  return (
    <main>
      <h1>Fluxy — conexão ok</h1>
      <pre>{JSON.stringify(categorias, null, 2)}</pre>
    </main>
  )
}
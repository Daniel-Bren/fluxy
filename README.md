# Fluxy

SaaS de controle financeiro pessoal — simples, visual e moderno.

O projeto passou a ser mantido por meio de orquestração por IA, com decisões, implementação e validação registradas em branches e pull requests.

Fluxy nasceu como projeto de estudo prático de desenvolvimento fullstack e banco de dados, mas com ambição de produto real: uma plataforma que ajuda pessoas a entenderem seu fluxo financeiro de forma intuitiva, sem jargões contábeis.

---

## Stack

- **Frontend/Backend** — Next.js 14 (App Router)
- **Estilização** — Tailwind CSS + shadcn/ui
- **Gráficos** — Recharts
- **Banco de dados + Auth** — Supabase (PostgreSQL + RLS)
- **Deploy** — Vercel via GitHub

---

## Versões planejadas

| Versão | Nome | Foco |
|--------|------|-------|
| V1 | MVP | Cadastro de transações, categorias fixas, resumo mensal |
| V2 | Organização | Categorias customizadas, recorrências, dashboard com gráficos |
| V3 | Grupo de usuários |

---

## Banco de dados (Supabase)

Tabelas configuradas com Row Level Security ativo:

- `profiles` — dados do usuário (vinculado ao `auth.users`)
- `categorias` — categorias globais e pessoais por usuário
- `contas_a_pagar` — obrigações mensais, recorrências e estado de pagamento
- `transacoes` — movimentações financeiras realizadas, incluindo saídas geradas pelo pagamento de contas

---

## Rodando localmente

```bash
# Instalar dependências
npm install

# Rodar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

As credenciais estão disponíveis em **Settings → Data API** no painel do Supabase.

---

## Status do projeto

Em desenvolvimento ativo — V1 (MVP) em construção.

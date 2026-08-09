create table if not exists public.contas_a_pagar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete cascade,
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  descricao text not null,
  valor numeric(12, 2) not null check (valor > 0),
  vencimento date not null,
  status text not null default 'pendente' check (status in ('pendente', 'paga')),
  paga_em date,
  recorrente boolean not null default false,
  recorrencia_id uuid,
  recorrencia_origem boolean not null default false,
  created_at timestamptz not null default now(),
  constraint contas_a_pagar_status_pagamento_check check (
    (status = 'pendente' and paga_em is null)
    or (status = 'paga' and paga_em is not null)
  )
);

alter table public.transacoes
  add column if not exists conta_a_pagar_id uuid unique references public.contas_a_pagar(id) on delete restrict;

create index if not exists contas_a_pagar_user_vencimento_idx
  on public.contas_a_pagar (user_id, vencimento);

create index if not exists contas_a_pagar_grupo_vencimento_idx
  on public.contas_a_pagar (grupo_id, vencimento)
  where grupo_id is not null;

create index if not exists contas_a_pagar_status_vencimento_idx
  on public.contas_a_pagar (status, vencimento);

create index if not exists contas_a_pagar_recorrencia_idx
  on public.contas_a_pagar (recorrencia_id)
  where recorrencia_id is not null;

alter table public.contas_a_pagar enable row level security;

drop policy if exists "Contas visiveis pelo usuario ou grupo" on public.contas_a_pagar;
create policy "Contas visiveis pelo usuario ou grupo"
on public.contas_a_pagar
for select
to authenticated
using (
  (grupo_id is null and user_id = auth.uid())
  or (
    grupo_id is not null
    and exists (
      select 1
      from public.membros_grupo membro
      where membro.grupo_id = contas_a_pagar.grupo_id
        and membro.user_id = auth.uid()
    )
  )
);

drop policy if exists "Contas criadas pelo usuario" on public.contas_a_pagar;
create policy "Contas criadas pelo usuario"
on public.contas_a_pagar
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    grupo_id is null
    or exists (
      select 1
      from public.membros_grupo membro
      where membro.grupo_id = contas_a_pagar.grupo_id
        and membro.user_id = auth.uid()
    )
  )
);

drop policy if exists "Contas atualizadas pelo usuario ou grupo" on public.contas_a_pagar;
create policy "Contas atualizadas pelo usuario ou grupo"
on public.contas_a_pagar
for update
to authenticated
using (
  (grupo_id is null and user_id = auth.uid())
  or (
    grupo_id is not null
    and exists (
      select 1
      from public.membros_grupo membro
      where membro.grupo_id = contas_a_pagar.grupo_id
        and membro.user_id = auth.uid()
    )
  )
)
with check (
  (grupo_id is null and user_id = auth.uid())
  or (
    grupo_id is not null
    and exists (
      select 1
      from public.membros_grupo membro
      where membro.grupo_id = contas_a_pagar.grupo_id
        and membro.user_id = auth.uid()
    )
  )
);

drop policy if exists "Contas excluidas pelo usuario ou grupo" on public.contas_a_pagar;
create policy "Contas excluidas pelo usuario ou grupo"
on public.contas_a_pagar
for delete
to authenticated
using (
  (grupo_id is null and user_id = auth.uid())
  or (
    grupo_id is not null
    and exists (
      select 1
      from public.membros_grupo membro
      where membro.grupo_id = contas_a_pagar.grupo_id
        and membro.user_id = auth.uid()
    )
  )
);

grant select, insert, update, delete on public.contas_a_pagar to authenticated;

create or replace function public.marcar_conta_como_paga(
  p_conta_id uuid,
  p_data_pagamento date default current_date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conta public.contas_a_pagar%rowtype;
  v_transacao_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Nao autenticado';
  end if;

  select conta.*
  into v_conta
  from public.contas_a_pagar conta
  where conta.id = p_conta_id
    and (
      (conta.grupo_id is null and conta.user_id = v_user_id)
      or (
        conta.grupo_id is not null
        and exists (
          select 1
          from public.membros_grupo membro
          where membro.grupo_id = conta.grupo_id
            and membro.user_id = v_user_id
        )
      )
    )
  for update;

  if not found then
    raise exception 'Conta nao encontrada';
  end if;

  if v_conta.status = 'paga' then
    select transacao.id
    into v_transacao_id
    from public.transacoes transacao
    where transacao.conta_a_pagar_id = v_conta.id;

    return v_transacao_id;
  end if;

  insert into public.transacoes (
    user_id,
    tipo,
    valor,
    data,
    categoria_id,
    descricao,
    recorrente,
    grupo_id,
    conta_a_pagar_id
  )
  values (
    v_user_id,
    'saida',
    v_conta.valor,
    p_data_pagamento,
    v_conta.categoria_id,
    v_conta.descricao,
    false,
    v_conta.grupo_id,
    v_conta.id
  )
  returning id into v_transacao_id;

  update public.contas_a_pagar
  set status = 'paga', paga_em = p_data_pagamento
  where id = v_conta.id;

  return v_transacao_id;
end;
$$;

create or replace function public.desfazer_pagamento_conta(p_conta_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conta public.contas_a_pagar%rowtype;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Nao autenticado';
  end if;

  select conta.*
  into v_conta
  from public.contas_a_pagar conta
  where conta.id = p_conta_id
    and (
      (conta.grupo_id is null and conta.user_id = v_user_id)
      or (
        conta.grupo_id is not null
        and exists (
          select 1
          from public.membros_grupo membro
          where membro.grupo_id = conta.grupo_id
            and membro.user_id = v_user_id
        )
      )
    )
  for update;

  if not found then
    raise exception 'Conta nao encontrada';
  end if;

  if v_conta.status = 'pendente' then
    return;
  end if;

  delete from public.transacoes
  where conta_a_pagar_id = v_conta.id;

  update public.contas_a_pagar
  set status = 'pendente', paga_em = null
  where id = v_conta.id;
end;
$$;

revoke all on function public.marcar_conta_como_paga(uuid, date) from public;
revoke all on function public.desfazer_pagamento_conta(uuid) from public;
grant execute on function public.marcar_conta_como_paga(uuid, date) to authenticated;
grant execute on function public.desfazer_pagamento_conta(uuid) to authenticated;

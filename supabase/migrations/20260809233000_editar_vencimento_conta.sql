create or replace function public.editar_conta_a_pagar(
  p_conta_id uuid,
  p_categoria_id uuid,
  p_descricao text,
  p_valor numeric,
  p_vencimento date
)
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

  if p_valor is null or p_valor <= 0 then
    raise exception 'O valor deve ser maior que zero';
  end if;

  if p_vencimento is null then
    raise exception 'O vencimento e obrigatorio';
  end if;

  if nullif(btrim(p_descricao), '') is null then
    raise exception 'A descricao e obrigatoria';
  end if;

  if not exists (
    select 1
    from public.categorias categoria
    where categoria.id = p_categoria_id
  ) then
    raise exception 'Categoria nao encontrada';
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

  update public.contas_a_pagar
  set
    categoria_id = p_categoria_id,
    descricao = btrim(p_descricao),
    valor = p_valor,
    vencimento = p_vencimento
  where id = v_conta.id;

  update public.transacoes
  set
    categoria_id = p_categoria_id,
    descricao = btrim(p_descricao),
    valor = p_valor
  where conta_a_pagar_id = v_conta.id;
end;
$$;

revoke all on function public.editar_conta_a_pagar(uuid, uuid, text, numeric, date) from public;
grant execute on function public.editar_conta_a_pagar(uuid, uuid, text, numeric, date) to authenticated;

drop function if exists public.editar_conta_a_pagar(uuid, uuid, text, numeric);

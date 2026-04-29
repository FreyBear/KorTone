-- KorTone RLS policies
-- Run after schema.sql

alter table public.songs enable row level security;
alter table public.user_roles enable row level security;

-- Helper functions  
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  );
$$;

create or replace function public.can_edit_songs()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'editor')
  );
$$;

create or replace function public.get_all_users_with_roles()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  role text
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Kun admin kan hente brukerliste';
  end if;

  return query
  select
    u.id as user_id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    ur.role::text
  from auth.users u
  left join public.user_roles ur on u.id = ur.user_id
  order by u.created_at desc;
end;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_edit_songs() to authenticated;
grant execute on function public.get_all_users_with_roles() to authenticated;

-- Songs policies (everyone can read, editor/admin can write)
drop policy if exists "songs_select_all" on public.songs;
create policy "songs_select_all"
on public.songs
for select
to authenticated, anon
using (true);

drop policy if exists "songs_insert_admin" on public.songs;
drop policy if exists "songs_insert_editors" on public.songs;
create policy "songs_insert_editors"
on public.songs
for insert
to authenticated
with check (public.can_edit_songs());

drop policy if exists "songs_update_admin" on public.songs;
drop policy if exists "songs_update_editors" on public.songs;
create policy "songs_update_editors"
on public.songs
for update
to authenticated
using (public.can_edit_songs())
with check (public.can_edit_songs());

drop policy if exists "songs_delete_admin" on public.songs;
create policy "songs_delete_admin"
on public.songs
for delete
to authenticated
using (public.is_admin());

-- user_roles policies (only admin can manage)
drop policy if exists "user_roles_select_admin" on public.user_roles;
create policy "user_roles_select_admin"
on public.user_roles
for select
to authenticated
using (public.is_admin());

drop policy if exists "user_roles_insert_admin" on public.user_roles;
create policy "user_roles_insert_admin"
on public.user_roles
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "user_roles_update_admin" on public.user_roles;
create policy "user_roles_update_admin"
on public.user_roles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "user_roles_delete_admin" on public.user_roles;
create policy "user_roles_delete_admin"
on public.user_roles
for delete
to authenticated
using (public.is_admin());

-- user_roles policies
-- Read own role
 drop policy if exists "roles_select_own" on public.user_roles;
create policy "roles_select_own"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

-- Optional stricter setup:
-- Do not allow direct writes from anon/authenticated clients.
 drop policy if exists "roles_no_client_insert" on public.user_roles;
create policy "roles_no_client_insert"
on public.user_roles
for insert
to authenticated
with check (false);

 drop policy if exists "roles_no_client_update" on public.user_roles;
create policy "roles_no_client_update"
on public.user_roles
for update
to authenticated
using (false)
with check (false);

 drop policy if exists "roles_no_client_delete" on public.user_roles;
create policy "roles_no_client_delete"
on public.user_roles
for delete
to authenticated
using (false);

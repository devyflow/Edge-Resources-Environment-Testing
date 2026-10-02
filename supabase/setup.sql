-- Devyanshu portfolio CMS production security setup.
-- Create the Auth user for idevyansh.agr@gmail.com before running this file.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.portfolio_admins (
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text primary key,
  created_at timestamptz not null default now()
);

-- Migrate the earlier email-only allowlist and bind it to the immutable Auth user ID.
alter table public.portfolio_admins
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

insert into public.portfolio_admins (user_id, email)
select id, email
from auth.users
where lower(email) = lower('idevyansh.agr@gmail.com')
on conflict (email) do update set user_id = excluded.user_id;

do $$
begin
  if exists (select 1 from public.portfolio_admins where user_id is null)
    or not exists (select 1 from public.portfolio_admins where user_id is not null) then
    raise exception 'Create the configured Supabase Auth admin user before running setup.sql.';
  end if;
end
$$;

alter table public.portfolio_admins alter column user_id set not null;
create unique index if not exists portfolio_admins_user_id_key on public.portfolio_admins (user_id);

create table if not exists public.portfolio_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_content_audit (
  id bigint generated always as identity primary key,
  content_id text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid references auth.users(id) on delete set null,
  before_content jsonb,
  after_content jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_portfolio_content_updated_at on public.portfolio_content;
create trigger set_portfolio_content_updated_at
before update on public.portfolio_content
for each row
execute function public.set_updated_at();

alter table public.portfolio_admins enable row level security;
alter table public.portfolio_content enable row level security;
alter table public.portfolio_content_audit enable row level security;

drop policy if exists "portfolio_admins_admin_read" on public.portfolio_admins;
drop policy if exists "portfolio_content_public_read" on public.portfolio_content;
drop policy if exists "portfolio_content_admin_insert" on public.portfolio_content;
drop policy if exists "portfolio_content_admin_update" on public.portfolio_content;
drop policy if exists "portfolio_content_audit_admin_read" on public.portfolio_content_audit;
drop policy if exists "portfolio_assets_public_read" on storage.objects;
drop policy if exists "portfolio_assets_admin_insert" on storage.objects;
drop policy if exists "portfolio_assets_admin_update" on storage.objects;
drop policy if exists "portfolio_assets_admin_delete" on storage.objects;

drop function if exists public.is_portfolio_admin();

create or replace function private.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
    and exists (
      select 1
      from public.portfolio_admins as administrator
      where administrator.user_id = (select auth.uid())
    );
$$;

revoke all on function private.is_portfolio_admin() from public, anon;
grant execute on function private.is_portfolio_admin() to authenticated;

create policy "portfolio_admins_admin_read"
on public.portfolio_admins
for select
to authenticated
using ((select private.is_portfolio_admin()));

create policy "portfolio_content_public_read"
on public.portfolio_content
for select
to anon, authenticated
using (id = 'main');

create policy "portfolio_content_admin_insert"
on public.portfolio_content
for insert
to authenticated
with check (id = 'main' and (select private.is_portfolio_admin()));

create policy "portfolio_content_admin_update"
on public.portfolio_content
for update
to authenticated
using (id = 'main' and (select private.is_portfolio_admin()))
with check (id = 'main' and (select private.is_portfolio_admin()));

create policy "portfolio_content_audit_admin_read"
on public.portfolio_content_audit
for select
to authenticated
using ((select private.is_portfolio_admin()));

create or replace function private.audit_portfolio_content()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.portfolio_content_audit (
    content_id,
    action,
    actor_id,
    before_content,
    after_content
  ) values (
    coalesce(new.id, old.id),
    tg_op,
    (select auth.uid()),
    case when tg_op in ('UPDATE', 'DELETE') then old.content else null end,
    case when tg_op in ('INSERT', 'UPDATE') then new.content else null end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.audit_portfolio_content() from public, anon, authenticated;

drop trigger if exists audit_portfolio_content on public.portfolio_content;
create trigger audit_portfolio_content
after insert or update or delete on public.portfolio_content
for each row
execute function private.audit_portfolio_content();

insert into public.portfolio_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio_assets_public_read" on storage.objects;
create policy "portfolio_assets_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio-assets');

drop policy if exists "portfolio_assets_admin_insert" on storage.objects;
create policy "portfolio_assets_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portfolio-assets' and (select private.is_portfolio_admin()));

drop policy if exists "portfolio_assets_admin_update" on storage.objects;
create policy "portfolio_assets_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'portfolio-assets' and (select private.is_portfolio_admin()))
with check (bucket_id = 'portfolio-assets' and (select private.is_portfolio_admin()));

drop policy if exists "portfolio_assets_admin_delete" on storage.objects;
create policy "portfolio_assets_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portfolio-assets' and (select private.is_portfolio_admin()));

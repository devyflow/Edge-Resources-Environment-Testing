-- Devyanshu portfolio CMS Supabase setup
-- Run this once in Supabase SQL Editor.
-- Change the email below if your admin login email is different.

create table if not exists public.portfolio_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.portfolio_admins (email)
values ('idevyansh.agr@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolio_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table if not exists public.portfolio_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
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

drop policy if exists "portfolio_admins_admin_read" on public.portfolio_admins;
create policy "portfolio_admins_admin_read"
on public.portfolio_admins
for select
to authenticated
using (public.is_portfolio_admin());

drop policy if exists "portfolio_content_public_read" on public.portfolio_content;
create policy "portfolio_content_public_read"
on public.portfolio_content
for select
to anon, authenticated
using (id = 'main');

drop policy if exists "portfolio_content_admin_insert" on public.portfolio_content;
create policy "portfolio_content_admin_insert"
on public.portfolio_content
for insert
to authenticated
with check (id = 'main' and public.is_portfolio_admin());

drop policy if exists "portfolio_content_admin_update" on public.portfolio_content;
create policy "portfolio_content_admin_update"
on public.portfolio_content
for update
to authenticated
using (id = 'main' and public.is_portfolio_admin())
with check (id = 'main' and public.is_portfolio_admin());

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
with check (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());

drop policy if exists "portfolio_assets_admin_update" on storage.objects;
create policy "portfolio_assets_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'portfolio-assets' and public.is_portfolio_admin())
with check (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());

drop policy if exists "portfolio_assets_admin_delete" on storage.objects;
create policy "portfolio_assets_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());

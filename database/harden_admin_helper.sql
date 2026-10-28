-- Harden production/QA databases that already ran mrf_schema.sql.
-- Run once per MRF Supabase project in SQL Editor.
begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.mrf_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.mrf_admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.mrf_is_admin() from public, anon, authenticated;
grant execute on function private.mrf_is_admin() to authenticated;

alter policy "MRF admins can read all products" on public.mrf_products
  using ((select private.mrf_is_admin()));
alter policy "MRF admins can add products" on public.mrf_products
  with check ((select private.mrf_is_admin()));
alter policy "MRF admins can update products" on public.mrf_products
  using ((select private.mrf_is_admin()))
  with check ((select private.mrf_is_admin()));
alter policy "MRF admins can delete products" on public.mrf_products
  using ((select private.mrf_is_admin()));
alter policy "MRF admins can update catalog settings" on public.mrf_catalog_settings
  using ((select private.mrf_is_admin()))
  with check ((select private.mrf_is_admin()));
alter policy "MRF admins can upload product images" on storage.objects
  with check (bucket_id = 'mrf-products' and (select private.mrf_is_admin()));
alter policy "MRF admins can update product images" on storage.objects
  using (bucket_id = 'mrf-products' and (select private.mrf_is_admin()))
  with check (bucket_id = 'mrf-products' and (select private.mrf_is_admin()));
alter policy "MRF admins can delete product images" on storage.objects
  using (bucket_id = 'mrf-products' and (select private.mrf_is_admin()));

drop function if exists public.mrf_is_admin();

commit;

-- MRF catalog: public read access, admin-only changes.
-- Run this file in Supabase Dashboard > SQL Editor.

create table if not exists public.mrf_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.mrf_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  city text not null default '',
  color text not null default '',
  size text not null default '',
  availability text not null default 'made_to_order'
    check (availability in ('available', 'made_to_order')),
  is_published boolean not null default true,
  image_path text,
  stock_quantity integer not null default 1 check (stock_quantity >= 0),
  product_category text not null default 'cap' check (product_category in ('cap', 'accessory')),
  visor_style text check (visor_style in ('flat', 'curved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mrf_products_public_order_idx
  on public.mrf_products (is_published, created_at desc);

create table if not exists public.mrf_catalog_settings (
  id boolean primary key default true check (id = true),
  show_available boolean not null default true,
  show_made_to_order boolean not null default true,
  maintenance_mode boolean not null default false,
  message_no_available text not null default 'Por ahora no hay gorras disponibles. Puedes consultar por WhatsApp para pedir una por encargo.',
  message_no_made_to_order text not null default 'Por ahora no estamos recibiendo pedidos por encargo. Consulta las gorras disponibles.',
  updated_at timestamptz not null default now()
);

insert into public.mrf_catalog_settings (id) values (true)
on conflict (id) do nothing;

-- Keep SECURITY DEFINER helpers out of the API-exposed public schema.
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

alter table public.mrf_admin_users enable row level security;
alter table public.mrf_products enable row level security;
alter table public.mrf_catalog_settings enable row level security;

drop policy if exists "MRF admin can read own access" on public.mrf_admin_users;
create policy "MRF admin can read own access"
  on public.mrf_admin_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Public can read published MRF products" on public.mrf_products;
create policy "Public can read published MRF products"
  on public.mrf_products for select to anon, authenticated
  using (is_published = true);

drop policy if exists "MRF admins can read all products" on public.mrf_products;
create policy "MRF admins can read all products"
  on public.mrf_products for select to authenticated
  using ((select private.mrf_is_admin()));

drop policy if exists "MRF admins can add products" on public.mrf_products;
create policy "MRF admins can add products"
  on public.mrf_products for insert to authenticated
  with check ((select private.mrf_is_admin()));

drop policy if exists "MRF admins can update products" on public.mrf_products;
create policy "MRF admins can update products"
  on public.mrf_products for update to authenticated
  using ((select private.mrf_is_admin()))
  with check ((select private.mrf_is_admin()));

drop policy if exists "MRF admins can delete products" on public.mrf_products;
create policy "MRF admins can delete products"
  on public.mrf_products for delete to authenticated
  using ((select private.mrf_is_admin()));

drop policy if exists "Public can read MRF catalog settings" on public.mrf_catalog_settings;
create policy "Public can read MRF catalog settings"
  on public.mrf_catalog_settings for select to anon, authenticated
  using (true);

drop policy if exists "MRF admins can update catalog settings" on public.mrf_catalog_settings;
create policy "MRF admins can update catalog settings"
  on public.mrf_catalog_settings for update to authenticated
  using ((select private.mrf_is_admin()))
  with check ((select private.mrf_is_admin()));

-- Remove the old public RPC helper once the policies no longer depend on it.
drop function if exists public.mrf_is_admin();

-- Remove broad default/API grants, then restore only what each role needs.
revoke all on public.mrf_admin_users, public.mrf_products, public.mrf_catalog_settings
  from anon, authenticated;

grant select on public.mrf_admin_users to authenticated;
grant select on public.mrf_products to anon, authenticated;
grant insert, update, delete on public.mrf_products to authenticated;

create or replace function public.mrf_decrement_product_stock(p_product_id uuid)
returns integer
language plpgsql
security invoker
set search_path = ''
as $
declare
  remaining integer;
begin
  update public.mrf_products
  set stock_quantity = stock_quantity - 1
  where id = p_product_id
    and availability = 'available'
    and stock_quantity > 0
  returning stock_quantity into remaining;

  if not found then
    raise exception 'Product is not in stock or is unavailable';
  end if;

  return remaining;
end;
$;

revoke all on function public.mrf_decrement_product_stock(uuid) from public;
grant execute on function public.mrf_decrement_product_stock(uuid) to authenticated;
grant update on public.mrf_catalog_settings to authenticated;

-- Public viewing of images is intentional. Only authorized MRF admins can upload/remove them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mrf-products', 'mrf-products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view MRF product images" on storage.objects;
create policy "Public can view MRF product images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'mrf-products');

drop policy if exists "MRF admins can upload product images" on storage.objects;
create policy "MRF admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'mrf-products' and (select private.mrf_is_admin()));

drop policy if exists "MRF admins can update product images" on storage.objects;
create policy "MRF admins can update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'mrf-products' and (select private.mrf_is_admin()))
  with check (bucket_id = 'mrf-products' and (select private.mrf_is_admin()));

drop policy if exists "MRF admins can delete product images" on storage.objects;
create policy "MRF admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'mrf-products' and (select private.mrf_is_admin()));


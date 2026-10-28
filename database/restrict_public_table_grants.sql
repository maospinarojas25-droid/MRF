-- Keep the catalog readable by the public but remove unnecessary table grants.
begin;

revoke all on public.mrf_admin_users, public.mrf_products, public.mrf_catalog_settings
  from anon, authenticated;

grant select on public.mrf_admin_users to authenticated;
grant select on public.mrf_products to anon, authenticated;
grant insert, update, delete on public.mrf_products to authenticated;
grant select on public.mrf_catalog_settings to anon, authenticated;
grant update on public.mrf_catalog_settings to authenticated;

commit;

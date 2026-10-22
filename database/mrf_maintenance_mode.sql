-- Adds the MRF public maintenance toggle to an existing installation.
alter table public.mrf_catalog_settings
  add column if not exists maintenance_mode boolean not null default false;

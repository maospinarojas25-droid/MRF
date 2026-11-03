-- Add the public-facing "Próxima a llegar" product state.
-- Safe for existing rows: it widens the accepted availability values only.
ALTER TABLE public.mrf_products
  DROP CONSTRAINT IF EXISTS mrf_products_availability_check;

ALTER TABLE public.mrf_products
  ADD CONSTRAINT mrf_products_availability_check
  CHECK (availability IN ('available', 'made_to_order', 'coming_soon'));

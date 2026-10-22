-- MRF product categories and inventory compatibility.
-- Run in Supabase Dashboard > SQL Editor. Safe to run more than once.
ALTER TABLE public.mrf_products
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS product_category text NOT NULL DEFAULT 'cap',
  ADD COLUMN IF NOT EXISTS visor_style text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mrf_products_product_category_check'
      AND conrelid = 'public.mrf_products'::regclass
  ) THEN
    ALTER TABLE public.mrf_products
      ADD CONSTRAINT mrf_products_product_category_check
      CHECK (product_category IN ('cap', 'accessory'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mrf_products_stock_quantity_nonnegative'
      AND conrelid = 'public.mrf_products'::regclass
  ) THEN
    ALTER TABLE public.mrf_products
      ADD CONSTRAINT mrf_products_stock_quantity_nonnegative
      CHECK (stock_quantity >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mrf_products_visor_style_check'
      AND conrelid = 'public.mrf_products'::regclass
  ) THEN
    ALTER TABLE public.mrf_products
      ADD CONSTRAINT mrf_products_visor_style_check
      CHECK (visor_style IN ('flat', 'curved'));
  END IF;
END $$;

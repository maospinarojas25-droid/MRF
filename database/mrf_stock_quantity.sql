-- MRF product stock tracking. Safe to run more than once.
ALTER TABLE public.mrf_products
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mrf_products_stock_quantity_nonnegative'
      AND conrelid = 'public.mrf_products'::regclass
  ) THEN
    ALTER TABLE public.mrf_products
      ADD CONSTRAINT mrf_products_stock_quantity_nonnegative CHECK (stock_quantity >= 0);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.mrf_decrement_product_stock(p_product_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  remaining integer;
BEGIN
  UPDATE public.mrf_products
  SET stock_quantity = stock_quantity - 1
  WHERE id = p_product_id
    AND availability = 'available'
    AND stock_quantity > 0
  RETURNING stock_quantity INTO remaining;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product is not in stock or is unavailable';
  END IF;

  RETURN remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.mrf_decrement_product_stock(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mrf_decrement_product_stock(uuid) TO authenticated;

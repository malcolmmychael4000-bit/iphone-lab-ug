-- Add the tier-specific screen image fields without changing existing rows.
ALTER TABLE public.parts_inventory
  ADD COLUMN IF NOT EXISTS incell_image_url TEXT,
  ADD COLUMN IF NOT EXISTS oled_image_url TEXT;

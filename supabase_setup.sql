-- ====================================================================
-- iPhone Lab UG - Supabase Complete Database Setup Script
-- Paste and run this script in your Supabase SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- ====================================================================

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- --------------------------------------------------------------------

-- Parts & Products / Repair Parts Inventory
CREATE TABLE IF NOT EXISTS parts_products (
  id TEXT PRIMARY KEY DEFAULT concat('part-', extract(epoch from now())::bigint),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Screens', 'Batteries', 'Back Glasses', 'Housings', 'Camera Glasses', 'Screen Guards', 'Accessories')),
  sub_category TEXT,
  screen_tier TEXT,
  incell_price_ugx BIGINT,
  oled_price_ugx BIGINT,
  oem_price_ugx BIGINT,
  price_ugx BIGINT NOT NULL DEFAULT 0,
  compatibility_range TEXT NOT NULL DEFAULT 'iPhone Series',
  stock_status TEXT NOT NULL DEFAULT 'In Stock' CHECK (stock_status IN ('In Stock', 'Low Stock', 'Limited Stock', 'Pre-Order', 'Out of Stock')),
  description TEXT,
  image_url TEXT,
  incell_image_url TEXT,
  oled_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate installations created by older versions of this file. PostgreSQL
-- folds the old unquoted camelCase identifiers to lowercase names.
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS screen_tier TEXT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS incell_price_ugx BIGINT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS oled_price_ugx BIGINT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS oem_price_ugx BIGINT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS price_ugx BIGINT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS compatibility_range TEXT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS stock_status TEXT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS incell_image_url TEXT;
ALTER TABLE parts_products ADD COLUMN IF NOT EXISTS oled_image_url TEXT;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parts_products' AND column_name = 'subcategory') THEN
    EXECUTE 'UPDATE parts_products SET sub_category = COALESCE(sub_category, subcategory), screen_tier = COALESCE(screen_tier, screentier), incell_price_ugx = COALESCE(incell_price_ugx, incellpriceugx), oled_price_ugx = COALESCE(oled_price_ugx, oledpriceugx), price_ugx = COALESCE(price_ugx, priceugx), compatibility_range = COALESCE(compatibility_range, compatibilityrange), stock_status = COALESCE(stock_status, stockstatus)';
  END IF;
END $$;

-- Repair Bookings & Express Service Requests
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT concat('BK-', floor(random() * (900000) + 100000)::text),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  device_model TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact Submissions & Direct Customer Inquiries
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY DEFAULT concat('CT-', floor(random() * (9000) + 1000)::text),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. STORAGE BUCKET CREATION (FOR PRODUCT & REPAIR IMAGES)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- --------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE parts_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR `parts_products`
DROP POLICY IF EXISTS "Public read inventory" ON parts_products;
CREATE POLICY "Public read inventory"
  ON parts_products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin full control on inventory" ON parts_products;
CREATE POLICY "Admin full control on inventory"
  ON parts_products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- POLICIES FOR `bookings`
DROP POLICY IF EXISTS "Public submit repair booking" ON bookings;
CREATE POLICY "Public submit repair booking"
  ON bookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage bookings" ON bookings;
CREATE POLICY "Admin manage bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- POLICIES FOR `contact_submissions`
DROP POLICY IF EXISTS "Public submit contact inquiry" ON contact_submissions;
CREATE POLICY "Public submit contact inquiry"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view contact inquiries" ON contact_submissions;
CREATE POLICY "Admin view contact inquiries"
  ON contact_submissions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- STORAGE BUCKET POLICIES for 'products'
DROP POLICY IF EXISTS "Public view product images" ON storage.objects;
CREATE POLICY "Public view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');

-- Supabase Row Level Security (RLS) & Security Policies for iPhone Lab UG
-- Run this in your Supabase SQL Editor to enforce strict table and storage permissions.

-- 1. Enable RLS on all tables
ALTER TABLE IF EXISTS parts_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_submissions ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR `parts_products`
-- Anyone can view parts/inventory
DROP POLICY IF EXISTS "Public read parts" ON parts_products;
CREATE POLICY "Public read parts" 
  ON parts_products FOR SELECT 
  USING (true);

-- Only authenticated admins can insert, update, or delete parts
DROP POLICY IF EXISTS "Admin insert parts" ON parts_products;
CREATE POLICY "Admin insert parts" 
  ON parts_products FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update parts" ON parts_products;
CREATE POLICY "Admin update parts" 
  ON parts_products FOR UPDATE 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Admin delete parts" ON parts_products;
CREATE POLICY "Admin delete parts" 
  ON parts_products FOR DELETE 
  TO authenticated 
  USING (true);

-- 3. POLICIES FOR `bookings`
-- Anyone can create a repair booking submission
DROP POLICY IF EXISTS "Public insert bookings" ON bookings;
CREATE POLICY "Public insert bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (true);

-- Only authenticated admins can view or update repair bookings
DROP POLICY IF EXISTS "Admin read bookings" ON bookings;
CREATE POLICY "Admin read bookings" 
  ON bookings FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Admin update bookings" ON bookings;
CREATE POLICY "Admin update bookings" 
  ON bookings FOR UPDATE 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Admin delete bookings" ON bookings;
CREATE POLICY "Admin delete bookings" 
  ON bookings FOR DELETE 
  TO authenticated 
  USING (true);

-- 4. POLICIES FOR `contact_submissions`
-- Anyone can send a message inquiry
DROP POLICY IF EXISTS "Public insert contact submissions" ON contact_submissions;
CREATE POLICY "Public insert contact submissions" 
  ON contact_submissions FOR INSERT 
  WITH CHECK (true);

-- Only authenticated admins can view contact messages
DROP POLICY IF EXISTS "Admin read contact submissions" ON contact_submissions;
CREATE POLICY "Admin read contact submissions" 
  ON contact_submissions FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Admin delete contact submissions" ON contact_submissions;
CREATE POLICY "Admin delete contact submissions" 
  ON contact_submissions FOR DELETE 
  TO authenticated 
  USING (true);

-- 5. STORAGE BUCKET POLICIES for 'products' bucket
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" 
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

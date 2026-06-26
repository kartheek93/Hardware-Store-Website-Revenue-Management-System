-- ============================================================
--  MahairaSystem — Supabase database setup
--  Sri Manikanta Paints, Iron & Hardware
--
--  HOW TO RUN:
--    1. Open your Supabase project → SQL Editor → New query
--    2. Paste this entire file and click "Run"
--    3. Then follow the STORAGE + AUTH steps at the bottom (dashboard clicks)
--
--  Safe to re-run: drops are guarded with IF EXISTS / IF NOT EXISTS.
-- ============================================================

-- ----------------------------------------------------------------
--  TABLES
-- ----------------------------------------------------------------

-- Products ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('Paints','Iron & Steel','Hardware','Tools')),
  description   TEXT,
  cost_price    NUMERIC(10,2) NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL,
  stock_qty     INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Customers --------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  address    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bills ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bills (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id    UUID REFERENCES customers(id),
  subtotal       NUMERIC(10,2) NOT NULL,
  gst_rate       NUMERIC(5,2) NOT NULL DEFAULT 18,
  gst_amount     NUMERIC(10,2) NOT NULL,
  total_amount   NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Outstanding'
                 CHECK (payment_status IN ('Paid','Outstanding','Overdue')),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Bill items (line items per bill) --------------------------------
CREATE TABLE IF NOT EXISTS bill_items (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id      UUID REFERENCES bills(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  product_name TEXT NOT NULL,             -- snapshot: name at time of billing
  unit_price   NUMERIC(10,2) NOT NULL,    -- snapshot: price at time of billing
  quantity     INTEGER NOT NULL,
  line_total   NUMERIC(10,2) NOT NULL
);

-- Payments ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id     UUID REFERENCES bills(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10,2) NOT NULL,
  paid_at     TIMESTAMPTZ DEFAULT now(),
  notes       TEXT
);

-- Helpful indexes for dashboard / reports queries ------------------
CREATE INDEX IF NOT EXISTS idx_bills_created_at     ON bills (created_at);
CREATE INDEX IF NOT EXISTS idx_bills_status         ON bills (payment_status);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id   ON bill_items (bill_id);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products (is_active);

-- ----------------------------------------------------------------
--  ROW LEVEL SECURITY
-- ----------------------------------------------------------------

ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments   ENABLE ROW LEVEL SECURITY;

-- Products: anyone (even logged-out customers) can READ active products
DROP POLICY IF EXISTS "public can read active products" ON products;
CREATE POLICY "public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Products: only the authenticated owner can INSERT / UPDATE / DELETE.
-- (Owner also needs to read inactive products — covered by this ALL policy.)
DROP POLICY IF EXISTS "owner can manage products" ON products;
CREATE POLICY "owner can manage products"
  ON products FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Everything else: owner only (must be logged in)
DROP POLICY IF EXISTS "owner only" ON customers;
CREATE POLICY "owner only" ON customers  FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "owner only" ON bills;
CREATE POLICY "owner only" ON bills      FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "owner only" ON bill_items;
CREATE POLICY "owner only" ON bill_items FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "owner only" ON payments;
CREATE POLICY "owner only" ON payments   FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
--  MANUAL DASHBOARD STEPS (cannot be done in SQL)
-- ============================================================
--
--  A) STORAGE BUCKET for product images
--     Dashboard → Storage → New bucket
--       Name:   product-images
--       Public: YES  (public read, authenticated write)
--     Then add two policies (Storage → Policies → product-images):
--       1. SELECT  → allow for everyone (public read)
--       2. INSERT/UPDATE/DELETE → allow when auth.role() = 'authenticated'
--     (Supabase offers a one-click "Allow public read access" template for #1.)
--
--  B) OWNER LOGIN ACCOUNT  (there is NO signup page in the app)
--     Dashboard → Authentication → Users → Add user
--       Email:    owner@srimanikantahardware.com   (your choice)
--       Password: (set a strong one)
--       Tick "Auto Confirm User" so they can log in immediately.
--     Use these credentials on /owner/login.
--
--  C) REDIRECT URLs (after you deploy to Vercel)
--     Dashboard → Authentication → URL Configuration → Redirect URLs
--       Add: https://your-app.vercel.app/**
-- ============================================================

-- ----------------------------------------------------------------
--  OPTIONAL: sample products so the catalogue isn't empty on day one.
--  Delete this block if you'd rather start clean.
-- ----------------------------------------------------------------
INSERT INTO products (name, category, description, cost_price, selling_price, stock_qty, reorder_level)
VALUES
  ('Asian Paints Apcolite Premium Emulsion (10L)', 'Paints', 'Interior emulsion, smooth matt finish.', 1850, 2399, 24, 6),
  ('Berger Weathercoat Exterior (20L)', 'Paints', 'All-weather exterior protection.', 3200, 4150, 12, 5),
  ('TMT Steel Rod 12mm (per piece, 12ft)', 'Iron & Steel', 'Fe-500 grade TMT reinforcement bar.', 540, 690, 80, 20),
  ('MS Angle 40x40x5mm (per ft)', 'Iron & Steel', 'Mild steel L-angle for fabrication.', 62, 85, 200, 40),
  ('Stainless Steel Door Hinges 4" (pair)', 'Hardware', 'SS-304 butt hinges, rust-resistant.', 95, 145, 60, 15),
  ('Godrej Cylindrical Door Lock', 'Hardware', 'Brass cylinder, 2 keys included.', 410, 599, 18, 5),
  ('Bosch GSB 500W Impact Drill', 'Tools', '13mm chuck, hammer + drill modes.', 2950, 3799, 7, 3),
  ('Stanley 8m Measuring Tape', 'Tools', 'Auto-lock, shock-resistant case.', 180, 259, 35, 10),
  ('Nippon Paint Spotless Interior (4L)', 'Paints', 'Stain-resistant washable interior paint.', 980, 1349, 20, 5),
  ('Dulux Velvet Touch Pearl Glo (1L)', 'Paints', 'Rich, lustrous pearl finish.', 540, 749, 28, 8),
  ('GI Sheet 8ft x 3ft (24 gauge)', 'Iron & Steel', 'Galvanised corrugated roofing sheet.', 720, 940, 45, 12),
  ('MS Square Pipe 25x25mm (per ft)', 'Iron & Steel', 'Mild steel hollow section.', 48, 72, 300, 50),
  ('Fevicol SH Wood Adhesive 1kg', 'Hardware', 'Multipurpose white wood glue.', 145, 199, 50, 12),
  ('Havells 1.5 sqmm FR Wire (90m)', 'Hardware', 'PVC-insulated copper house wire.', 1850, 2299, 16, 4),
  ('Taparia Screwdriver Set (6 pc)', 'Tools', 'Insulated handles, CRV steel tips.', 320, 459, 22, 6),
  ('Generic Safety Helmet (ISI)', 'Tools', 'ABS shell, ratchet adjustment.', 110, 169, 40, 10)
ON CONFLICT DO NOTHING;

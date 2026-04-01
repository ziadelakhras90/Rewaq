-- ─────────────────────────────────────────────────────────────────────────────
-- 008_customer_addresses.sql
-- عناوين التوصيل للعملاء
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE customer_addresses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       text,                          -- مثل: المنزل، العمل
  full_name   text        NOT NULL,
  phone       text        NOT NULL,
  city        text        NOT NULL,
  district    text,
  street      text,
  building    text,
  notes       text,
  is_default  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ضمان: عنوان افتراضي واحد فقط لكل عميل
CREATE UNIQUE INDEX one_default_address_per_customer
  ON customer_addresses (customer_id)
  WHERE is_default = true;

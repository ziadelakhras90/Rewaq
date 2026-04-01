-- ─────────────────────────────────────────────────────────────────────────────
-- 010_cart_items.sql
-- عناصر السلة — unit_price محفوظ لحظة الإضافة
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE cart_items (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     uuid          NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  uuid          NOT NULL REFERENCES products(id),
  quantity    integer       NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  numeric(10,2) NOT NULL,   -- السعر لحظة الإضافة (يُقارن بالسعر الفعلي عند checkout)
  added_at    timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);

COMMENT ON COLUMN cart_items.unit_price IS 'السعر وقت الإضافة للسلة — create-order يتحقق من الفرق ويعيد PRICE_CHANGED إذا تغيّر';

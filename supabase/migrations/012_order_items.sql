-- ─────────────────────────────────────────────────────────────────────────────
-- 012_order_items.sql
-- عناصر الطلب — snapshot كامل محفوظ بشكل دائم
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE order_items (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  -- FK بدون CASCADE: يمنع حذف المنتج إذا له طلبات (ON DELETE RESTRICT هو الافتراضي)
  product_id   uuid          NOT NULL REFERENCES products(id),

  -- snapshot بيانات المنتج لحظة الطلب (لا تتأثر بأي تعديل لاحق على المنتج)
  product_name text          NOT NULL,
  product_sku  text,
  unit_price   numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity     integer       NOT NULL CHECK (quantity > 0),
  total_price  numeric(10,2) NOT NULL CHECK (total_price >= 0),

  created_at   timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  order_items              IS 'snapshot كامل — بيانات المنتج محفوظة بشكل مستقل عن جدول products';
COMMENT ON COLUMN order_items.product_id   IS 'ON DELETE RESTRICT: لا يمكن حذف منتج له طلبات — يُؤرشف بدلًا من ذلك';
COMMENT ON COLUMN order_items.product_name IS 'اسم المنتج وقت الطلب — لا يتأثر بتغيير اسم المنتج لاحقًا';

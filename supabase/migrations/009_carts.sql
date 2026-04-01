-- ─────────────────────────────────────────────────────────────────────────────
-- 009_carts.sql
-- سلة التسوق — single-vendor مفروض عبر store_id
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE carts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid        NOT NULL REFERENCES profiles(id),
  store_id    uuid        REFERENCES stores(id),   -- يُعيَّن عند إضافة أول منتج
  status      text        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'checked_out', 'abandoned')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN carts.store_id IS 'single-vendor enforcement: إضافة منتج من متجر مختلف → conflict في cart.service.ts';
COMMENT ON COLUMN carts.status   IS 'active→checked_out عند create-order | abandoned للمستقبل عبر scheduled job';

-- ضمان: سلة active واحدة فقط لكل عميل
CREATE UNIQUE INDEX one_active_cart_per_customer
  ON carts (customer_id)
  WHERE status = 'active';

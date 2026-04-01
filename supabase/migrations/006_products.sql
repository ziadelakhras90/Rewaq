-- ─────────────────────────────────────────────────────────────────────────────
-- 006_products.sql
-- منتجات البائعين
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        uuid        NOT NULL REFERENCES stores(id),
  category_id     uuid        REFERENCES categories(id),
  name            text        NOT NULL,
  slug            text        NOT NULL,
  description     text,
  price           numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_price   numeric(10,2) CHECK (compare_price IS NULL OR compare_price > price),
  sku             text,
  stock_quantity  integer     NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  track_inventory boolean     NOT NULL DEFAULT true,
  status          text        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'active', 'archived')),
  is_featured     boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, slug)
);

COMMENT ON COLUMN products.status         IS 'draft=غير منشور | active=منشور | archived=مؤرشف (لا يُحذف إذا له order_items)';
COMMENT ON COLUMN products.compare_price  IS 'السعر قبل الخصم — يجب أن يكون أعلى من price';
COMMENT ON COLUMN products.track_inventory IS 'false = لا نخصم من المخزون عند الطلب (للمنتجات غير المحدودة)';

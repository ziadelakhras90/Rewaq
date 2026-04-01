-- ─────────────────────────────────────────────────────────────────────────────
-- 007_product_images.sql
-- صور المنتجات — تُحذف تلقائيًا مع حذف المنتج (ON DELETE CASCADE)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE product_images (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         text        NOT NULL,
  alt_text    text,
  sort_order  integer     NOT NULL DEFAULT 0,
  is_primary  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ضمان: صورة رئيسية واحدة فقط لكل منتج
CREATE UNIQUE INDEX one_primary_image_per_product
  ON product_images (product_id)
  WHERE is_primary = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- 005_categories.sql
-- تصنيفات المنتجات — يديرها الأدمن فقط
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  description text,
  image_url   text,
  parent_id   uuid        REFERENCES categories(id),   -- لدعم subcategories مستقبلًا
  sort_order  integer     NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN categories.parent_id IS 'MVP: لا نعرض أكثر من مستوى واحد في الواجهة — البنية موجودة للمستقبل';

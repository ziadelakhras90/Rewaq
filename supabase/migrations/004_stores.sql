-- ─────────────────────────────────────────────────────────────────────────────
-- 004_stores.sql
-- المتاجر — تُنشأ تلقائيًا عند الموافقة على البائع عبر Edge Function
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE stores (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       uuid        NOT NULL REFERENCES profiles(id) UNIQUE,
  application_id  uuid        REFERENCES seller_applications(id),
  name            text        NOT NULL,
  slug            text        NOT NULL UNIQUE,
  description     text,
  logo_url        text,
  cover_url       text,
  phone           text,
  email           text,
  -- عنوان المتجر مدمج في MVP (store_addresses مؤجل)
  city            text,
  district        text,
  address_line    text,
  -- الحالة التشغيلية — منفصلة تمامًا عن seller_applications.status
  status          text        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'suspended', 'closed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  stores               IS 'متاجر البائعين — تُنشأ عبر approve-seller Edge Function فقط';
COMMENT ON COLUMN stores.status        IS 'active|suspended|closed — التعليق هنا وليس في seller_applications';
COMMENT ON COLUMN stores.seller_id     IS 'UNIQUE: بائع واحد = متجر واحد في MVP';

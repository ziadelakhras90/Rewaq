-- ─────────────────────────────────────────────────────────────────────────────
-- 011_orders.sql
-- الطلبات — تُنشأ حصرًا عبر create-order Edge Function
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id                 uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       text          NOT NULL UNIQUE,
  customer_id        uuid          NOT NULL REFERENCES profiles(id),
  store_id           uuid          NOT NULL REFERENCES stores(id),   -- single-vendor MVP

  -- حالة الطلب
  status             text          NOT NULL DEFAULT 'pending'
                                   CHECK (status IN (
                                     'pending', 'confirmed', 'processing',
                                     'shipped', 'delivered', 'cancelled', 'refunded'
                                   )),

  -- snapshot بيانات التوصيل (لا تتأثر بتعديل العنوان لاحقًا)
  delivery_name      text          NOT NULL,
  delivery_phone     text          NOT NULL,
  delivery_city      text          NOT NULL,
  delivery_district  text,
  delivery_street    text,
  delivery_notes     text,

  -- المبالغ
  subtotal           numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee       numeric(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  discount_amount    numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount       numeric(10,2) NOT NULL CHECK (total_amount >= 0),

  -- الدفع
  payment_method     text          NOT NULL DEFAULT 'cash_on_delivery',
  payment_status     text          NOT NULL DEFAULT 'pending'
                                   CHECK (payment_status IN ('pending', 'paid', 'refunded')),

  -- ملاحظات العميل الحرة فقط (لا بيانات منظمة هنا)
  notes              text,

  created_at         timestamptz   NOT NULL DEFAULT now(),
  updated_at         timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  orders              IS 'تُنشأ حصرًا عبر create_order_transaction RPC — لا INSERT مباشر من الـ client';
COMMENT ON COLUMN orders.store_id     IS 'MVP: single-vendor per order — multi-vendor مؤجل';
COMMENT ON COLUMN orders.notes        IS 'ملاحظات العميل الحرة فقط — لا تُخزَّن بيانات منظمة هنا';

-- ─────────────────────────────────────────────────────────────────────────────
-- 003_seller_applications.sql
-- طلبات الانضمام كبائع — سجل تاريخي للقرار الأولي فقط
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE seller_applications (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES profiles(id),
  store_name        text        NOT NULL,
  store_description text,
  business_type     text,
  phone             text        NOT NULL,
  city              text        NOT NULL,
  status            text        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes       text,
  reviewed_by       uuid        REFERENCES profiles(id),
  reviewed_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  seller_applications         IS 'طلبات الانضمام كبائع — status محدود: pending|approved|rejected فقط';
COMMENT ON COLUMN seller_applications.status  IS 'suspended غير موجود هنا — التعليق يكون على stores.status';

-- منع تعدد الطلبات المعلقة لنفس المستخدم
CREATE UNIQUE INDEX one_pending_application_per_user
  ON seller_applications (user_id)
  WHERE status = 'pending';

-- منع تقديم طلب جديد لمن تمت الموافقة عليه
CREATE UNIQUE INDEX one_approved_application_per_user
  ON seller_applications (user_id)
  WHERE status = 'approved';

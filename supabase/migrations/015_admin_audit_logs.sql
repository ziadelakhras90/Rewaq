-- ─────────────────────────────────────────────────────────────────────────────
-- 015_admin_audit_logs.sql
-- سجل أعمال الأدمن — append-only
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE admin_audit_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid        NOT NULL REFERENCES profiles(id),
  action      text        NOT NULL,    -- 'approve_seller' | 'reject_seller' | 'suspend_store' | 'update_order_status'
  target_type text        NOT NULL,    -- 'seller_application' | 'store' | 'order' | 'product'
  target_id   uuid        NOT NULL,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE admin_audit_logs IS 'append-only — تُكتب من Edge Functions فقط عبر service_role';

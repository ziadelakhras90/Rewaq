-- ─────────────────────────────────────────────────────────────────────────────
-- 013_order_status_history.sql
-- تاريخ تغييرات حالة الطلب — append-only (لا UPDATE ولا DELETE)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE order_status_history (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        NOT NULL REFERENCES orders(id),
  old_status  text,                              -- null عند الإنشاء (أول سجل)
  new_status  text        NOT NULL,
  changed_by  uuid        REFERENCES profiles(id),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE order_status_history IS 'append-only — لا يُسمح بالتعديل أو الحذف من الـ client';

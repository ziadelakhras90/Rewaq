-- ─────────────────────────────────────────────────────────────────────────────
-- 014_notifications.sql
-- إشعارات داخلية بسيطة
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text        NOT NULL,    -- 'order_pending', 'seller_approved', إلخ
  title      text        NOT NULL,
  body       text,
  is_read    boolean     NOT NULL DEFAULT false,
  link       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index لتحسين أداء جلب الإشعارات غير المقروءة
CREATE INDEX idx_notifications_user_unread
  ON notifications (user_id, created_at DESC)
  WHERE is_read = false;

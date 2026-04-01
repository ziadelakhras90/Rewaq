-- ─────────────────────────────────────────────────────────────────────────────
-- 020_rpc_seller_actions.sql
-- RPC functions لعمليات البائع والأدمن
-- تُستدعى حصرًا من Edge Functions عبر service_role
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- approve_seller_transaction
-- تنفّذ: تحديث الطلب + إنشاء المتجر + إضافة دور seller — في transaction واحدة
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION approve_seller_transaction(
  p_application_id  uuid,
  p_user_id         uuid,
  p_store_name      text,
  p_store_description text,
  p_store_phone     text,
  p_store_city      text,
  p_slug            text,
  p_admin_id        uuid,
  p_admin_notes     text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. تحديث حالة الطلب
  UPDATE seller_applications
  SET
    status      = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = now(),
    admin_notes = p_admin_notes
  WHERE id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'seller_application % غير موجودة', p_application_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 2. إنشاء المتجر
  INSERT INTO stores (
    seller_id,
    application_id,
    name,
    slug,
    description,
    phone,
    city,
    status
  )
  VALUES (
    p_user_id,
    p_application_id,
    p_store_name,
    p_slug,
    p_store_description,
    p_store_phone,
    p_store_city,
    'active'
  );

  -- 3. إضافة دور seller (ON CONFLICT DO NOTHING: إذا كان موجودًا بالفعل لا نرمي خطأ)
  INSERT INTO user_roles (user_id, role, granted_by)
  VALUES (p_user_id, 'seller', p_admin_id)
  ON CONFLICT (user_id, role) DO NOTHING;

END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- update_order_status_transaction
-- تنفّذ: تحديث الطلب + إضافة سجل في التاريخ — في transaction واحدة
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_order_status_transaction(
  p_order_id   uuid,
  p_old_status text,
  p_new_status text,
  p_changed_by uuid,
  p_notes      text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تحديث حالة الطلب
  UPDATE orders
  SET
    status     = p_new_status,
    updated_at = now()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order % غير موجود', p_order_id
      USING ERRCODE = 'P0002';
  END IF;

  -- إضافة سجل في التاريخ
  INSERT INTO order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    notes
  )
  VALUES (
    p_order_id,
    p_old_status,
    p_new_status,
    p_changed_by,
    p_notes
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- Permissions: service_role فقط
-- ══════════════════════════════════════════════════════════════════════════════
REVOKE ALL ON FUNCTION approve_seller_transaction(uuid,uuid,text,text,text,text,text,uuid,text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION approve_seller_transaction(uuid,uuid,text,text,text,text,text,uuid,text) TO service_role;

REVOKE ALL ON FUNCTION update_order_status_transaction(uuid,text,text,uuid,text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION update_order_status_transaction(uuid,text,text,uuid,text) TO service_role;

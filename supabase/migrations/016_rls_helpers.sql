-- ─────────────────────────────────────────────────────────────────────────────
-- 016_rls_helpers.sql
-- Helper functions تُستخدم داخل RLS policies
-- SECURITY DEFINER + STABLE لأداء أفضل (تُكيَّش لكل statement)
-- ─────────────────────────────────────────────────────────────────────────────

-- هل المستخدم الحالي أدمن؟
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role    = 'admin'
  );
$$;

-- هل المستخدم الحالي يملك هذا المتجر؟
CREATE OR REPLACE FUNCTION owns_store(p_store_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM stores
    WHERE id        = p_store_id
      AND seller_id = auth.uid()
  );
$$;

-- هل هذا المتجر نشط؟
CREATE OR REPLACE FUNCTION is_store_active(p_store_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM stores
    WHERE id     = p_store_id
      AND status = 'active'
  );
$$;

-- منح صلاحية استدعاء الـ helpers لـ authenticated users
GRANT EXECUTE ON FUNCTION is_admin()                TO authenticated;
GRANT EXECUTE ON FUNCTION owns_store(uuid)          TO authenticated;
GRANT EXECUTE ON FUNCTION is_store_active(uuid)     TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 002_user_roles.sql
-- أدوار المستخدمين — مستقلة عن profiles لدعم multi-role
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE user_roles (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       text        NOT NULL CHECK (role IN ('customer', 'seller', 'admin')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid        REFERENCES profiles(id),   -- null = self (تسجيل تلقائي)
  UNIQUE (user_id, role)
);

COMMENT ON TABLE  user_roles            IS 'أدوار المستخدمين — المستخدم الواحد قد يملك customer + seller معًا';
COMMENT ON COLUMN user_roles.granted_by IS 'null عند التسجيل التلقائي، uuid الأدمن عند منح دور seller/admin';

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: ينشئ profile + customer role تلقائيًا عند كل تسجيل جديد
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إنشاء الملف الشخصي
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- إضافة دور customer تلقائيًا
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

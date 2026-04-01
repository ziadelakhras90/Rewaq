-- ─────────────────────────────────────────────────────────────────────────────
-- 001_profiles.sql
-- الملف الشخصي لكل مستخدم — يُنشأ تلقائيًا عند التسجيل عبر trigger
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text        NOT NULL DEFAULT '',
  phone       text,
  avatar_url  text,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  profiles            IS 'بيانات الملف الشخصي لكل مستخدم مسجّل';
COMMENT ON COLUMN profiles.id         IS 'يطابق auth.users.id';
COMMENT ON COLUMN profiles.is_active  IS 'false = محظور من المنصة';

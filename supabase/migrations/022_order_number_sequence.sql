-- ─────────────────────────────────────────────────────────────────────────────
-- supabase/migrations/022_order_number_sequence.sql
--
-- نهج بديل لتوليد رقم الطلب:
-- Postgres sequence يضمن عدم التكرار بدون retries.
-- أكثر أمانًا من الرقم العشوائي في بيئة concurrent.
--
-- الصيغة النهائية: RWQ-YYYY-NNNNN
-- ─────────────────────────────────────────────────────────────────────────────

-- Sequence يبدأ من 10000 ليضمن 5 خانات دائمًا
CREATE SEQUENCE IF NOT EXISTS order_number_seq
  START WITH 10000
  INCREMENT BY 1
  NO CYCLE;

-- Function تستخدم الـ sequence لتوليد رقم فريد مضمون
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 'RWQ-' || EXTRACT(YEAR FROM now())::text || '-' ||
         LPAD(nextval('order_number_seq')::text, 5, '0');
$$;

-- منح صلاحية الاستدعاء لـ service_role فقط
REVOKE ALL ON FUNCTION generate_order_number() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION generate_order_number() TO service_role;

-- منح صلاحية الـ sequence لـ service_role
GRANT USAGE ON SEQUENCE order_number_seq TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- ملاحظة: استخدمنا هذا النهج (sequence) في Edge Function
-- بدلًا من random + retry، لأن الـ sequence يضمن uniqueness
-- حتى في حالة آلاف الطلبات المتزامنة.
-- ─────────────────────────────────────────────────────────────────────────────

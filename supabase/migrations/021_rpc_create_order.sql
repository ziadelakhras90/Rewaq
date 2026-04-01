-- ─────────────────────────────────────────────────────────────────────────────
-- supabase/migrations/021_rpc_create_order.sql
--
-- RPC function تنفّذ عملية إنشاء الطلب كـ Postgres transaction ذرية.
-- تُستدعى حصرًا من Edge Function create-order باستخدام service_role.
-- لا يمكن استدعاؤها مباشرة من الـ client (مقيّدة بـ SECURITY DEFINER
-- وغير مكشوفة عبر RLS العادية).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_order_transaction(
  -- بيانات الطلب الأساسية
  p_order_number    text,
  p_customer_id     uuid,
  p_store_id        uuid,
  p_cart_id         uuid,

  -- بيانات التوصيل (snapshot من customer_addresses)
  p_delivery_name     text,
  p_delivery_phone    text,
  p_delivery_city     text,
  p_delivery_district text,
  p_delivery_street   text,
  p_delivery_notes    text,

  -- المبالغ (محسوبة ومتحقق منها في Edge Function)
  p_subtotal        numeric,
  p_delivery_fee    numeric,
  p_discount_amount numeric,
  p_total_amount    numeric,

  -- الدفع
  p_payment_method  text,

  -- ملاحظات العميل الحرة
  p_notes           text,

  -- عناصر الطلب: JSON array من objects
  -- كل object: { product_id, product_name, product_sku, unit_price, quantity, total_price }
  p_items           jsonb
)
RETURNS uuid    -- يعيد order.id
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id   uuid;
  v_item       jsonb;
BEGIN
  -- ── 1. إدراج الطلب ──────────────────────────────────────────────────────
  INSERT INTO orders (
    order_number,
    customer_id,
    store_id,
    status,
    delivery_name,
    delivery_phone,
    delivery_city,
    delivery_district,
    delivery_street,
    delivery_notes,
    subtotal,
    delivery_fee,
    discount_amount,
    total_amount,
    payment_method,
    payment_status,
    notes
  )
  VALUES (
    p_order_number,
    p_customer_id,
    p_store_id,
    'pending',
    p_delivery_name,
    p_delivery_phone,
    p_delivery_city,
    p_delivery_district,
    p_delivery_street,
    p_delivery_notes,
    p_subtotal,
    p_delivery_fee,
    p_discount_amount,
    p_total_amount,
    p_payment_method,
    'pending',
    p_notes
  )
  RETURNING id INTO v_order_id;

  -- ── 2. إدراج عناصر الطلب (snapshots) ────────────────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      product_sku,
      unit_price,
      quantity,
      total_price
    )
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      v_item->>'product_sku',     -- يمكن أن يكون null
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::integer,
      (v_item->>'total_price')::numeric
    );
  END LOOP;

  -- ── 3. تحديث المخزون لكل منتج ────────────────────────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- نتحقق أن track_inventory = true قبل الخصم
    UPDATE products
    SET
      stock_quantity = stock_quantity - (v_item->>'quantity')::integer,
      updated_at     = now()
    WHERE
      id              = (v_item->>'product_id')::uuid
      AND track_inventory = true;

    -- التحقق من أن المخزون لم يصبح سالبًا (race condition protection)
    IF FOUND THEN
      PERFORM id FROM products
      WHERE
        id             = (v_item->>'product_id')::uuid
        AND stock_quantity < 0;

      IF FOUND THEN
        RAISE EXCEPTION 'نفد المخزون للمنتج: %', (v_item->>'product_name')
          USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END LOOP;

  -- ── 4. إدراج أول سجل في تاريخ الحالات ───────────────────────────────────
  INSERT INTO order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    notes
  )
  VALUES (
    v_order_id,
    null,         -- لا حالة سابقة
    'pending',
    p_customer_id,
    'تم إنشاء الطلب'
  );

  -- ── 5. تحديث حالة السلة إلى checked_out ─────────────────────────────────
  UPDATE carts
  SET
    status     = 'checked_out',
    updated_at = now()
  WHERE id = p_cart_id;

  RETURN v_order_id;

EXCEPTION
  WHEN OTHERS THEN
    -- أي خطأ يؤدي إلى rollback تلقائي (plpgsql transaction)
    RAISE;
END;
$$;

-- منح صلاحية الاستدعاء لـ service_role فقط
REVOKE ALL ON FUNCTION create_order_transaction FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION create_order_transaction TO service_role;

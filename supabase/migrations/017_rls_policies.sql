-- ─────────────────────────────────────────────────────────────────────────────
-- 017_rls_policies.sql
-- تفعيل RLS + كل الـ policies للجداول
-- القاعدة: RLS مفعّلة على كل جدول — لا جدول مفتوح بدون policy
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- PROFILES
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: read own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════════════════
-- USER_ROLES
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles: read own"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_roles: admin read all"
  ON user_roles FOR SELECT
  USING (is_admin());

-- INSERT/UPDATE/DELETE: service_role فقط (Edge Functions)
-- لا policy هنا = لا أحد من الـ client يكتب فيه

-- ══════════════════════════════════════════════════════════════════════════════
-- SELLER_APPLICATIONS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_applications: read own"
  ON seller_applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "seller_applications: admin read all"
  ON seller_applications FOR SELECT
  USING (is_admin());

CREATE POLICY "seller_applications: insert own"
  ON seller_applications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    -- يمنع التقديم لمن لديه طلب pending أو approved بالفعل
    AND NOT EXISTS (
      SELECT 1 FROM seller_applications sa
      WHERE sa.user_id = auth.uid()
        AND sa.status  IN ('pending', 'approved')
    )
  );

-- UPDATE: service_role فقط (approve/reject عبر Edge Functions)

-- ══════════════════════════════════════════════════════════════════════════════
-- STORES
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores: public read active"
  ON stores FOR SELECT
  USING (status = 'active');

CREATE POLICY "stores: seller read own"
  ON stores FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "stores: admin read all"
  ON stores FOR SELECT
  USING (is_admin());

CREATE POLICY "stores: seller update own"
  ON stores FOR UPDATE
  USING (
    seller_id = auth.uid()
    AND status != 'suspended'    -- البائع الموقوف لا يُعدّل متجره
  )
  WITH CHECK (
    seller_id = auth.uid()
    -- لا يمكن للبائع تغيير status بنفسه
    AND status != 'suspended'
  );

CREATE POLICY "stores: admin all"
  ON stores FOR ALL
  USING (is_admin());

-- INSERT: service_role فقط (تُنشأ عبر approve-seller)

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORIES
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: public read active"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "categories: admin all"
  ON categories FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- PRODUCTS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- العموم يرى: منتج active + متجره active
CREATE POLICY "products: public read active"
  ON products FOR SELECT
  USING (
    status = 'active'
    AND is_store_active(store_id)
  );

-- البائع يرى كل منتجاته (بكل الحالات)
CREATE POLICY "products: seller read own store"
  ON products FOR SELECT
  USING (owns_store(store_id));

CREATE POLICY "products: admin read all"
  ON products FOR SELECT
  USING (is_admin());

CREATE POLICY "products: seller insert own store"
  ON products FOR INSERT
  WITH CHECK (owns_store(store_id));

CREATE POLICY "products: seller update own store"
  ON products FOR UPDATE
  USING (owns_store(store_id))
  WITH CHECK (owns_store(store_id));

-- الحذف الفعلي: فقط إذا لا يوجد order_items مرتبطة
CREATE POLICY "products: seller delete own no orders"
  ON products FOR DELETE
  USING (
    owns_store(store_id)
    AND NOT EXISTS (
      SELECT 1 FROM order_items
      WHERE product_id = products.id
    )
  );

CREATE POLICY "products: admin all"
  ON products FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- PRODUCT_IMAGES
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_images: public read"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id       = product_images.product_id
        AND p.status   = 'active'
        AND is_store_active(p.store_id)
    )
  );

CREATE POLICY "product_images: seller manage own"
  ON product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
        AND owns_store(p.store_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id
        AND owns_store(p.store_id)
    )
  );

CREATE POLICY "product_images: admin all"
  ON product_images FOR ALL
  USING (is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- CUSTOMER_ADDRESSES
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_addresses: own all"
  ON customer_addresses FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════════
-- CARTS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carts: own all"
  ON carts FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════════
-- CART_ITEMS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items: own all"
  ON cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE id          = cart_items.cart_id
        AND customer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE id          = cart_items.cart_id
        AND customer_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- ORDERS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders: customer read own"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "orders: seller read own store"
  ON orders FOR SELECT
  USING (owns_store(store_id));

CREATE POLICY "orders: admin all"
  ON orders FOR ALL
  USING (is_admin());

-- INSERT/UPDATE: service_role فقط (create-order + update-order-status)
-- RLS مفعّلة + لا INSERT policy = لا أحد يدرج مباشرة

-- ══════════════════════════════════════════════════════════════════════════════
-- ORDER_ITEMS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items: read via order ownership"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND (
          o.customer_id = auth.uid()
          OR owns_store(o.store_id)
          OR is_admin()
        )
    )
  );

-- INSERT: service_role فقط

-- ══════════════════════════════════════════════════════════════════════════════
-- ORDER_STATUS_HISTORY
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_status_history: read via order ownership"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id
        AND (
          o.customer_id = auth.uid()
          OR owns_store(o.store_id)
          OR is_admin()
        )
    )
  );

-- INSERT: service_role فقط

-- ══════════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: own read and mark read"
  ON notifications FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════════
-- ADMIN_AUDIT_LOGS
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit_logs: admin read only"
  ON admin_audit_logs FOR SELECT
  USING (is_admin());

-- INSERT: service_role فقط

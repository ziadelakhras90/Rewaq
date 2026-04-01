-- ─────────────────────────────────────────────────────────────────────────────
-- 018_indexes.sql
-- Indexes لتحسين أداء الاستعلامات الأكثر تكرارًا
-- ─────────────────────────────────────────────────────────────────────────────

-- ── products ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_products_store_id     ON products (store_id);
CREATE INDEX idx_products_category_id  ON products (category_id);
CREATE INDEX idx_products_status       ON products (status);
-- الاستعلام الأكثر شيوعًا: active products في متجر active
CREATE INDEX idx_products_store_status ON products (store_id, status);

-- ── orders ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_orders_customer_id  ON orders (customer_id);
CREATE INDEX idx_orders_store_id     ON orders (store_id);
CREATE INDEX idx_orders_status       ON orders (status);
CREATE INDEX idx_orders_created_at   ON orders (created_at DESC);
-- Admin: فلترة بالبائع + الحالة
CREATE INDEX idx_orders_store_status ON orders (store_id, status);

-- ── order_items ──────────────────────────────────────────────────────────────
CREATE INDEX idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);

-- ── order_status_history ─────────────────────────────────────────────────────
CREATE INDEX idx_order_status_history_order_id ON order_status_history (order_id, created_at DESC);

-- ── cart_items ───────────────────────────────────────────────────────────────
CREATE INDEX idx_cart_items_cart_id    ON cart_items (cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items (product_id);

-- ── seller_applications ──────────────────────────────────────────────────────
CREATE INDEX idx_seller_applications_user_id ON seller_applications (user_id);
CREATE INDEX idx_seller_applications_status  ON seller_applications (status);
-- Admin يرى الـ pending أولًا
CREATE INDEX idx_seller_applications_pending ON seller_applications (created_at DESC)
  WHERE status = 'pending';

-- ── stores ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_stores_status    ON stores (status);
CREATE INDEX idx_stores_seller_id ON stores (seller_id);

-- ── product_images ───────────────────────────────────────────────────────────
CREATE INDEX idx_product_images_product_id ON product_images (product_id, sort_order);

-- ── user_roles ───────────────────────────────────────────────────────────────
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);

-- ── notifications ────────────────────────────────────────────────────────────
-- الـ index الموجود في 014 يغطي هذا

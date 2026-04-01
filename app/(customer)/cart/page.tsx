'use client'

// app/(customer)/cart/page.tsx

import { useAuth }         from '@/hooks/useAuth'
import { useCart }         from '@/hooks/useCart'
import { CartList }        from '@/components/cart/cart-list'
import { CartSummary }     from '@/components/cart/cart-summary'
import { CartEmptyState }  from '@/components/cart/cart-empty-state'
import { ProductGridSkeleton } from '@/components/catalog/product-card-skeleton'

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const {
    cart,
    itemCount,
    subtotal,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart(user?.id ?? null)

  // ── تحميل ─────────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="h-8 w-32 animate-pulse rounded-full bg-stone-200 mb-8" />
          <ProductGridSkeleton count={3} />
        </div>
      </div>
    )
  }

  const storeName = (cart as any)?.stores?.name as string | undefined

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

        {/* ── رأس الصفحة ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">سلة التسوق</h1>
          {itemCount > 0 && (
            <p className="mt-1 text-sm text-stone-500">
              {itemCount} {itemCount === 1 ? 'منتج' : 'منتجات'}
            </p>
          )}
        </div>

        {/* ── فارغة ─────────────────────────────────────────────────────── */}
        {!cart || cart.cart_items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* ── قائمة المنتجات (تأخذ 2/3) ──────────────────────────── */}
            <div className="lg:col-span-2">
              <CartList
                cart={cart}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
                onClear={clearCart}
              />
            </div>

            {/* ── الملخص (1/3) ────────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CartSummary
                  subtotal={subtotal}
                  storeName={storeName}
                  itemCount={itemCount}
                />
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

'use client'
export const dynamic = 'force-dynamic'

import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { CartList } from '@/components/cart/cart-list'
import { CartSummary } from '@/components/cart/cart-summary'
import { CartEmptyState } from '@/components/cart/cart-empty-state'
import { ProductGridSkeleton } from '@/components/catalog/product-card-skeleton'
import { CurrentStoreBridge } from '@/components/layout/current-store-bridge'

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 h-8 w-32 animate-pulse rounded-full bg-stone-200" />
          <ProductGridSkeleton count={3} />
        </div>
      </div>
    )
  }

  const storeName = (cart as any)?.stores?.name as string | undefined

  const headerStore = (cart as any)?.stores ? { id: (cart as any).stores.id, name: (cart as any).stores.name, slug: (cart as any).stores.slug } : null

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <CurrentStoreBridge store={headerStore} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">سلة التسوق</h1>
          <p className="mt-1 text-sm text-stone-500">راجع القطع المختارة قبل الانتقال إلى صفحة الطلب الجديدة.</p>
          {itemCount > 0 && (
            <p className="mt-2 text-sm text-stone-500">
              {itemCount} {itemCount === 1 ? 'منتج' : 'منتجات'}
            </p>
          )}
        </div>

        {!cart || cart.cart_items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CartList
                cart={cart}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
                onClear={clearCart}
              />
            </div>

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

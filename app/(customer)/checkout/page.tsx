export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import type { Address } from '@/components/checkout/address-selector'
import { CurrentStoreBridge } from '@/components/layout/current-store-bridge'

export const metadata: Metadata = {
  title: 'راجع طلبك قبل الإرسال — Rewq',
}

export default async function CheckoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/checkout')

  const { data: cart } = await supabase
    .from('carts')
    .select(`
      id, customer_id, store_id, status,
      stores ( id, name, slug, phone ),
      cart_items (
        id, cart_id, product_id, quantity, unit_price,
        products (
          id, name, price, stock_quantity, track_inventory, status, store_id,
          product_images ( url, is_primary )
        )
      )
    `)
    .eq('customer_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const cartItems = Array.isArray((cart as any)?.cart_items)
    ? (cart as any).cart_items
    : []

  if (!cart || cartItems.length === 0) {
    redirect('/cart')
  }

  const { data: addresses } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + Number(item.products.price) * item.quantity,
    0
  )

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f1e8]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CurrentStoreBridge store={(cart as any)?.stores ? { id: (cart as any).stores.id, name: (cart as any).stores.name, slug: (cart as any).stores.slug } : null} />
        <CheckoutForm
          cart={cart as any}
          subtotal={subtotal}
          addresses={(addresses ?? []) as Address[]}
          userId={user.id}
        />
      </div>
    </div>
  )
}

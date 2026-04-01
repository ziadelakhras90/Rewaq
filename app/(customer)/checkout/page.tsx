// app/(customer)/checkout/page.tsx
// Server Component — يجلب السلة والعناوين ثم يمرّرها للـ CheckoutForm

import { redirect }       from 'next/navigation'
import type { Metadata }  from 'next'
import { createClient }   from '@/lib/supabase/server'
import { CheckoutForm }   from '@/components/checkout/checkout-form'
import type { Address }   from '@/components/checkout/address-selector'

export const metadata: Metadata = {
  title: 'إتمام الطلب — رِواق',
}

export default async function CheckoutPage() {
  const supabase = await createClient()

  // تحقق من المستخدم
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/checkout')

  // جلب السلة النشطة مع عناصرها
  const { data: cart } = await supabase
    .from('carts')
    .select(`
      id, customer_id, store_id, status,
      stores ( id, name, slug ),
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

  // السلة فارغة أو غير موجودة
  if (!cart || cartItems.length === 0) {
    redirect('/cart')
  }

  // جلب العناوين
  const { data: addresses } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  // حساب المجموع (server-side للأمان — الـ Edge Function يتحقق أيضًا)
  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + Number(item.products.price) * item.quantity,
    0
  )

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ── رأس الصفحة ──────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">إتمام الطلب</h1>
          <p className="mt-1 text-sm text-stone-500">
            خطوة واحدة لتأكيد طلبك
          </p>
        </div>

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

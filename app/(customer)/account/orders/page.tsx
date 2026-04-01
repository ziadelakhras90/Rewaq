// app/(customer)/account/orders/page.tsx
// Server Component — يجلب طلبات العميل

import { redirect }        from 'next/navigation'
import type { Metadata }   from 'next'
import Link                from 'next/link'
import { createClient }    from '@/lib/supabase/server'
import { getCustomerOrders } from '@/services/order.service'
import { OrdersList }      from '@/components/account/orders-list'

export const metadata: Metadata = {
  title: 'طلباتي — رِواق',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/account/orders')

  const orders = await getCustomerOrders(user.id)

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 hover:border-stone-300 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-stone-900">طلباتي</h1>
            <p className="text-sm text-stone-400">سجل جميع مشترياتك</p>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────── */}
        {orders.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          <OrdersList orders={orders} />
        )}

      </div>
    </div>
  )
}

function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
        <svg className="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2
               M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2
               M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-stone-700">لا توجد طلبات بعد</h2>
      <p className="mt-1 text-sm text-stone-400">ستظهر طلباتك هنا بمجرد إتمام أول عملية شراء</p>
      <Link
        href="/marketplace"
        className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition"
      >
        تسوّق الآن
      </Link>
    </div>
  )
}

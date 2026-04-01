// app/(customer)/account/orders/[orderNumber]/page.tsx
// Server Component — تفاصيل طلب واحد

import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrderDetails } from '@/services/order.service'
import { OrderDetailsView } from '@/components/account/order-details'

interface PageProps {
  params: Promise<{ orderNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params
  return {
    title: `طلب ${orderNumber} — رِواق`,
  }
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { orderNumber } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/account/orders/${orderNumber}`)

  const order = await getOrderDetails(orderNumber, user.id)
  if (!order) notFound()

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/account/orders"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-sm text-stone-400">العودة إلى الطلبات</p>
        </div>

        <OrderDetailsView order={order} />
      </div>
    </div>
  )
}

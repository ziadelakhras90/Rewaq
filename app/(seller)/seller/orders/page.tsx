import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerOrders } from '@/services/seller-orders.service'
import { getSellerStore } from '@/services/seller.service'
import { SellerNav } from '@/components/seller/seller-nav'
import { SellerOrdersList } from '@/components/seller/seller-orders-list'
import type { OrderStatus } from '@/types/api.types'

export const metadata: Metadata = {
  title: 'طلبات المتجر — رِواق',
}

interface PageProps {
  searchParams?: Promise<{ status?: string }>
}

export default async function SellerOrdersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/seller/orders')

  const store = await getSellerStore(supabase, user.id)
  if (!store) redirect('/seller/status')

  const orders = await getSellerOrders(supabase, user.id)
  const statusFilter = resolvedSearchParams?.status?.trim()
  const filteredOrders = filterOrdersByStatus(orders, statusFilter)

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <SellerNav />
        <div>
          <h1 className="text-2xl font-bold text-stone-900">طلبات المتجر</h1>
          <p className="mt-1 text-sm text-stone-500">تابع الطلبات الواردة لمنتجات متجرك وحدّث حالتها.</p>
        </div>
        <SellerOrdersList orders={filteredOrders} />
      </div>
    </div>
  )
}

function filterOrdersByStatus<T extends { status: OrderStatus | string }>(orders: T[], status?: string): T[] {
  if (!status) return orders
  if (status === 'active') {
    return orders.filter((order) => ['confirmed', 'processing', 'shipped'].includes(order.status))
  }
  return orders.filter((order) => order.status === status)
}

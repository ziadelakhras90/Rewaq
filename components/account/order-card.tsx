// components/account/order-card.tsx

import Link from 'next/link'
import { OrderStatusBadge } from './order-status-badge'
import type { OrderSummary } from '@/services/order.service'
import { formatDate, formatCurrency } from '@/lib/utils/arabic'

interface OrderCardProps {
  order: OrderSummary
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/account/orders/${order.order_number}`}
      className="
        block rounded-2xl border border-stone-200 bg-white p-5
        hover:border-amber-300 hover:shadow-sm transition
      "
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* ── رقم الطلب + التاريخ ──────────────────────────────────────── */}
        <div className="space-y-1">
          <p className="font-mono text-sm font-bold tracking-wide text-stone-800">
            {order.order_number}
          </p>
          <p className="text-xs text-stone-400">
            {formatDate(order.created_at)}
          </p>
        </div>

        {/* ── الحالة ──────────────────────────────────────────────────── */}
        <OrderStatusBadge status={order.status} />
      </div>

      {/* ── عدد العناصر + المجموع ────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
        <p className="text-xs text-stone-500">
          {order.item_count}{' '}
          {order.item_count === 1 ? 'منتج' : 'منتجات'}
        </p>
        <p className="text-sm font-bold text-stone-800">
          {formatCurrency(order.total_amount)}
        </p>
      </div>
    </Link>
  )
}

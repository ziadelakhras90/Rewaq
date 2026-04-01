'use client'

// components/account/orders-list.tsx

import { useState } from 'react'
import { OrderCard } from './order-card'
import type { OrderSummary } from '@/services/order.service'

interface OrdersListProps {
  orders: OrderSummary[]
}

type SortKey = 'newest' | 'oldest' | 'highest'

export function OrdersList({ orders }: OrdersListProps) {
  const [sort, setSort] = useState<SortKey>('newest')

  const sorted = [...orders].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sort === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    // highest
    return b.total_amount - a.total_amount
  })

  return (
    <div className="space-y-4">
      {/* ── Sort ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">
          {orders.length} {orders.length === 1 ? 'طلب' : 'طلبات'}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="
            rounded-xl border border-stone-200 bg-white px-3 py-2
            text-sm text-stone-700 focus:border-amber-400
            focus:outline-none focus:ring-2 focus:ring-amber-400/20
          "
        >
          <option value="newest">الأحدث أولًا</option>
          <option value="oldest">الأقدم أولًا</option>
          <option value="highest">الأعلى قيمة</option>
        </select>
      </div>

      {/* ── List ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {sorted.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  )
}

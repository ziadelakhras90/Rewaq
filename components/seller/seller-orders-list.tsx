import Link from 'next/link'
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS } from '@/lib/utils/arabic'
import type { SellerOrderSummary } from '@/services/seller-orders.service'

export function SellerOrdersList({ orders }: { orders: SellerOrderSummary[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-200 bg-white px-6 py-16 text-center">
        <h2 className="text-lg font-bold text-stone-800">لا توجد طلبات حتى الآن</h2>
        <p className="mt-2 text-sm text-stone-400">ستظهر هنا الطلبات الواردة من منتجات متجرك.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-stone-400">رقم الطلب</p>
              <h3 className="mt-1 text-lg font-bold text-stone-900">{order.order_number}</h3>
              <p className="mt-2 text-sm text-stone-500">العميل: {order.delivery_name}</p>
            </div>
            <div className="text-left">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
              <p className="mt-3 text-sm font-semibold text-stone-800">{formatCurrency(order.total_amount)}</p>
              <p className="mt-1 text-xs text-stone-400">{formatDateTime(order.created_at)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 text-sm text-stone-500">
            <p>{order.item_count} {order.item_count === 1 ? 'عنصر' : 'عناصر'}</p>
            <Link href={`/seller/orders/${order.order_number}`} className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-700 hover:border-stone-300">تفاصيل الطلب</Link>
          </div>
        </div>
      ))}
    </div>
  )
}

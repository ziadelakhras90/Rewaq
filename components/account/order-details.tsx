import { OrderStatusBadge } from './order-status-badge'
import { formatDateTime, formatCurrency, getOrderStatusLabel } from '@/lib/utils/arabic'
import type { OrderDetails } from '@/services/order.service'
import type { Database } from '@/types/database.types'

interface OrderDetailsProps {
  order: OrderDetails
}

type HistoryRow = Database['public']['Tables']['order_status_history']['Row']

export function OrderDetailsView({ order }: OrderDetailsProps) {
  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">طلب رقم {order.order_number}</h1>
          <p className="mt-1 text-sm text-stone-400">{formatDateTime(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.stores && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-stone-700">المتجر</h2>
          <p className="text-sm text-stone-800">{order.stores.name}</p>
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-stone-700">عنوان التوصيل</h2>
        <div className="space-y-1 text-sm text-stone-600">
          <p className="font-semibold text-stone-800">{order.delivery_name}</p>
          <p>{order.delivery_phone}</p>
          <p>{[order.delivery_city, order.delivery_district, order.delivery_street].filter(Boolean).join(' — ')}</p>
          {order.delivery_notes && <p className="text-xs text-stone-400">ملاحظة: {order.delivery_notes}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-stone-700">المنتجات ({order.order_items.length})</h2>
        <div className="divide-y divide-stone-100">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-stone-800">{item.product_name}</p>
                {item.product_sku && <p className="text-xs text-stone-400">SKU: {item.product_sku}</p>}
                <p className="text-xs text-stone-500">{formatCurrency(item.unit_price)} × {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-stone-800">{formatCurrency(item.total_price)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-stone-700">ملخص الفاتورة</h2>
        <div className="flex items-center justify-between text-sm text-stone-600">
          <span>المجموع الفرعي</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-stone-600">
          <span>رسوم التوصيل</span>
          <span>{order.delivery_fee === 0 ? 'مجاني' : formatCurrency(order.delivery_fee)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex items-center justify-between text-sm text-emerald-600">
            <span>الخصم</span>
            <span>- {formatCurrency(order.discount_amount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-sm font-bold text-stone-900">
          <span>الإجمالي</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-bold text-stone-700">ملاحظاتك</h2>
          <p className="text-sm text-stone-600">{order.notes}</p>
        </div>
      )}

      {order.order_status_history.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-stone-700">تاريخ الطلب</h2>
          <StatusTimeline history={order.order_status_history} />
        </div>
      )}
    </div>
  )
}

function StatusTimeline({ history }: { history: HistoryRow[] }) {
  return (
    <ol className="relative space-y-4 border-s border-stone-200 ps-5">
      {history.map((entry, i) => {
        const isLast = i === history.length - 1
        return (
          <li key={entry.id} className="relative">
            <div className={`absolute -start-[1.15rem] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${isLast ? 'bg-amber-500' : 'bg-stone-300'}`} />
            <p className={`text-sm font-semibold ${isLast ? 'text-stone-900' : 'text-stone-500'}`}>
              {getOrderStatusLabel(entry.new_status)}
            </p>
            <p className="text-xs text-stone-400">{formatDateTime(entry.created_at)}</p>
            {entry.notes && <p className="mt-0.5 text-xs text-stone-500">{entry.notes}</p>}
          </li>
        )
      })}
    </ol>
  )
}

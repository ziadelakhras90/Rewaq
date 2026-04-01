import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS } from '@/lib/utils/arabic'
import type { SellerOrderDetails } from '@/services/seller-orders.service'
import { SellerOrderStatusForm } from './seller-order-status-form'

export function SellerOrderDetailsView({ order }: { order: SellerOrderDetails }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr),360px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-stone-400">رقم الطلب</p>
              <h1 className="mt-1 text-2xl font-bold text-stone-900">{order.order_number}</h1>
            </div>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700">{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info label="تاريخ الإنشاء" value={formatDateTime(order.created_at)} />
            <Info label="طريقة الدفع" value={order.payment_method === 'cash_on_delivery' ? 'الدفع عند الاستلام' : order.payment_method} />
            <Info label="اسم المستلم" value={order.delivery_name} />
            <Info label="رقم الجوال" value={order.delivery_phone} />
            <Info label="المدينة" value={order.delivery_city} />
            <Info label="الحي / الشارع" value={`${order.delivery_district ?? '—'} / ${order.delivery_street ?? '—'}`} />
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">العناصر</h2>
          <div className="mt-4 space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-stone-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-stone-900">{item.product_name}</p>
                  <p className="mt-1 text-sm text-stone-400">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                </div>
                <p className="font-semibold text-stone-900">{formatCurrency(item.total_price)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">سجل الحالة</h2>
          <div className="mt-4 space-y-4">
            {order.order_status_history.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-amber-400" />
                <div>
                  <p className="font-semibold text-stone-800">{ORDER_STATUS_LABELS[item.new_status] ?? item.new_status}</p>
                  <p className="text-xs text-stone-400">{formatDateTime(item.created_at)}</p>
                  {item.notes && <p className="mt-1 text-sm text-stone-500">{item.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <SellerOrderStatusForm orderId={order.id} currentStatus={order.status} />
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-stone-900">ملخص الطلب</h3>
          <div className="mt-4 space-y-3 text-sm text-stone-600">
            <Row label="المجموع الفرعي" value={formatCurrency(order.subtotal)} />
            <Row label="رسوم التوصيل" value={formatCurrency(order.delivery_fee)} />
            <Row label="الخصم" value={formatCurrency(order.discount_amount)} />
            <Row label="الإجمالي" value={formatCurrency(order.total_amount)} strong />
          </div>
        </section>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-800">{value}</p>
    </div>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className={strong ? 'font-bold text-stone-900' : 'font-semibold text-stone-800'}>{value}</span>
    </div>
  )
}

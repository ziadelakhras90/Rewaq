// app/(admin)/admin/orders/[orderNumber]/page.tsx
// تفاصيل طلب — admin view كاملة بدون قيود customer_id

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminOrderDetails } from '@/services/admin.service'
import { OrderStatusBadge } from '@/components/account/order-status-badge'
import {
  formatDateTime,
  formatCurrency,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/utils/arabic'
import type { Database } from '@/types/database.types'

type HistoryRow = Database['public']['Tables']['order_status_history']['Row']

interface PageProps {
  params: Promise<{ orderNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params
  return { title: `طلب ${orderNumber} — لوحة إدارة رِواق` }
}

export default async function AdminOrderDetailsPage({ params }: PageProps) {
  const { orderNumber } = await params
  const order = await getAdminOrderDetails(orderNumber)
  if (!order) notFound()

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-sm text-stone-400">العودة إلى الطلبات</p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">طلب رقم {order.order_number}</h1>
          <p className="mt-1 text-sm text-stone-400">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <span
            className={`
              inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
              ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : ''}
              ${order.payment_status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
              ${order.payment_status === 'refunded' ? 'bg-stone-100 text-stone-600' : ''}
            `}
          >
            💳 {getPaymentStatusLabel(order.payment_status)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {order.stores && (
            <section className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold text-stone-700">المتجر</h2>
              <p className="text-sm font-semibold text-stone-800">{order.stores.name}</p>
              <p className="mt-0.5 font-mono text-xs text-stone-400">{order.stores.slug}</p>
            </section>
          )}

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-stone-700">بيانات العميل</h2>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-stone-800">{order.delivery_name}</p>
              <p className="text-stone-500">{order.delivery_phone}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-stone-700">عنوان التوصيل</h2>
            <div className="space-y-0.5 text-sm text-stone-600">
              <p>
                {[order.delivery_city, order.delivery_district, order.delivery_street]
                  .filter(Boolean)
                  .join(' — ')}
              </p>
              {order.delivery_notes && (
                <p className="text-xs text-stone-400">ملاحظة: {order.delivery_notes}</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-bold text-stone-700">المنتجات ({order.order_items.length})</h2>
            <div className="divide-y divide-stone-100">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-stone-800">{item.product_name}</p>
                    {item.product_sku && (
                      <p className="text-xs text-stone-400">SKU: {item.product_sku}</p>
                    )}
                    <p className="text-xs text-stone-500">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-stone-800">
                    {formatCurrency(item.total_price)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {order.notes && (
            <section className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-2 text-sm font-bold text-stone-700">ملاحظات العميل</h2>
              <p className="text-sm text-stone-600">{order.notes}</p>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <section className="space-y-2.5 rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-bold text-stone-700">ملخص الفاتورة</h2>
            <Row label="المجموع الفرعي" value={formatCurrency(order.subtotal)} />
            <Row
              label="رسوم التوصيل"
              value={order.delivery_fee === 0 ? 'مجاني' : formatCurrency(order.delivery_fee)}
            />
            {order.discount_amount > 0 && (
              <Row
                label="الخصم"
                value={`- ${formatCurrency(order.discount_amount)}`}
                valueClass="text-emerald-600"
              />
            )}
            <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-sm font-bold text-stone-900">
              <span>الإجمالي</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>طريقة الدفع</span>
              <span>
                {order.payment_method === 'cash_on_delivery'
                  ? 'الدفع عند الاستلام'
                  : order.payment_method}
              </span>
            </div>
          </section>

          <section className="space-y-1.5 rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400">معرّفات</p>
            <IdRow label="Order ID" value={order.id} />
            <IdRow label="Customer ID" value={order.customer_id} />
            <IdRow label="Store ID" value={order.store_id} />
          </section>

          {order.order_status_history.length > 0 && (
            <section className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-bold text-stone-700">تاريخ الحالة</h2>
              <StatusTimeline history={order.order_status_history} />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  valueClass = 'text-stone-700',
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-400">{label}</p>
      <p className="break-all font-mono text-xs text-stone-600">{value}</p>
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
            <div
              className={`
                absolute -start-[1.15rem] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white
                ${isLast ? 'bg-amber-500' : 'bg-stone-300'}
              `}
            />
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

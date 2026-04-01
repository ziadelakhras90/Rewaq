// app/(admin)/admin/page.tsx
// Admin Dashboard — الإحصائيات + آخر الطلبات + آخر الطلبات

import type { Metadata }      from 'next'
import Link                   from 'next/link'
import { getDashboardData }   from '@/services/admin.service'
import { AdminStatsCards }    from '@/components/admin/admin-stats-cards'
import { OrderStatusBadge }   from '@/components/account/order-status-badge'
import { formatDate, formatCurrency, getApplicationStatusLabel } from '@/lib/utils/arabic'

export const metadata: Metadata = { title: 'لوحة الإدارة — رِواق' }

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div dir="rtl" className="space-y-8">

      {/* ── Title ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-stone-900">لوحة الإدارة</h1>
        <p className="text-sm text-stone-400">نظرة عامة على حالة المنصة</p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <AdminStatsCards stats={data} />

      {/* ── Two columns ───────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Recent applications ───────────────────────────────────────── */}
        <section className="rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="text-sm font-bold text-stone-800">آخر طلبات البائعين</h2>
            <Link href="/admin/seller-applications" className="text-xs text-amber-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          {data.recentApplications.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-stone-400">لا توجد طلبات</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.recentApplications.map((app) => (
                <li key={app.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{app.store_name}</p>
                    <p className="text-xs text-stone-400">
                      {app.profiles?.full_name ?? '—'} · {formatDate(app.created_at)}
                    </p>
                  </div>
                  <span className={`
                    shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${app.status === 'pending'  ? 'bg-amber-100 text-amber-800'   : ''}
                    ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${app.status === 'rejected' ? 'bg-rose-100 text-rose-800'    : ''}
                  `}>
                    {getApplicationStatusLabel(app.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Recent orders ─────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <h2 className="text-sm font-bold text-stone-800">آخر الطلبات</h2>
            <Link href="/admin/orders" className="text-xs text-amber-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-stone-400">لا توجد طلبات</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <Link
                      href={`/admin/orders/${order.order_number}`}
                      className="text-sm font-mono font-bold text-amber-600 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                    <p className="text-xs text-stone-400">
                      {order.stores?.name ?? '—'} · {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-xs font-bold text-stone-700">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  )
}

'use client'

// components/admin/admin-orders-table.tsx

import { useState, useMemo } from 'react'
import Link                  from 'next/link'
import { formatDate, formatCurrency, getOrderStatusLabel } from '@/lib/utils/arabic'
import { OrderStatusBadge }  from '@/components/account/order-status-badge'
import type { AdminOrderSummary } from '@/services/admin.service'

interface AdminOrdersTableProps {
  orders: AdminOrderSummary[]
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter,  setStoreFilter]  = useState('all')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')

  // قائمة المتاجر الفريدة للـ filter
  const stores = useMemo(() => {
    const map = new Map<string, string>()
    orders.forEach((o) => {
      if (o.store_id && o.stores?.name) map.set(o.store_id, o.stores.name)
    })
    return [...map.entries()]
  }, [orders])

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      const matchesStore  = storeFilter  === 'all' || o.store_id === storeFilter

      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        o.order_number.toLowerCase().includes(q) ||
        o.delivery_name.toLowerCase().includes(q) ||
        (o.stores?.name ?? '').toLowerCase().includes(q)

      const createdAt = new Date(o.created_at)
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
      const toDate   = dateTo   ? new Date(`${dateTo}T23:59:59.999`) : null
      const matchesDate =
        (!fromDate || createdAt >= fromDate) &&
        (!toDate   || createdAt <= toDate)

      return matchesStatus && matchesStore && matchesSearch && matchesDate
    })
  }, [orders, search, statusFilter, storeFilter, dateFrom, dateTo])

  return (
    <div className="space-y-4">

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم الطلب أو اسم العميل..."
          className="
            w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5
            text-sm text-stone-700 placeholder:text-stone-400
            focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20
            sm:w-72 transition
          "
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
        >
          <option value="all">كل الحالات</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map((s) => (
            <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
          ))}
        </select>
        {stores.length > 0 && (
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">كل المتاجر</option>
            {stores.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          aria-label="من تاريخ"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          aria-label="إلى تاريخ"
        />
        <button
          type="button"
          onClick={() => {
            setSearch('')
            setStatusFilter('all')
            setStoreFilter('all')
            setDateFrom('')
            setDateTo('')
          }}
          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-600 transition hover:bg-stone-50"
        >
          إعادة ضبط
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-12 text-center">
          <p className="text-sm text-stone-400">لا توجد طلبات تطابق الفلتر</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <Th>رقم الطلب</Th>
                <Th>العميل</Th>
                <Th>المتجر</Th>
                <Th>الإجمالي</Th>
                <Th>الحالة</Th>
                <Th>التاريخ</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.order_number}`}
                      className="font-mono text-xs font-bold text-amber-600 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                    <p className="text-xs text-stone-400 mt-0.5">{order.item_count} منتج</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-stone-700">{order.delivery_name}</p>
                    <p className="text-xs text-stone-400">{order.delivery_city}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{order.stores?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-stone-800">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-stone-100 bg-stone-50 px-4 py-2">
            <p className="text-xs text-stone-400">
              {filtered.length} من أصل {orders.length} طلب
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-start font-semibold">{children}</th>
}

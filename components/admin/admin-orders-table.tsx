'use client'

// components/admin/admin-orders-table.tsx
// مع CSV export صحيح يدعم العربي (#4)

import { useState, useMemo }  from 'react'
import Link                   from 'next/link'
import { formatDate, formatCurrency, getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/utils/arabic'
import { OrderStatusBadge }   from '@/components/account/order-status-badge'
import type { AdminOrderSummary } from '@/services/admin.service'

interface AdminOrdersTableProps {
  orders: AdminOrderSummary[]
}

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter,  setStoreFilter]  = useState('all')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')

  const stores = useMemo(() => {
    const map = new Map<string, string>()
    orders.forEach((o) => { if (o.store_id && o.stores?.name) map.set(o.store_id, o.stores.name) })
    return [...map.entries()]
  }, [orders])

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      const matchesStore  = storeFilter  === 'all' || o.store_id === storeFilter
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        o.order_number.toLowerCase().includes(q) ||
        o.delivery_name.toLowerCase().includes(q) ||
        (o.stores?.name ?? '').toLowerCase().includes(q) ||
        (o.delivery_city ?? '').toLowerCase().includes(q)
      const createdAt = new Date(o.created_at)
      const fromDate  = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
      const toDate    = dateTo   ? new Date(`${dateTo}T23:59:59.999`) : null
      const matchesDate = (!fromDate || createdAt >= fromDate) && (!toDate || createdAt <= toDate)
      return matchesStatus && matchesStore && matchesSearch && matchesDate
    })
  }, [orders, search, statusFilter, storeFilter, dateFrom, dateTo])

  // ── CSV Export — دعم كامل للعربي بـ BOM ──────────────────────────────────
  function exportCSV() {
    const activeFilters: string[] = []
    if (search)                        activeFilters.push(`بحث: ${search}`)
    if (statusFilter !== 'all')        activeFilters.push(`الحالة: ${getOrderStatusLabel(statusFilter)}`)
    if (storeFilter  !== 'all') {
      const storeName = stores.find(([id]) => id === storeFilter)?.[1] ?? storeFilter
      activeFilters.push(`المتجر: ${storeName}`)
    }
    if (dateFrom) activeFilters.push(`من: ${dateFrom}`)
    if (dateTo)   activeFilters.push(`إلى: ${dateTo}`)

    const rows: string[][] = []

    // سطر السياق إذا توجد فلاتر
    if (activeFilters.length > 0) {
      rows.push([`الفلاتر المطبقة: ${activeFilters.join(' | ')}`])
      rows.push([]) // سطر فارغ
    }

    // رأس الجدول
    rows.push([
      'رقم الطلب',
      'اسم العميل',
      'المدينة',
      'المتجر',
      'عدد المنتجات',
      'الإجمالي (ج.م)',
      'حالة الطلب',
      'حالة الدفع',
      'تاريخ الطلب',
    ])

    // البيانات
    filtered.forEach((o) => {
      rows.push([
        o.order_number,
        o.delivery_name,
        o.delivery_city ?? '',
        o.stores?.name ?? '',
        String(o.item_count),
        String(Number(o.total_amount).toFixed(2)),
        getOrderStatusLabel(o.status),
        getPaymentStatusLabel(o.payment_status),
        formatDate(o.created_at),
      ])
    })

    // تحويل إلى CSV مع escape صحيح
    const csvContent = rows
      .map((row) =>
        row.map((cell) => {
          const str = String(cell ?? '')
          // نضع quotes إذا احتوى على فاصلة أو quotes أو سطر جديد
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      )
      .join('\r\n')

    // BOM لدعم Excel مع UTF-8 عربي
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `rewq-orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function resetFilters() {
    setSearch(''); setStatusFilter('all'); setStoreFilter('all')
    setDateFrom(''); setDateTo('')
  }

  return (
    <div className="space-y-4">

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم الطلب أو اسم العميل أو المدينة..."
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 sm:w-72 transition"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none">
          <option value="all">كل الحالات</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{getOrderStatusLabel(s)}</option>)}
        </select>
        {stores.length > 0 && (
          <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none">
            <option value="all">كل المتاجر</option>
            {stores.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        )}
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          aria-label="من تاريخ" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          aria-label="إلى تاريخ" />
        <button onClick={resetFilters}
          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition">
          إعادة ضبط
        </button>

        {/* CSV Export */}
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          تصدير CSV
        </button>
      </div>

      {/* Active filters summary */}
      {(statusFilter !== 'all' || storeFilter !== 'all' || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== 'all' && (
            <FilterTag label={`الحالة: ${getOrderStatusLabel(statusFilter)}`} onRemove={() => setStatusFilter('all')} />
          )}
          {storeFilter !== 'all' && (
            <FilterTag label={`المتجر: ${stores.find(([id]) => id === storeFilter)?.[1]}`} onRemove={() => setStoreFilter('all')} />
          )}
          {dateFrom && <FilterTag label={`من: ${dateFrom}`} onRemove={() => setDateFrom('')} />}
          {dateTo   && <FilterTag label={`إلى: ${dateTo}`}  onRemove={() => setDateTo('')} />}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-12 text-center">
          <p className="text-sm text-stone-400">لا توجد طلبات تطابق الفلتر</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
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
                      <Link href={`/admin/orders/${order.order_number}`}
                        className="font-mono text-xs font-bold text-amber-600 hover:underline">
                        {order.order_number}
                      </Link>
                      <p className="mt-0.5 text-xs text-stone-400">{order.item_count} منتج</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-stone-700">{order.delivery_name}</p>
                      <p className="text-xs text-stone-400">{order.delivery_city}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{order.stores?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs text-stone-400">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-4 py-2">
            <p className="text-xs text-stone-400">{filtered.length} من أصل {orders.length} طلب</p>
            <button onClick={exportCSV} disabled={filtered.length === 0}
              className="text-xs text-emerald-600 hover:underline disabled:opacity-40">
              تصدير النتائج CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-start font-semibold">{children}</th>
}

function FilterTag({ label, onRemove }: { label: string | undefined; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
      {label}
      <button onClick={onRemove} className="hover:text-amber-900">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

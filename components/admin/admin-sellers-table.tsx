'use client'

// components/admin/admin-sellers-table.tsx
// مع CSV export + فلتر بالمدينة + تاريخ (#4)

import { useState, useMemo }  from 'react'
import { formatDate, getStoreStatusLabel } from '@/lib/utils/arabic'
import type { AdminSellerRow }             from '@/services/admin.service'

interface AdminSellersTableProps {
  sellers: AdminSellerRow[]
}

const STATUS_CLASSES: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-800',
  suspended: 'bg-rose-100    text-rose-800',
  closed:    'bg-stone-100   text-stone-600',
}

export function AdminSellersTable({ sellers }: AdminSellersTableProps) {
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      const matchesStatus = status === 'all' || s.status === status
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        (s.profiles?.full_name ?? '').toLowerCase().includes(q) ||
        (s.city ?? '').toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)

      const createdAt = new Date(s.created_at)
      const fromDate  = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
      const toDate    = dateTo   ? new Date(`${dateTo}T23:59:59.999`) : null
      const matchesDate = (!fromDate || createdAt >= fromDate) && (!toDate || createdAt <= toDate)

      return matchesStatus && matchesSearch && matchesDate
    })
  }, [sellers, search, status, dateFrom, dateTo])

  function exportCSV() {
    const activeFilters: string[] = []
    if (search)          activeFilters.push(`بحث: ${search}`)
    if (status !== 'all') activeFilters.push(`الحالة: ${getStoreStatusLabel(status)}`)
    if (dateFrom)        activeFilters.push(`من: ${dateFrom}`)
    if (dateTo)          activeFilters.push(`إلى: ${dateTo}`)

    const rows: string[][] = []
    if (activeFilters.length > 0) {
      rows.push([`الفلاتر: ${activeFilters.join(' | ')}`])
      rows.push([])
    }

    rows.push(['اسم المتجر','معرف المتجر','البائع','جوال البائع','المدينة','الحالة','البريد','تاريخ الانضمام'])

    filtered.forEach((s) => {
      rows.push([
        s.name,
        s.id,
        s.profiles?.full_name ?? '',
        s.profiles?.phone ?? '',
        s.city ?? '',
        getStoreStatusLabel(s.status),
        s.email ?? '',
        formatDate(s.created_at),
      ])
    })

    const csv = rows.map((r) =>
      r.map((c) => {
        const str = String(c ?? '')
        return (str.includes(',') || str.includes('"') || str.includes('\n'))
          ? `"${str.replace(/"/g, '""')}"` : str
      }).join(',')
    ).join('\r\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `rewq-sellers-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المتجر أو البائع أو المعرف..."
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 sm:w-72 transition"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none">
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="suspended">موقوف</option>
          <option value="closed">مغلق</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          aria-label="من تاريخ" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          aria-label="إلى تاريخ" />
        <button
          onClick={exportCSV} disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          تصدير CSV
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500">
                <tr>
                  <Th>المتجر</Th>
                  <Th>البائع</Th>
                  <Th>المدينة</Th>
                  <Th>الحالة</Th>
                  <Th>تاريخ الانضمام</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((seller) => (
                  <tr key={seller.id} className="hover:bg-stone-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">{seller.name}</p>
                      {seller.email && <p className="text-xs text-stone-400">{seller.email}</p>}
                      <p className="text-xs font-mono text-stone-300 mt-0.5">{seller.id.slice(0,8)}…</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {seller.profiles?.full_name ?? '—'}
                      {seller.profiles?.phone && <p className="text-xs text-stone-400">{seller.profiles.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{seller.city ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[seller.status] ?? 'bg-stone-100 text-stone-600'}`}>
                        {getStoreStatusLabel(seller.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400">{formatDate(seller.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-4 py-2">
            <p className="text-xs text-stone-400">{filtered.length} من أصل {sellers.length} متجر</p>
            <button onClick={exportCSV} disabled={filtered.length === 0}
              className="text-xs text-emerald-600 hover:underline disabled:opacity-40">
              تصدير CSV
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

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-12 text-center">
      <p className="text-sm text-stone-400">لا توجد نتائج</p>
    </div>
  )
}

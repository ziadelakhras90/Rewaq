'use client'

// components/admin/admin-applications-list.tsx
// مع CSV export للطلبات (#4)

import { useState, useMemo } from 'react'
import { AdminApplicationCard } from './admin-application-card'
import { formatDate, getApplicationStatusLabel } from '@/lib/utils/arabic'
import type { ApplicationWithProfile } from '@/services/admin.service'

interface AdminApplicationsListProps {
  initialApplications: ApplicationWithProfile[]
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'الكل' },
  { key: 'pending',  label: 'بانتظار المراجعة' },
  { key: 'approved', label: 'موافق عليها' },
  { key: 'rejected', label: 'مرفوضة' },
]

export function AdminApplicationsList({ initialApplications }: AdminApplicationsListProps) {
  const [apps,    setApps]    = useState<ApplicationWithProfile[]>(initialApplications)
  const [filter,  setFilter]  = useState<FilterTab>('all')
  const [search,  setSearch]  = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  function handleStatusChange(id: string, newStatus: 'approved' | 'rejected') {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a))
  }

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const matchesTab  = filter === 'all' || a.status === filter
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        a.store_name.toLowerCase().includes(q) ||
        (a.profiles?.full_name ?? '').toLowerCase().includes(q) ||
        (a.city ?? '').toLowerCase().includes(q) ||
        (a.phone ?? '').includes(q)
      const createdAt = new Date(a.created_at)
      const fromDate  = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
      const toDate    = dateTo   ? new Date(`${dateTo}T23:59:59.999`) : null
      const matchesDate = (!fromDate || createdAt >= fromDate) && (!toDate || createdAt <= toDate)
      return matchesTab && matchesSearch && matchesDate
    })
  }, [apps, filter, search, dateFrom, dateTo])

  const counts = {
    all:      apps.length,
    pending:  apps.filter((a) => a.status === 'pending').length,
    approved: apps.filter((a) => a.status === 'approved').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  }

  function exportCSV() {
    const activeFilters: string[] = []
    if (search.trim()) activeFilters.push(`بحث: ${search.trim()}`)
    if (filter !== 'all') activeFilters.push(`الحالة: ${TABS.find((tab) => tab.key === filter)?.label ?? filter}`)
    if (dateFrom) activeFilters.push(`من: ${dateFrom}`)
    if (dateTo) activeFilters.push(`إلى: ${dateTo}`)

    const rows: string[][] = []
    if (activeFilters.length > 0) {
      rows.push([`الفلاتر: ${activeFilters.join(' | ')}`])
      rows.push([])
    }

    rows.push(['اسم المتجر','مقدم الطلب','المدينة','الجوال','نوع النشاط','الحالة','ملاحظات الإدارة','تاريخ التقديم','تاريخ المراجعة'])
    filtered.forEach((a) => {
      rows.push([
        a.store_name,
        a.profiles?.full_name ?? '',
        a.city,
        a.phone,
        a.business_type ?? '',
        getApplicationStatusLabel(a.status),
        a.admin_notes ?? '',
        formatDate(a.created_at),
        a.reviewed_at ? formatDate(a.reviewed_at) : '',
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
    a.download = `rewq-applications-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition
              ${filter === tab.key ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
            {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold
              ${filter === tab.key ? 'bg-amber-400' : 'bg-stone-100 text-stone-500'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search + Date + Export ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المتجر أو مقدم الطلب أو المدينة..."
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 sm:w-64 transition"
        />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          aria-label="من تاريخ" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
          aria-label="إلى تاريخ" />
        <button onClick={exportCSV} disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          تصدير CSV
        </button>
      </div>

      {(search || filter !== 'all' || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2">
          {search && <FilterTag label={`بحث: ${search}`} onRemove={() => setSearch('')} />}
          {filter !== 'all' && <FilterTag label={`الحالة: ${TABS.find((tab) => tab.key === filter)?.label ?? filter}`} onRemove={() => setFilter('all')} />}
          {dateFrom && <FilterTag label={`من: ${dateFrom}`} onRemove={() => setDateFrom('')} />}
          {dateTo && <FilterTag label={`إلى: ${dateTo}`} onRemove={() => setDateTo('')} />}
        </div>
      )}

      {/* ── List ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-12 text-center">
          <p className="text-sm text-stone-400">
            {search || dateFrom || dateTo ? 'لا توجد نتائج تطابق البحث' : 'لا توجد طلبات في هذه الفئة'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <AdminApplicationCard key={app.id} application={app} onStatusChange={handleStatusChange} />
          ))}
          <p className="text-xs text-stone-400 text-end">
            {filtered.length} من أصل {apps.length} طلب
          </p>
        </div>
      )}
    </div>
  )
}


function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
    >
      <span>{label}</span>
      <span className="text-stone-400">×</span>
    </button>
  )
}

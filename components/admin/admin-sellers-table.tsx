'use client'

// components/admin/admin-sellers-table.tsx

import { useState, useMemo } from 'react'
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
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      const matchesStatus = status === 'all' || s.status === status
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.profiles?.full_name ?? '').toLowerCase().includes(q) ||
        (s.city ?? '').toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [sellers, search, status])

  return (
    <div className="space-y-4">

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المتجر أو البائع..."
          className="
            w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5
            text-sm text-stone-700 placeholder:text-stone-400
            focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20
            sm:w-72 transition
          "
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="suspended">موقوف</option>
          <option value="closed">مغلق</option>
        </select>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <Th>المتجر</Th>
                <Th>البائع</Th>
                <Th>المدينة</Th>
                <Th>الحالة</Th>
                <Th>تاريخ الإنشاء</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((seller) => (
                <tr key={seller.id} className="hover:bg-stone-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{seller.name}</p>
                    {seller.email && (
                      <p className="text-xs text-stone-400">{seller.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {seller.profiles?.full_name ?? '—'}
                    {seller.profiles?.phone && (
                      <p className="text-xs text-stone-400">{seller.profiles.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{seller.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[seller.status] ?? 'bg-stone-100 text-stone-600'}`}>
                      {getStoreStatusLabel(seller.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {formatDate(seller.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-stone-100 bg-stone-50 px-4 py-2">
            <p className="text-xs text-stone-400">
              {filtered.length} من أصل {sellers.length} متجر
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

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-12 text-center">
      <p className="text-sm text-stone-400">لا توجد نتائج</p>
    </div>
  )
}

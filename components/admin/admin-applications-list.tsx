'use client'

// components/admin/admin-applications-list.tsx

import { useState }                  from 'react'
import { AdminApplicationCard }      from './admin-application-card'
import type { ApplicationWithProfile } from '@/services/admin.service'

interface AdminApplicationsListProps {
  initialApplications: ApplicationWithProfile[]
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'الكل'     },
  { key: 'pending',  label: 'بانتظار المراجعة' },
  { key: 'approved', label: 'موافق عليها' },
  { key: 'rejected', label: 'مرفوضة'  },
]

export function AdminApplicationsList({ initialApplications }: AdminApplicationsListProps) {
  const [apps,   setApps]   = useState<ApplicationWithProfile[]>(initialApplications)
  const [filter, setFilter] = useState<FilterTab>('all')

  function handleStatusChange(id: string, newStatus: 'approved' | 'rejected') {
    setApps((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: newStatus } : a)
    )
  }

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter)

  // تعداد كل فئة
  const counts = {
    all:      apps.length,
    pending:  apps.filter((a) => a.status === 'pending').length,
    approved: apps.filter((a) => a.status === 'approved').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="space-y-5">

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`
              flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition
              ${filter === tab.key
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }
            `}
          >
            {tab.label}
            <span className={`
              rounded-full px-1.5 py-0.5 text-xs font-bold
              ${filter === tab.key ? 'bg-amber-400' : 'bg-stone-100 text-stone-500'}
            `}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── List ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-12 text-center">
          <p className="text-sm text-stone-400">لا توجد طلبات في هذه الفئة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <AdminApplicationCard
              key={app.id}
              application={app}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

    </div>
  )
}

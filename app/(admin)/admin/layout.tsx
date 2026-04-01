// app/(admin)/admin/layout.tsx
// Admin layout مع nav مشترك

import type { ReactNode } from 'react'
import Link               from 'next/link'
import { AdminNav }       from '@/components/admin/admin-nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link
              href="/admin"
              className="text-sm font-bold text-stone-800 hover:text-amber-600 transition"
            >
              🛡️ لوحة إدارة رِواق
            </Link>
            <AdminNav />
            <Link
              href="/"
              className="text-xs text-stone-400 hover:text-stone-600 transition"
            >
              عرض الموقع
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>

    </div>
  )
}

import type { ReactNode } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/layout/site-header'
import { AdminNav } from '@/components/admin/admin-nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <SiteHeader />
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/admin" className="text-sm font-bold text-stone-800 hover:text-amber-600 transition">
              🛡️ لوحة إدارة Rewq
            </Link>
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}

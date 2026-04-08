'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DesktopNav, MobileNav } from './main-navigation'
import { useCurrentStore } from './current-store-context'

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentStore } = useCurrentStore()

  return (
    <>
      <header dir="rtl" className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="shrink-0">
              <BrandCluster currentStore={currentStore} />
            </div>

            <div className="hidden flex-1 justify-start md:flex">
              <DesktopNav />
            </div>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition md:hidden"
              aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {mobileOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)} />
          <div dir="rtl" className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-stone-200 bg-white shadow-lg md:hidden">
            <div className="border-b border-stone-100 px-4 py-3">
              <BrandCluster currentStore={currentStore} compact />
            </div>
            <MobileNav onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}

function BrandCluster({ currentStore, compact = false }: { currentStore: { name: string; slug?: string | null } | null; compact?: boolean }) {
  return (
    <div className={`flex ${compact ? 'flex-col items-start gap-2' : 'items-center gap-2 sm:gap-3'}`}>
      <Link
        href="/marketplace"
        className="inline-flex items-center rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm font-black tracking-tight text-stone-900 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
      >
        Rewq
      </Link>

      {currentStore?.name && (
        <>
          {!compact && <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block" />}
          <Link
            href={currentStore.slug ? `/stores/${currentStore.slug}` : '/stores'}
            className="inline-flex max-w-[180px] items-center rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-200 hover:bg-amber-100"
            title={currentStore.name}
          >
            <span className="truncate">{currentStore.name}</span>
          </Link>
        </>
      )}
    </div>
  )
}

function MenuIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
}
function XIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
}

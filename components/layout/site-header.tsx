'use client'

// components/layout/site-header.tsx
// Header عام للصفحات العامة

import { useState }       from 'react'
import Link               from 'next/link'
import { DesktopNav, MobileNav } from './main-navigation'

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header
        dir="rtl"
        className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── Logo ────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="shrink-0 text-xl font-black text-stone-900 hover:text-amber-600 transition"
            >
              رِواق
            </Link>

            {/* ── Desktop nav ─────────────────────────────────────────── */}
            <div className="hidden md:flex">
              <DesktopNav />
            </div>

            {/* ── Mobile: hamburger ───────────────────────────────────── */}
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

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div
            dir="rtl"
            className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-stone-200 bg-white shadow-lg md:hidden"
          >
            <MobileNav onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

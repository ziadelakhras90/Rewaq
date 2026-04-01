// components/admin/admin-nav.tsx

import Link     from 'next/link'
import type { ReactNode } from 'react'

interface NavItem {
  href:  string
  label: string
  icon:  ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    href:  '/admin',
    label: 'لوحة التحكم',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5z
             M4 16a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3z
             M14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5z
             M14 14a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-5z" />
      </svg>
    ),
  },
  {
    href:  '/admin/seller-applications',
    label: 'طلبات البائعين',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586
             a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
      </svg>
    ),
  },
  {
    href:  '/admin/sellers',
    label: 'البائعون',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5
             m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2
             a1 1 0 0 1 1 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href:  '/admin/orders',
    label: 'الطلبات',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7
             a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2
             M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
      </svg>
    ),
  },
  {
    href:  '/admin/categories',
    label: 'التصنيفات',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7
             a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7
             A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" />
      </svg>
    ),
  },
]

export function AdminNav() {
  return (
    <nav dir="rtl" className="flex items-center gap-1 overflow-x-auto">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="
            flex shrink-0 items-center gap-2 rounded-xl px-3 py-2
            text-sm font-medium text-stone-600
            hover:bg-stone-100 hover:text-stone-900 transition
          "
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

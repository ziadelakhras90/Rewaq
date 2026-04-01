'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const items = [
  { href: '/seller', label: 'الرئيسية' },
  { href: '/seller/products', label: 'المنتجات' },
  { href: '/seller/orders', label: 'الطلبات' },
  { href: '/seller/settings', label: 'الإعدادات' },
]

export function SellerNav() {
  const pathname = usePathname()

  return (
    <nav className="overflow-x-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max items-center gap-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                active ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

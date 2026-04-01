// app/(public)/layout.tsx
// Layout مشترك للصفحات العامة — يُضيف SiteHeader + SiteFooter

import type { ReactNode } from 'react'
import { SiteHeader }    from '@/components/layout/site-header'
import { SiteFooter }    from '@/components/layout/site-footer'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100dvh-4rem)]">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}

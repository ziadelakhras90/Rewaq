import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/layout/site-header'

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100dvh-4rem)]">
        {children}
      </main>
    </>
  )
}

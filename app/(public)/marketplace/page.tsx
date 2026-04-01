// app/(public)/marketplace/page.tsx
// Server Component — يقرأ searchParams ويمرّرها لـ CatalogPage

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CatalogPage } from '@/components/catalog/catalog-page'
import { getActiveCategories } from '@/services/catalog.service'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'تصفح المنتجات — رِواق',
  description: 'اكتشف منتجات مميزة من متاجر عربية متنوعة في رِواق',
}

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    store?: string
    min_price?: string
    max_price?: string
    sort?: string
    page?: string
  }>
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const categories = await getActiveCategories(supabase)

  return (
    <Suspense fallback={null}>
      <CatalogPage searchParams={resolvedSearchParams} categories={categories} />
    </Suspense>
  )
}

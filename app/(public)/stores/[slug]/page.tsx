export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CatalogPage } from '@/components/catalog/catalog-page'
import { getActiveCategories, getActiveStores, getStoreBySlug } from '@/services/catalog.service'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    q?: string
    category?: string
    min_price?: string
    max_price?: string
    sort?: string
    page?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const store = await getStoreBySlug(supabase, slug)

  if (!store) {
    return { title: 'متجر غير موجود — Rewq' }
  }

  return {
    title: `${store.name} — Rewq`,
    description: store.description ?? `تصفح منتجات ${store.name} داخل Rewq`,
  }
}

export default async function StorePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  const [store, categories, stores] = await Promise.all([
    getStoreBySlug(supabase, slug),
    getActiveCategories(supabase),
    getActiveStores(supabase),
  ])

  if (!store) notFound()

  return (
    <CatalogPage
      searchParams={{ ...resolvedSearchParams, store: store.id }}
      categories={categories}
      stores={stores}
      currentStore={store}
      fixedStoreId={store.id}
    />
  )
}

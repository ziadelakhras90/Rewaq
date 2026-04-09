'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProducts, type ProductListItem, type PaginatedProducts, type StoreListItem } from '@/services/catalog.service'
import { CatalogSearch } from './catalog-search'
import { CatalogFilters } from './catalog-filters'
import { ProductGrid } from './product-grid'
import { CurrentStoreBridge } from '@/components/layout/current-store-bridge'

interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'featured'

interface CatalogPageProps {
  searchParams: {
    q?: string
    category?: string
    store?: string
    min_price?: string
    max_price?: string
    sort?: string
    page?: string
  }
  categories: Category[]
  stores: StoreListItem[]
  currentStore?: StoreListItem | null
  fixedStoreId?: string | null
}

export function CatalogPage({ searchParams, categories, stores, currentStore = null, fixedStoreId = null }: CatalogPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const supabase = createClient()
  const [, startTransition] = useTransition()

  const [result, setResult] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const query = params.get('q') ?? ''
  const categoryId = params.get('category') ?? ''
  const selectedStoreId = fixedStoreId ?? params.get('store') ?? ''
  const minPrice = params.get('min_price') ?? ''
  const maxPrice = params.get('max_price') ?? ''
  const sort = (params.get('sort') ?? 'newest') as SortOption
  const page = parseInt(params.get('page') ?? '1', 10)

  const effectiveCurrentStore = currentStore ?? stores.find((store) => store.id === selectedStoreId) ?? null

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts(supabase, {
        search: query || undefined,
        categoryId: categoryId || undefined,
        storeId: selectedStoreId || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        isFeatured: sort === 'featured' ? true : undefined,
        sort,
        page,
        pageSize: 24,
      })
      setResult(data)
    } catch {
      setError('حدث خطأ في تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }, [query, categoryId, selectedStoreId, minPrice, maxPrice, sort, page, supabase])

  useEffect(() => { void fetchProducts() }, [fetchProducts])

  const updateParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (fixedStoreId && key === 'store') return
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    startTransition(() => { router.push(`${pathname}?${next.toString()}`, { scroll: false }) })
  }, [params, pathname, router, fixedStoreId])

  const handleSearch = (q: string) => updateParam('q', q)
  const handleCategory = (id: string) => updateParam('category', id)
  const handleStore = (id: string) => updateParam('store', id)
  const handleSort = (s: SortOption) => updateParam('sort', s)
  const handlePage = (p: number) => updateParam('page', String(p))
  const handleMinPrice = (v: string) => updateParam('min_price', v)
  const handleMaxPrice = (v: string) => updateParam('max_price', v)

  const handleClearFilters = () => {
    const next = new URLSearchParams()
    if (fixedStoreId) next.set('store', fixedStoreId)
    startTransition(() => { router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname, { scroll: false }) })
  }

  const hasActiveFilters = !!(query || categoryId || minPrice || maxPrice || (!fixedStoreId && selectedStoreId))

  return (
    <div className="min-h-screen bg-stone-50" dir="rtl">
      <CurrentStoreBridge
        store={effectiveCurrentStore ? { id: effectiveCurrentStore.id, name: effectiveCurrentStore.name, slug: effectiveCurrentStore.slug } : null}
      />

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-stone-400">
                <span>تصفح المنتجات</span>
                {effectiveCurrentStore && (
                  <>
                    <span>/</span>
                    <Link href={`/stores/${effectiveCurrentStore.slug}`} className="font-medium text-amber-700 hover:text-amber-800 transition">
                      {effectiveCurrentStore.name}
                    </Link>
                  </>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
                {effectiveCurrentStore ? `منتجات ${effectiveCurrentStore.name}` : 'تصفح المنتجات'}
              </h1>
              {result && !loading && (
                <p className="mt-1 text-sm text-stone-500">{result.total.toLocaleString('ar-EG')} منتج</p>
              )}
            </div>

            <div className="w-full sm:max-w-sm">
              <CatalogSearch value={query} onChange={handleSearch} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <CatalogFilters
              categories={categories}
              stores={stores}
              selectedCategory={categoryId}
              selectedStore={selectedStoreId}
              selectedSort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              hasActiveFilters={hasActiveFilters}
              storeLocked={Boolean(fixedStoreId)}
              onCategoryChange={handleCategory}
              onStoreChange={handleStore}
              onSortChange={handleSort}
              onMinPriceChange={handleMinPrice}
              onMaxPriceChange={handleMaxPrice}
              onClearFilters={handleClearFilters}
            />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between lg:justify-end">
              <MobileFiltersButton
                categories={categories}
                stores={stores}
                selectedCategory={categoryId}
                selectedStore={selectedStoreId}
                selectedSort={sort}
                minPrice={minPrice}
                maxPrice={maxPrice}
                hasActiveFilters={hasActiveFilters}
                storeLocked={Boolean(fixedStoreId)}
                onCategoryChange={handleCategory}
                onStoreChange={handleStore}
                onSortChange={handleSort}
                onMinPriceChange={handleMinPrice}
                onMaxPriceChange={handleMaxPrice}
                onClearFilters={handleClearFilters}
              />
              <SortSelect value={sort} onChange={handleSort} />
            </div>

            <ProductGrid
              products={result?.data ?? []}
              loading={loading}
              error={error}
              pagination={result ? { page: result.page, totalPages: result.totalPages, onPageChange: handlePage } : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_asc', label: 'السعر: الأقل' },
  { value: 'price_desc', label: 'السعر: الأعلى' },
  { value: 'featured', label: 'المميزة' },
]

function SortSelect({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-stone-500">ترتيب:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function MobileFiltersButton(props: React.ComponentProps<typeof CatalogFilters>) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 shadow-sm">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M10 20h4" /></svg>
        الفلاتر
        {props.hasActiveFilters && <span className="flex h-2 w-2 rounded-full bg-amber-500" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ms-auto flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 p-4">
              <span className="font-semibold text-stone-800">الفلاتر</span>
              <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <CatalogFilters {...props} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

// components/catalog/catalog-page.tsx
// المنسّق الرئيسي لصفحة الكتالوج — يدير الـ state والجلب

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams }          from 'next/navigation'
import { createClient }      from '@/lib/supabase/client'
import { getProducts }       from '@/services/catalog.service'
import { CatalogSearch }     from './catalog-search'
import { CatalogFilters }    from './catalog-filters'
import { ProductGrid }       from './product-grid'
import type { ProductListItem, PaginatedProducts } from '@/services/catalog.service'

// ─────────────────────────────────────────────────────────────────────────────

interface Category {
  id:        string
  name:      string
  slug:      string
  image_url: string | null
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'featured'

interface CatalogPageProps {
  searchParams: {
    q?:         string
    category?:  string
    store?:     string
    min_price?: string
    max_price?: string
    sort?:      string
    page?:      string
  }
  categories: Category[]
}

// ─────────────────────────────────────────────────────────────────────────────

export function CatalogPage({ searchParams, categories }: CatalogPageProps) {
  const router        = useRouter()
  const pathname      = usePathname()
  const params        = useSearchParams()
  const supabase      = createClient()
  const [, startTransition] = useTransition()

  // ── State ─────────────────────────────────────────────────────────────────
  const [result,  setResult]  = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  // قراءة الـ filters من URL
  const query      = params.get('q')          ?? ''
  const categoryId = params.get('category')   ?? ''
  const minPrice   = params.get('min_price')  ?? ''
  const maxPrice   = params.get('max_price')  ?? ''
  const sort       = (params.get('sort')      ?? 'newest') as SortOption
  const page       = parseInt(params.get('page') ?? '1', 10)

  // ── جلب المنتجات عند تغيير أي filter ─────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts(supabase, {
        search:     query      || undefined,
        categoryId: categoryId || undefined,
        minPrice:   minPrice   ? parseFloat(minPrice) : undefined,
        maxPrice:   maxPrice   ? parseFloat(maxPrice) : undefined,
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
  }, [query, categoryId, minPrice, maxPrice, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // ── تحديث URL عند تغيير filter ────────────────────────────────────────────
  const updateParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    // إعادة الصفحة إلى 1 عند تغيير أي filter
    if (key !== 'page') next.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`, { scroll: false })
    })
  }, [params, pathname, router])

  const handleSearch   = (q: string)          => updateParam('q', q)
  const handleCategory = (id: string)         => updateParam('category', id)
  const handleSort     = (s: SortOption)      => updateParam('sort', s)
  const handlePage     = (p: number)          => updateParam('page', String(p))
  const handleMinPrice = (v: string)          => updateParam('min_price', v)
  const handleMaxPrice = (v: string)          => updateParam('max_price', v)

  const handleClearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }

  const hasActiveFilters = !!(query || categoryId || minPrice || maxPrice)

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50" dir="rtl">

      {/* ── رأس الصفحة ──────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                تصفح المنتجات
              </h1>
              {result && !loading && (
                <p className="mt-1 text-sm text-stone-500">
                  {result.total.toLocaleString('ar-SA')} منتج
                </p>
              )}
            </div>

            {/* البحث */}
            <div className="w-full sm:max-w-sm">
              <CatalogSearch
                value={query}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── المحتوى الرئيسي ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">

          {/* ── الشريط الجانبي للفلاتر ─────────────────────────────────── */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <CatalogFilters
              categories={categories}
              selectedCategory={categoryId}
              selectedSort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              hasActiveFilters={hasActiveFilters}
              onCategoryChange={handleCategory}
              onSortChange={handleSort}
              onMinPriceChange={handleMinPrice}
              onMaxPriceChange={handleMaxPrice}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* ── شبكة المنتجات ──────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* فلاتر الموبايل + ترتيب */}
            <div className="mb-6 flex items-center justify-between lg:justify-end">
              {/* زر فلاتر الموبايل */}
              <MobileFiltersButton
                categories={categories}
                selectedCategory={categoryId}
                selectedSort={sort}
                minPrice={minPrice}
                maxPrice={maxPrice}
                hasActiveFilters={hasActiveFilters}
                onCategoryChange={handleCategory}
                onSortChange={handleSort}
                onMinPriceChange={handleMinPrice}
                onMaxPriceChange={handleMaxPrice}
                onClearFilters={handleClearFilters}
              />

              {/* الترتيب — يظهر دائمًا */}
              <SortSelect value={sort} onChange={handleSort} />
            </div>

            <ProductGrid
              products={result?.data ?? []}
              loading={loading}
              error={error}
              pagination={result ? {
                page:       result.page,
                totalPages: result.totalPages,
                onPageChange: handlePage,
              } : undefined}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SortSelect
// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',     label: 'الأحدث' },
  { value: 'price_asc',  label: 'السعر: الأقل' },
  { value: 'price_desc', label: 'السعر: الأعلى' },
  { value: 'featured',   label: 'المميزة' },
]

function SortSelect({
  value,
  onChange,
}: {
  value:    SortOption
  onChange: (v: SortOption) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-stone-500">ترتيب:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MobileFiltersButton — sheet بسيط للموبايل
// ─────────────────────────────────────────────────────────────────────────────

function MobileFiltersButton(props: React.ComponentProps<typeof CatalogFilters>) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 shadow-sm"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 4h18M7 12h10M10 20h4" />
        </svg>
        الفلاتر
        {props.hasActiveFilters && (
          <span className="flex h-2 w-2 rounded-full bg-amber-500" />
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative ms-auto flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 p-4">
              <span className="font-semibold text-stone-800">الفلاتر</span>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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

'use client'

// components/catalog/catalog-filters.tsx
// مع إضافة بحث داخل قائمة التصنيفات (#3)

import { useState }       from 'react'
import { prepareForSearch } from '@/lib/utils/arabic'
import type { SortOption } from './catalog-page'

interface Category { id: string; name: string; slug: string }

export interface CatalogFiltersProps {
  categories:       Category[]
  selectedCategory: string
  selectedSort:     SortOption
  minPrice:         string
  maxPrice:         string
  hasActiveFilters: boolean
  onCategoryChange: (id: string) => void
  onSortChange:     (s: SortOption) => void
  onMinPriceChange: (v: string) => void
  onMaxPriceChange: (v: string) => void
  onClearFilters:   () => void
}

export function CatalogFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  hasActiveFilters,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
}: CatalogFiltersProps) {
  const [catSearch, setCatSearch] = useState('')

  // فلترة التصنيفات بالبحث مع Arabic normalization
  const filteredCats = catSearch.trim()
    ? categories.filter((c) =>
        prepareForSearch(c.name).includes(prepareForSearch(catSearch))
      )
    : categories

  return (
    <div className="space-y-6" dir="rtl">

      {/* ── مسح الكل ──────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex w-full items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100 transition"
        >
          <span>مسح الفلاتر</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* ── التصنيفات + بحث داخلي ──────────────────────────────────────── */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
          التصنيف
        </h3>

        {/* Search inside categories — #3 */}
        {categories.length > 5 && (
          <div className="relative mb-2">
            <input
              type="search"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="ابحث في التصنيفات..."
              className="
                w-full rounded-lg border border-stone-200 bg-stone-50
                py-1.5 pe-3 ps-8 text-xs text-stone-700 placeholder:text-stone-400
                focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20
                transition
              "
            />
            <svg
              className="pointer-events-none absolute inset-y-0 start-2.5 my-auto h-3.5 w-3.5 text-stone-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </div>
        )}

        <div className="space-y-0.5 max-h-60 overflow-y-auto">
          <CategoryBtn label="الكل" active={!selectedCategory} onClick={() => onCategoryChange('')} />
          {filteredCats.length === 0 ? (
            <p className="px-3 py-2 text-xs text-stone-400">لا توجد نتائج</p>
          ) : (
            filteredCats.map((cat) => (
              <CategoryBtn
                key={cat.id}
                label={cat.name}
                active={selectedCategory === cat.id}
                onClick={() => onCategoryChange(selectedCategory === cat.id ? '' : cat.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── نطاق السعر ────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
          السعر
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number" value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="من" min={0}
            className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm text-stone-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
          <span className="text-stone-300">—</span>
          <input
            type="number" value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="إلى" min={0}
            className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm text-stone-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((r) => (
            <button key={r.label}
              onClick={() => { onMinPriceChange(r.min); onMaxPriceChange(r.max) }}
              className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:border-amber-400 hover:text-amber-700 transition"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

function CategoryBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition
        ${active ? 'bg-amber-50 font-medium text-amber-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'}`}
    >
      <span>{label}</span>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
    </button>
  )
}

const PRICE_RANGES = [
  { label: 'أقل من ٥٠', min: '0', max: '50' },
  { label: '٥٠–١٠٠',   min: '50', max: '100' },
  { label: '١٠٠–٢٠٠',  min: '100', max: '200' },
  { label: '+٢٠٠',     min: '200', max: '' },
]

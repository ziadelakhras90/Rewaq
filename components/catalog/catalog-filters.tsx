'use client'

// components/catalog/catalog-filters.tsx

import type { SortOption } from './catalog-page'

interface Category {
  id:   string
  name: string
  slug: string
}

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
  return (
    <div className="space-y-6" dir="rtl">

      {/* ── مسح الكل ────────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex w-full items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100 transition"
        >
          <span>مسح الفلاتر</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* ── التصنيفات ────────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          التصنيف
        </h3>
        <div className="space-y-1">
          <CategoryItem
            label="الكل"
            active={!selectedCategory}
            onClick={() => onCategoryChange('')}
          />
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              label={cat.name}
              active={selectedCategory === cat.id}
              onClick={() => onCategoryChange(
                selectedCategory === cat.id ? '' : cat.id
              )}
            />
          ))}
        </div>
      </div>

      {/* ── نطاق السعر ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          نطاق السعر
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                placeholder="من"
                min={0}
                className="
                  w-full rounded-lg border border-stone-200 bg-white
                  px-3 py-2 text-sm text-stone-700
                  focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20
                "
              />
            </div>
            <span className="text-stone-300">—</span>
            <div className="relative flex-1">
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                placeholder="إلى"
                min={0}
                className="
                  w-full rounded-lg border border-stone-200 bg-white
                  px-3 py-2 text-sm text-stone-700
                  focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20
                "
              />
            </div>
          </div>

          {/* Quick price ranges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  onMinPriceChange(range.min)
                  onMaxPriceChange(range.max)
                }}
                className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:border-amber-400 hover:text-amber-700 transition"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── توافر المخزون ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          التوافر
        </h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
          />
          متوفر في المخزون
        </label>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function CategoryItem({
  label,
  active,
  onClick,
}: {
  label:   string
  active:  boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition
        ${active
          ? 'bg-amber-50 font-medium text-amber-800'
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
        }
      `}
    >
      <span>{label}</span>
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      )}
    </button>
  )
}

const PRICE_RANGES = [
  { label: 'أقل من ٥٠',    min: '0',   max: '50' },
  { label: '٥٠ — ١٠٠',    min: '50',  max: '100' },
  { label: '١٠٠ — ٢٠٠',   min: '100', max: '200' },
  { label: 'أكثر من ٢٠٠', min: '200', max: '' },
]

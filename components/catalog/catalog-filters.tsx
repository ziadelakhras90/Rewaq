'use client'

import { useState } from 'react'
import { prepareForSearch } from '@/lib/utils/arabic'
import type { SortOption } from './catalog-page'

interface Category { id: string; name: string; slug: string }
interface StoreOption { id: string; name: string; slug: string }

export interface CatalogFiltersProps {
  categories: Category[]
  stores: StoreOption[]
  selectedCategory: string
  selectedStore: string
  selectedSort: SortOption
  minPrice: string
  maxPrice: string
  hasActiveFilters: boolean
  storeLocked?: boolean
  onCategoryChange: (id: string) => void
  onStoreChange: (id: string) => void
  onSortChange: (s: SortOption) => void
  onMinPriceChange: (v: string) => void
  onMaxPriceChange: (v: string) => void
  onClearFilters: () => void
}

export function CatalogFilters({
  categories,
  stores,
  selectedCategory,
  selectedStore,
  minPrice,
  maxPrice,
  hasActiveFilters,
  storeLocked = false,
  onCategoryChange,
  onStoreChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
}: CatalogFiltersProps) {
  const [catSearch, setCatSearch] = useState('')
  const [storeSearch, setStoreSearch] = useState('')

  const filteredCats = catSearch.trim()
    ? categories.filter((c) => prepareForSearch(c.name).includes(prepareForSearch(catSearch)))
    : categories

  const filteredStores = storeSearch.trim()
    ? stores.filter((store) => prepareForSearch(store.name).includes(prepareForSearch(storeSearch)))
    : stores

  return (
    <div className="space-y-6" dir="rtl">
      {hasActiveFilters && !storeLocked && (
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

      {!storeLocked && (
        <div>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-400">المتاجر</h3>
          {stores.length > 5 && (
            <div className="relative mb-2">
              <input
                type="search"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="ابحث باسم المتجر..."
                className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pe-3 ps-8 text-xs text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-stone-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 12.15 12.15z" /></svg>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-stone-200 bg-white p-2">
            <div className="max-h-56 space-y-1 overflow-y-auto">
              <button
                onClick={() => onStoreChange('')}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${selectedStore === '' ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <span>كل المتاجر</span>
                {selectedStore === '' && <span className="h-2 w-2 rounded-full bg-amber-500" />}
              </button>

              {filteredStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => onStoreChange(store.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${selectedStore === store.id ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <span className="truncate">{store.name}</span>
                  {selectedStore === store.id && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-400">التصنيف</h3>
        {categories.length > 5 && (
          <div className="relative mb-2">
            <input
              type="search"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="ابحث في التصنيفات..."
              className="w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 pe-3 ps-8 text-xs text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-stone-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 12.15 12.15z" /></svg>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white p-2">
          <div className="max-h-72 space-y-1 overflow-y-auto">
            <button onClick={() => onCategoryChange('')} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${selectedCategory === '' ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-50'}`}>
              <span>الكل</span>
              {selectedCategory === '' && <span className="h-2 w-2 rounded-full bg-amber-500" />}
            </button>
            {filteredCats.map((category) => (
              <button key={category.id} onClick={() => onCategoryChange(category.id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${selectedCategory === category.id ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-50'}`}>
                <span className="truncate">{category.name}</span>
                {selectedCategory === category.id && <span className="h-2 w-2 rounded-full bg-amber-500" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-400">السعر</h3>
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3">
          <div className="grid grid-cols-2 gap-2">
            <input type="number" min="0" inputMode="numeric" value={minPrice} onChange={(e) => onMinPriceChange(e.target.value)} placeholder="من" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20" />
            <input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(e) => onMaxPriceChange(e.target.value)} placeholder="إلى" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20" />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {['أقل من ٥٠', '٥٠ - ١٠٠', '١٠٠ - ٢٠٠', '٢٠٠+'].map((label, idx) => {
              const ranges = [
                ['', '50'],
                ['50', '100'],
                ['100', '200'],
                ['200', ''],
              ] as const
              const [min, max] = ranges[idx]
              return (
                <button
                  key={label}
                  onClick={() => {
                    onMinPriceChange(min)
                    onMaxPriceChange(max)
                  }}
                  className="rounded-full border border-stone-200 px-3 py-1.5 text-stone-500 transition hover:border-amber-300 hover:text-amber-700"
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

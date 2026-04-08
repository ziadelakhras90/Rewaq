'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { prepareForSearch } from '@/lib/utils/arabic'
import type { StoreListItem } from '@/services/catalog.service'

export function StoresDirectory({ stores }: { stores: StoreListItem[] }) {
  const [query, setQuery] = useState('')

  const filteredStores = useMemo(() => {
    const normalized = prepareForSearch(query)
    if (!normalized) return stores
    return stores.filter((store) => prepareForSearch(store.name).includes(normalized))
  }, [stores, query])

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-stone-400">اكتشف المتاجر النشطة داخل المنصة</p>
            <h1 className="mt-1 text-3xl font-black text-stone-900">تصفح المتاجر</h1>
          </div>
          <p className="text-sm text-stone-500">{filteredStores.length.toLocaleString('ar-EG')} متجر</p>
        </div>

        <div className="mb-6 max-w-md">
          <label htmlFor="stores-search" className="mb-2 block text-sm font-medium text-stone-600">ابحث باسم المتجر</label>
          <div className="relative">
            <input
              id="stores-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب اسم المتجر..."
              className="w-full rounded-2xl border border-stone-200 bg-white py-3 pe-11 ps-4 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-stone-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 12.15 12.15z" /></svg>
            </div>
          </div>
        </div>

        {filteredStores.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
            لا توجد متاجر مطابقة لهذا البحث.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStores.map((store) => (
              <Link key={store.id} href={`/stores/${store.slug}`} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white transition hover:border-amber-300 hover:shadow-md">
                <div className="relative aspect-[2.2/1] overflow-hidden bg-stone-100">
                  {store.logo_url ? (
                    <Image src={store.logo_url} alt={store.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-300">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16l-1 12H5L4 7zm2-3h12l1 3H5l1-3z" /></svg>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-stone-900">{store.name}</h2>
                      {store.city && <p className="mt-1 text-sm text-stone-400">{store.city}</p>}
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{store.product_count.toLocaleString('ar-EG')} منتج</span>
                  </div>
                  {store.description && <p className="line-clamp-2 text-sm leading-7 text-stone-500">{store.description}</p>}
                  <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-sm font-semibold text-amber-700">
                    <span>ادخل المتجر</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

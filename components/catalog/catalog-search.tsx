'use client'

// components/catalog/catalog-search.tsx

import { useState, useEffect, useRef } from 'react'
import { prepareForSearch }             from '@/lib/utils/arabic'

interface CatalogSearchProps {
  value:    string
  onChange: (q: string) => void
}

export function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  const [local, setLocal] = useState(value)
  const timerRef          = useRef<ReturnType<typeof setTimeout> | null>(null)

  // مزامنة لو تغيّر value من خارج (مثلًا عند clear)
  useEffect(() => { setLocal(value) }, [value])

  function handleChange(raw: string) {
    setLocal(raw)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      // نمرر النص كما هو — الـ service يعالج الـ normalization
      onChange(raw.trim())
    }, 400)
  }

  function handleClear() {
    setLocal('')
    onChange('')
  }

  return (
    <div className="relative" dir="rtl">
      {/* أيقونة البحث */}
      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
        <svg
          className="h-4 w-4 text-stone-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path
            strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 12.15 12.15z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="ابحث عن منتج..."
        className="
          w-full rounded-xl border border-stone-200 bg-white
          pe-10 ps-4 py-2.5 text-sm text-stone-800
          placeholder:text-stone-400
          focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20
          transition
        "
      />

      {/* زر المسح */}
      {local && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 start-0 flex items-center ps-3 text-stone-400 hover:text-stone-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

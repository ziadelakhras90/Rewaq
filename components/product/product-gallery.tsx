'use client'

// components/product/product-gallery.tsx

import { useState } from 'react'
import Image        from 'next/image'

interface GalleryImage {
  url:      string
  alt_text: string | null
}

interface ProductGalleryProps {
  images:      GalleryImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  const hasImages = images.length > 0
  const active    = hasImages ? images[activeIdx] : null

  return (
    <div className="space-y-3">
      {/* ── الصورة الرئيسية ─────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
        {active ? (
          <Image
            key={activeIdx}
            src={active.url}
            alt={active.alt_text ?? productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-300"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* ── الصور المصغّرة ──────────────────────────────────────────────── */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`
                relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition
                ${i === activeIdx
                  ? 'border-amber-500 shadow-sm'
                  : 'border-transparent opacity-60 hover:opacity-100'
                }
              `}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? `${productName} - ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

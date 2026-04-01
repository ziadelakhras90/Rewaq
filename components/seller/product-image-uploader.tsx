'use client'

import { useMemo } from 'react'
import type { ProductImageInput } from '@/services/seller-products.service'

interface ProductImageUploaderProps {
  images: ProductImageInput[]
  onChange: (images: ProductImageInput[]) => void
}

export function ProductImageUploader({ images, onChange }: ProductImageUploaderProps) {
  const normalized = useMemo(() => images.length ? images : [{ url: '', is_primary: true }], [images])

  function updateImage(index: number, patch: Partial<ProductImageInput>) {
    onChange(
      normalized.map((image, currentIndex) =>
        currentIndex === index ? { ...image, ...patch } : image
      )
    )
  }

  function addImage() {
    onChange([...normalized, { url: '', is_primary: normalized.length === 0 }])
  }

  function removeImage(index: number) {
    const next = normalized.filter((_, currentIndex) => currentIndex !== index)
    if (next.length > 0 && !next.some((image) => image.is_primary)) {
      next[0].is_primary = true
    }
    onChange(next)
  }

  function setPrimary(index: number) {
    onChange(normalized.map((image, currentIndex) => ({ ...image, is_primary: currentIndex === index })))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-800">صور المنتج</h3>
          <p className="text-xs text-stone-400">أضف روابط الصور. الصورة الأولى ستكون الأساسية ما لم تحدد غير ذلك.</p>
        </div>
        <button type="button" onClick={addImage} className="rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 hover:border-stone-300">
          إضافة صورة
        </button>
      </div>

      <div className="space-y-3">
        {normalized.map((image, index) => (
          <div key={index} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr,180px]">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-stone-700">رابط الصورة #{index + 1}</label>
                <input
                  value={image.url}
                  onChange={(event) => updateImage(index, { url: event.target.value })}
                  placeholder="https://example.com/product.jpg"
                  dir="ltr"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
                <input
                  value={image.alt_text ?? ''}
                  onChange={(event) => updateImage(index, { alt_text: event.target.value })}
                  placeholder="وصف قصير للصورة (اختياري)"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPrimary(index)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${image.is_primary ? 'bg-emerald-100 text-emerald-700' : 'border border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                    {image.is_primary ? 'الصورة الأساسية' : 'اجعلها الأساسية'}
                  </button>
                  <button type="button" onClick={() => removeImage(index)} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                    حذف الصورة
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                {image.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt={image.alt_text ?? 'صورة المنتج'} className="h-full min-h-[180px] w-full object-cover" />
                ) : (
                  <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-stone-400">معاينة الصورة</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

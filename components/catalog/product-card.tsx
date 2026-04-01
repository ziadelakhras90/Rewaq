// components/catalog/product-card.tsx

import Link             from 'next/link'
import Image            from 'next/image'
import { formatCurrency } from '@/lib/utils/arabic'
import type { ProductListItem } from '@/services/catalog.service'

interface ProductCardProps {
  product: ProductListItem
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock     = product.stock_quantity === 0
  const hasDiscount    = product.compare_price && product.compare_price > product.price
  const discountPct    = hasDiscount
    ? Math.round(100 - (product.price / product.compare_price!) * 100)
    : 0

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-md"
    >
      {/* ── الصورة ──────────────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
          </div>
        )}

        {/* Badge: نفد المخزون */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <span className="rounded-full bg-stone-800 px-3 py-1 text-xs font-medium text-white">
              نفد المخزون
            </span>
          </div>
        )}

        {/* Badge: خصم */}
        {hasDiscount && !outOfStock && (
          <div className="absolute start-2 top-2">
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
              -{discountPct}%
            </span>
          </div>
        )}

        {/* Badge: مميز */}
        {product.is_featured && !outOfStock && (
          <div className="absolute end-2 top-2">
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-amber-900">
              مميز
            </span>
          </div>
        )}
      </div>

      {/* ── البيانات ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {/* اسم المتجر */}
        <span className="text-xs text-stone-400">
          {product.store.name}
        </span>

        {/* اسم المنتج */}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-stone-800 group-hover:text-stone-900">
          {product.name}
        </h3>

        {/* التصنيف */}
        {product.category && (
          <span className="text-xs text-stone-400">
            {product.category.name}
          </span>
        )}

        {/* السعر */}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className={`text-base font-bold ${outOfStock ? 'text-stone-400' : 'text-stone-900'}`}>
            {formatCurrency(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-stone-400 line-through">
              {formatCurrency(product.compare_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

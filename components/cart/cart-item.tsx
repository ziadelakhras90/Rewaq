'use client'

// components/cart/cart-item.tsx

import Image            from 'next/image'
import Link             from 'next/link'
import { formatCurrency } from '@/lib/utils/arabic'
import type { CartItemWithProduct } from '@/services/cart.service'

interface CartItemProps {
  item:             CartItemWithProduct
  onQuantityChange: (itemId: string, qty: number) => Promise<void>
  onRemove:         (itemId: string) => Promise<void>
  disabled?:        boolean
}

export function CartItem({ item, onQuantityChange, onRemove, disabled }: CartItemProps) {
  const product     = item.products
  const primaryImg  = product.product_images?.find(i => i.is_primary)?.url
                   ?? product.product_images?.[0]?.url
                   ?? null
  const lineTotal   = Number(product.price) * item.quantity
  const maxQty      = product.track_inventory ? product.stock_quantity : 99
  const lowStock    = product.track_inventory && product.stock_quantity <= 5 && product.stock_quantity > 0

  return (
    <div dir="rtl" className={`flex gap-4 py-5 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>

      {/* ── الصورة ──────────────────────────────────────────────────────── */}
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-stone-100 sm:h-24 sm:w-24">
          {primaryImg ? (
            <Image src={primaryImg} alt={product.name} fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-300">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* ── البيانات ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <Link href={`/product/${product.slug}`}
              className="text-sm font-medium text-stone-800 hover:text-stone-900 transition line-clamp-2">
              {product.name}
            </Link>
            {lowStock && (
              <p className="text-xs text-amber-600">
                متبقي {product.stock_quantity} فقط
              </p>
            )}
          </div>
          {/* زر الحذف */}
          <button
            onClick={() => onRemove(item.id)}
            className="shrink-0 text-stone-300 hover:text-rose-400 transition"
            aria-label="حذف المنتج"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* ── الكمية + السعر ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          {/* الكمية */}
          <div className="flex items-center rounded-lg border border-stone-200 bg-white">
            <button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-7 text-center text-sm font-medium text-stone-800">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={product.track_inventory && item.quantity >= maxQty}
              className="flex h-8 w-8 items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* السعر الإجمالي للعنصر */}
          <span className="text-sm font-bold text-stone-900">
            {formatCurrency(lineTotal)}
          </span>
        </div>
      </div>

    </div>
  )
}

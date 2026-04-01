'use client'

// components/cart/cart-list.tsx

import Link              from 'next/link'
import { CartItem }      from './cart-item'
import type { CartWithItems } from '@/services/cart.service'

interface CartListProps {
  cart:             CartWithItems
  onQuantityChange: (itemId: string, qty: number) => Promise<void>
  onRemove:         (itemId: string) => Promise<void>
  onClear:          () => Promise<void>
  disabled?:        boolean
}

export function CartList({ cart, onQuantityChange, onRemove, onClear, disabled }: CartListProps) {
  const storeName  = (cart as any).stores?.name as string | undefined

  return (
    <div dir="rtl" className="rounded-2xl border border-stone-200 bg-white">

      {/* ── رأس القائمة ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-stone-900">سلة التسوق</h2>
          {storeName && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-400">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              منتجات من متجر واحد فقط:&nbsp;
              <span className="font-medium text-stone-600">{storeName}</span>
            </p>
          )}
        </div>

        <button
          onClick={onClear}
          disabled={disabled}
          className="text-xs text-stone-400 hover:text-rose-500 transition disabled:opacity-40"
        >
          إفراغ السلة
        </button>
      </div>

      {/* ── العناصر ──────────────────────────────────────────────────────── */}
      <div className="divide-y divide-stone-100 px-5">
        {cart.cart_items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            disabled={disabled}
          />
        ))}
      </div>

      {/* ── إضافة المزيد ─────────────────────────────────────────────────── */}
      <div className="border-t border-stone-100 px-5 py-4">
        <Link
          href="/marketplace"
          className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة منتجات أخرى من نفس المتجر
        </Link>
      </div>
    </div>
  )
}

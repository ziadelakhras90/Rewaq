'use client'

import { formatCurrency, getStockStatus } from '@/lib/utils/arabic'
import { AddToCartButton } from './add-to-cart-button'

interface ProductInfoProps {
  product: {
    id: string
    name: string
    description: string | null
    price: number
    compare_price: number | null
    stock_quantity: number
    track_inventory: boolean
    sku: string | null
    store: {
      id: string
      name: string
      slug: string
      city: string | null
    }
    category: {
      id: string
      name: string
    } | null
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const hasDiscount = product.compare_price && product.compare_price > product.price
  const discountPct = hasDiscount ? Math.round(100 - (product.price / product.compare_price!) * 100) : 0
  const stockLabel = getStockStatus(product.stock_quantity, product.track_inventory)

  return (
    <div dir="rtl" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-amber-700">
          {product.store.name}
        </span>
        {product.store.city && <span className="text-stone-300">·</span>}
        {product.store.city && <span className="text-sm text-stone-400">{product.store.city}</span>}
        {product.category && (
          <>
            <span className="text-stone-300">·</span>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">{product.category.name}</span>
          </>
        )}
      </div>

      <h1 className="text-2xl font-bold leading-snug text-stone-900 sm:text-3xl">{product.name}</h1>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-stone-900">{formatCurrency(product.price)}</span>
        {hasDiscount && (
          <>
            <span className="text-lg text-stone-400 line-through">{formatCurrency(product.compare_price!)}</span>
            <span className="rounded-full bg-rose-500 px-2.5 py-1 text-sm font-bold text-white">وفّر {discountPct}%</span>
          </>
        )}
      </div>

      {stockLabel && (
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${stockLabel.tone}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${stockLabel.dot}`} />
          {stockLabel.text}
        </span>
      )}

      <hr className="border-stone-100" />

      {product.description && (
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-stone-500">الوصف</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">{product.description}</p>
        </div>
      )}

      {product.sku && (
        <p className="text-xs text-stone-400">رمز المنتج: <span className="font-mono">{product.sku}</span></p>
      )}

      <AddToCartButton productId={product.id} productName={product.name} stockQuantity={product.stock_quantity} trackInventory={product.track_inventory} />

      <div className="flex flex-wrap gap-4 pt-1">
        <Trust icon="shield" text="دفع آمن عند الاستلام" />
        <Trust icon="refresh" text="إرجاع خلال ٧ أيام" />
        <Trust icon="truck" text="توصيل سريع" />
      </div>
    </div>
  )
}

function Trust({ icon, text }: { icon: 'shield' | 'refresh' | 'truck'; text: string }) {
  const icons = {
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />,
    truck: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 1 0 0 4H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4h2a2 2 0 0 1 0 4h-2M5 8v4m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />,
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-stone-400">
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icons[icon]}</svg>
      {text}
    </div>
  )
}

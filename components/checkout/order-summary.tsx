// components/checkout/order-summary.tsx

import Image            from 'next/image'
import { formatCurrency } from '@/lib/utils/arabic'
import type { CartWithItems } from '@/services/cart.service'

interface OrderSummaryProps {
  cart:     CartWithItems
  subtotal: number
}

export function OrderSummary({ cart, subtotal }: OrderSummaryProps) {
  const deliveryFee = 0
  const total       = subtotal + deliveryFee
  const storeName   = (cart as any).stores?.name as string | undefined

  return (
    <div dir="rtl" className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
      <h3 className="text-sm font-bold text-stone-900">مراجعة الطلب</h3>

      {storeName && (
        <p className="text-xs text-stone-400">
          متجر: <span className="font-medium text-stone-600">{storeName}</span>
        </p>
      )}

      {/* المنتجات */}
      <ul className="divide-y divide-stone-100">
        {cart.cart_items.map((item) => {
          const img = item.products.product_images?.find(i => i.is_primary)?.url
                   ?? item.products.product_images?.[0]?.url
                   ?? null
          return (
            <li key={item.id} className="flex items-center gap-3 py-3">
              {/* صورة مصغرة */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {img
                  ? <Image src={img} alt={item.products.name} fill sizes="48px" className="object-cover" />
                  : <div className="h-full w-full bg-stone-100" />
                }
              </div>

              <div className="flex flex-1 items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-stone-800 line-clamp-1">
                    {item.products.name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {item.quantity} × {formatCurrency(Number(item.products.price))}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-stone-800">
                  {formatCurrency(Number(item.products.price) * item.quantity)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      {/* الأسعار */}
      <div className="space-y-2 border-t border-stone-100 pt-3">
        <Row label="المجموع الفرعي"   value={formatCurrency(subtotal)} />
        <Row label="رسوم التوصيل"    value={deliveryFee === 0 ? 'مجاني' : formatCurrency(deliveryFee)} />
      </div>

      {/* الإجمالي */}
      <div className="flex items-center justify-between border-t border-stone-200 pt-3">
        <span className="font-bold text-stone-900">الإجمالي</span>
        <span className="text-lg font-bold text-amber-600">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="text-stone-700">{value}</span>
    </div>
  )
}

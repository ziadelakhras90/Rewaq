// components/cart/cart-summary.tsx

import Link             from 'next/link'
import { formatCurrency } from '@/lib/utils/arabic'

interface CartSummaryProps {
  subtotal:   number
  storeName?: string
  itemCount:  number
  disabled?:  boolean
}

export function CartSummary({ subtotal, storeName, itemCount, disabled }: CartSummaryProps) {
  const deliveryFee = 0  // MVP: شحن مجاني أو يُحدد لاحقًا
  const total       = subtotal + deliveryFee

  return (
    <div dir="rtl" className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">

      <h2 className="text-base font-bold text-stone-900">ملخص الطلب</h2>

      {/* المتجر */}
      {storeName && (
        <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2.5">
          <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-9-4h4" />
          </svg>
          <div>
            <p className="text-xs text-stone-400">المتجر</p>
            <p className="text-sm font-medium text-stone-700">{storeName}</p>
          </div>
        </div>
      )}

      {/* تفاصيل الأسعار */}
      <div className="space-y-2.5 border-t border-stone-100 pt-4">
        <Row label={`المنتجات (${itemCount})`} value={formatCurrency(subtotal)} />
        <Row label="رسوم التوصيل" value={deliveryFee === 0 ? 'مجاني' : formatCurrency(deliveryFee)} />
      </div>

      {/* الإجمالي */}
      <div className="flex items-center justify-between border-t border-stone-200 pt-3">
        <span className="text-base font-bold text-stone-900">الإجمالي</span>
        <span className="text-lg font-bold text-amber-600">{formatCurrency(total)}</span>
      </div>

      {/* زر الدفع */}
      <Link
        href="/checkout"
        className={`
          flex w-full items-center justify-center gap-2 rounded-xl py-3.5
          text-sm font-semibold transition
          ${disabled
            ? 'pointer-events-none bg-stone-100 text-stone-400'
            : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-sm'
          }
        `}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5l7 7-7 7" />
        </svg>
        إتمام الطلب
      </Link>

      {/* ضمانات */}
      <p className="text-center text-xs text-stone-400">
        الدفع عند الاستلام · إرجاع مجاني خلال ٧ أيام
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm text-stone-800">{value}</span>
    </div>
  )
}

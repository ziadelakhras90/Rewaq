import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/arabic'

interface CartSummaryProps {
  subtotal: number
  storeName?: string
  itemCount: number
  disabled?: boolean
}

export function CartSummary({ subtotal, storeName, itemCount, disabled }: CartSummaryProps) {
  const deliveryFee = 0
  const total = subtotal + deliveryFee

  return (
    <div dir="rtl" className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
      <div>
        <h2 className="text-base font-bold text-stone-900">راجع الطلب قبل الإرسال</h2>
        <p className="mt-1 text-xs text-stone-400">نفس فكرة السلة الجديدة: المنتجات، البيانات، والملخص النهائي.</p>
      </div>

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

      <div className="space-y-2.5 border-t border-stone-100 pt-4">
        <Row label={`المنتجات (${itemCount})`} value={formatCurrency(subtotal)} />
        <Row label="الشحن" value={deliveryFee === 0 ? 'يحدد لاحقًا' : formatCurrency(deliveryFee)} />
      </div>

      <div className="flex items-center justify-between border-t border-stone-200 pt-3">
        <span className="text-base font-bold text-stone-900">الإجمالي الحالي</span>
        <span className="text-lg font-bold text-amber-600">{formatCurrency(total)}</span>
      </div>

      <Link
        href="/checkout"
        className={`
          flex w-full items-center justify-center gap-2 rounded-xl py-3.5
          text-sm font-semibold transition
          ${disabled
            ? 'pointer-events-none bg-stone-100 text-stone-400'
            : 'bg-[#6d8c26] text-white hover:bg-[#5f7b20] active:scale-95 shadow-sm'
          }
        `}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5l7 7-7 7" />
        </svg>
        مراجعة الطلب
      </Link>

      <p className="text-center text-xs text-stone-400">
        تقدر تكمل البيانات، تضيف اللوكيشن، وترسل الطلب مباشرة أو عبر واتساب.
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

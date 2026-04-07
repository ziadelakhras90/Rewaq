import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/arabic'
import type { CartWithItems } from '@/services/cart.service'

interface OrderSummaryProps {
  cart: CartWithItems
  subtotal: number
  shippingLabel?: string
  loading?: boolean
  hasLocation?: boolean
  hasAddressDetails?: boolean
  isLoggedIn?: boolean
  error?: string | null
  onSubmit: () => void
  onWhatsApp: () => void
}

export function OrderSummary({
  cart,
  subtotal,
  shippingLabel = 'سيتم إضافة قيمة الشحن لاحقًا حسب المنطقة',
  loading = false,
  hasLocation = false,
  hasAddressDetails = false,
  isLoggedIn = true,
  error,
  onSubmit,
  onWhatsApp,
}: OrderSummaryProps) {
  const itemCount = cart.cart_items.reduce((sum, item) => sum + item.quantity, 0)
  const totalBeforeShipping = subtotal

  return (
    <div dir="rtl" className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(28,25,23,0.04)] sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-2xl font-black tracking-tight text-stone-900">ملخص الطلب</h3>
        <span className="rounded-full border border-[#dfe6c8] bg-[#f7f9ef] px-3 py-1 text-xs font-bold text-[#6d8c26]">
          سلة التسوق
        </span>
      </div>

      <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-6 text-center text-sm text-stone-400">
        {cart.cart_items.length === 0 ? 'لا توجد منتجات في سلتك.' : `لديك ${itemCount} قطعة في السلة.`}
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <SummaryRow label="عدد القطع" value={String(itemCount)} />
        <SummaryRow label="المجموع الفرعي" value={formatCurrency(subtotal)} highlight />
        <SummaryRow label="الشحن" value={shippingLabel} muted />
      </div>

      <div className="mt-4 border-t border-stone-200 pt-4">
        <div className="flex items-center justify-between gap-3 text-base font-black text-stone-900">
          <span>الإجمالي الحالي قبل الشحن</span>
          <span className="text-3xl text-[#ef7d00]">{formatCurrency(totalBeforeShipping)}</span>
        </div>
        <div className="mt-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-sm text-stone-500">
          سيتم إضافة قيمة الشحن لاحقًا حسب المنطقة.
        </div>
      </div>

      {isLoggedIn && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-[#d6ead7] bg-[#f2fbf2] px-4 py-3 text-sm font-bold text-[#4e7a23]">
          <span className="text-base">👤</span>
          أنت مسجل الدخول — <Link href="/account" className="underline underline-offset-2">حسابي</Link>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-3">
        <button
          onClick={onSubmit}
          disabled={loading || cart.cart_items.length === 0 || !hasAddressDetails}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6d8c26] px-4 py-4 text-sm font-bold text-white transition hover:bg-[#5f7b20] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'جاري إرسال الطلب…' : 'إرسال الطلب مباشرة'}
        </button>

        <button
          onClick={onWhatsApp}
          disabled={cart.cart_items.length === 0 || !hasAddressDetails}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#69d38f] px-4 py-4 text-sm font-bold text-white transition hover:bg-[#56c37d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          إرسال الطلب عبر واتساب
        </button>

        <Link
          href="/marketplace"
          className="flex w-full items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-4 text-sm font-bold text-[#6d8c26] transition hover:border-[#c9d7a1] hover:bg-[#fafcf4]"
        >
          إكمال التسوق
        </Link>
      </div>

      <div className="mt-4 space-y-2 text-xs leading-6 text-stone-500">
        {!hasAddressDetails && <p>أكمل الاسم ورقم الموبايل والمحافظة والعنوان أولًا قبل الإرسال.</p>}
        {!hasLocation && <p>يمكنك إضافة موقع التسليم على الخريطة لتسهيل الوصول إليك.</p>}
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  highlight = false,
  muted = false,
}: {
  label: string
  value: string
  highlight?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-stone-600">{label}</span>
      <span className={`text-end font-bold ${muted ? 'max-w-[13rem] text-stone-500' : highlight ? 'text-[#ef7d00]' : 'text-stone-900'}`}>
        {value}
      </span>
    </div>
  )
}

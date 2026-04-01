// components/cart/cart-empty-state.tsx

import Link from 'next/link'

export function CartEmptyState() {
  return (
    <div dir="rtl" className="flex min-h-96 flex-col items-center justify-center gap-5 text-center">
      {/* أيقونة */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
        <svg className="h-10 w-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-9-4h4" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-stone-800">سلتك فارغة</h2>
        <p className="max-w-xs text-sm leading-relaxed text-stone-400">
          ابدأ بتصفح المنتجات واختر ما يعجبك من متاجر رِواق المتنوعة
        </p>
      </div>

      <Link
        href="/marketplace"
        className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition shadow-sm"
      >
        تصفح المنتجات
      </Link>
    </div>
  )
}

// app/not-found.tsx
// صفحة 404 العامة

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة — رِواق',
}

export default function NotFound() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">

      <p className="text-6xl font-black text-amber-400 select-none">٤٠٤</p>

      <h1 className="mt-4 text-xl font-bold text-stone-900">
        الصفحة غير موجودة
      </h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        يبدو أن الرابط الذي تبحث عنه غير موجود أو تم نقله.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/marketplace"
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition"
        >
          تصفح المنتجات
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
        >
          الرئيسية
        </Link>
      </div>

    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'شروط الاستخدام — رِواق',
  description: 'شروط استخدام منصة رِواق للتجارة الإلكترونية متعددة البائعين.',
}

export default function TermsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-stone-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-stone-900">شروط الاستخدام</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          باستخدامك لمنصة <strong>رِواق</strong>، فأنت توافق على استخدام الخدمة بشكل نظامي وعدم إساءة استخدام الحسابات أو الطلبات أو المحتوى.
        </p>
        <div className="mt-6 space-y-5 text-sm leading-7 text-stone-600">
          <section>
            <h2 className="font-bold text-stone-900">الحسابات</h2>
            <p>أنت مسؤول عن الحفاظ على بيانات الدخول الخاصة بك، وعن صحة المعلومات التي تُدخلها داخل المنصة.</p>
          </section>
          <section>
            <h2 className="font-bold text-stone-900">الطلبات والمنتجات</h2>
            <p>قد تختلف المخزونات والأسعار بحسب المتجر البائع، وتحتفظ رِواق بحق تحديث المحتوى أو تعليق العناصر غير المتوافقة مع سياسات المنصة.</p>
          </section>
          <section>
            <h2 className="font-bold text-stone-900">الاستخدام المقبول</h2>
            <p>يُمنع إساءة استخدام المنصة أو محاولة تعطيلها أو الوصول غير المصرّح به إلى حسابات أو بيانات المستخدمين.</p>
          </section>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/privacy" className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-stone-300">
            سياسة الخصوصية
          </Link>
          <Link href="/marketplace" className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية — رِواق',
  description: 'كيف تتعامل رِواق مع بيانات المستخدمين وحمايتها.',
}

export default function PrivacyPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-stone-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-stone-900">سياسة الخصوصية</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          تحترم <strong>رِواق</strong> خصوصيتك وتستخدم بياناتك لتشغيل الطلبات والحسابات وتحسين التجربة فقط ضمن حدود الخدمة.
        </p>
        <div className="mt-6 space-y-5 text-sm leading-7 text-stone-600">
          <section>
            <h2 className="font-bold text-stone-900">البيانات التي نجمعها</h2>
            <p>قد نجمع الاسم والبريد الإلكتروني ورقم الهاتف والعنوان وبيانات الطلبات بما يلزم لتقديم الخدمة.</p>
          </section>
          <section>
            <h2 className="font-bold text-stone-900">استخدام البيانات</h2>
            <p>تُستخدم البيانات لتأكيد الحسابات، إدارة الطلبات، التواصل بخصوص الخدمة، وتحسين الأداء العام للمنصة.</p>
          </section>
          <section>
            <h2 className="font-bold text-stone-900">مشاركة البيانات</h2>
            <p>لا تتم مشاركة بياناتك إلا عند الحاجة التشغيلية المرتبطة بالطلب أو عند وجود التزام قانوني.</p>
          </section>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/terms" className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-stone-300">
            شروط الاستخدام
          </Link>
          <Link href="/" className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">
            العودة إلى رِواق
          </Link>
        </div>
      </div>
    </div>
  )
}

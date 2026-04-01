// components/home/customer-cta.tsx
// قسم دعوة المتسوقين للتسجيل — Server Component

import Link from 'next/link'

export function CustomerCTA() {
  return (
    <section dir="rtl" className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 px-8 py-12 text-white sm:px-12">

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

            {/* Text */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black leading-snug sm:text-3xl">
                ابدأ تسوّقك الآن
                <br />
                ولا تفوّت العروض المميزة
              </h2>
              <p className="text-base leading-relaxed text-amber-100">
                سجّل مجانًا واحفظ عناوينك وتابع طلباتك بكل سهولة من أي جهاز.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/auth/signup"
                  className="
                    inline-flex items-center rounded-2xl bg-white px-6 py-3
                    text-sm font-bold text-amber-600
                    hover:bg-amber-50 active:scale-95 transition
                  "
                >
                  إنشاء حساب مجاني
                </Link>
                <Link
                  href="/marketplace"
                  className="
                    inline-flex items-center rounded-2xl border border-white/40
                    px-6 py-3 text-sm font-semibold text-white
                    hover:bg-white/10 active:scale-95 transition
                  "
                >
                  تصفح بدون تسجيل
                </Link>
              </div>
            </div>

            {/* Feature list */}
            <ul className="space-y-3">
              {[
                'متابعة طلباتك وحالة التوصيل',
                'حفظ عناوين التوصيل المفضّلة',
                'سجل مشترياتك في مكان واحد',
                'الدفع الآمن عند الاستلام',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-amber-50">{item}</span>
                </li>
              ))}
            </ul>

          </div>

        </div>
      </div>
    </section>
  )
}

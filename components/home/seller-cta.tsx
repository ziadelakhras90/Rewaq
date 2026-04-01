// components/home/seller-cta.tsx
// قسم دعوة البائعين — Server Component

import Link from 'next/link'

export function SellerCTA() {
  const benefits = [
    { icon: '⚡', title: 'إعداد سريع',       desc: 'أنشئ متجرك في دقائق' },
    { icon: '🛡️', title: 'منصة موثوقة',      desc: 'بنية تقنية محكمة وآمنة' },
    { icon: '📊', title: 'لوحة تحكم كاملة',  desc: 'تتبع منتجاتك وطلباتك بسهولة' },
    { icon: '💳', title: 'دفع مضمون',        desc: 'الدفع عند الاستلام' },
  ]

  return (
    <section dir="rtl" className="bg-stone-900 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

          {/* Text */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-sm font-medium text-amber-300">للبائعين</span>
            </div>
            <h2 className="text-3xl font-black leading-snug">
              ابدأ البيع في رِواق
              <br />
              <span className="text-amber-400">وصل إلى آلاف المتسوقين</span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-stone-300">
              سواء كان لديك متجر قائم أو تبدأ من الصفر، رِواق يمنحك الأدوات والمتسوقين لتنمو بثقة.
            </p>
            <Link
              href="/become-seller"
              className="
                inline-flex items-center gap-2 rounded-2xl bg-amber-500
                px-7 py-3.5 text-base font-bold text-white
                hover:bg-amber-400 active:scale-95 transition
              "
            >
              قدّم طلبك الآن
              <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2"
              >
                <span className="text-2xl">{b.icon}</span>
                <p className="font-semibold text-white">{b.title}</p>
                <p className="text-sm text-stone-400">{b.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

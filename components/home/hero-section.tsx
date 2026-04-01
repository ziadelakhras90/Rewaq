// components/home/hero-section.tsx
// Hero section للصفحة الرئيسية — Server Component

import Link from 'next/link'

export function HeroSection() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden bg-gradient-to-bl from-amber-50 via-white to-stone-50"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -start-20 -top-20 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -end-10 bottom-0 h-60 w-60 rounded-full bg-stone-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl space-y-6">

          {/* Label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-amber-700">
              سوق إلكتروني عربي متعدد البائعين
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-black leading-tight text-stone-900 sm:text-5xl">
            تسوّق من أفضل
            <br />
            <span className="text-amber-500">المتاجر العربية</span>
          </h1>

          {/* Subtext */}
          <p className="max-w-lg text-lg leading-relaxed text-stone-500">
            رِواق يجمع في مكان واحد متاجر موثوقة وبائعين متميزين، لتجد ما تحتاج بكل سهولة وأمان.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/marketplace"
              className="
                inline-flex items-center gap-2 rounded-2xl bg-amber-500
                px-7 py-3.5 text-base font-bold text-white shadow-md shadow-amber-200
                hover:bg-amber-600 active:scale-95 transition
              "
            >
              تصفح المنتجات
              <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/become-seller"
              className="
                inline-flex items-center gap-2 rounded-2xl border border-stone-200
                bg-white px-7 py-3.5 text-base font-semibold text-stone-700
                hover:border-stone-300 hover:bg-stone-50 active:scale-95 transition
              "
            >
              ابدأ البيع معنا
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-5 pt-2 text-sm text-stone-400">
            <TrustBadge icon="🛡️" text="دفع آمن عند الاستلام" />
            <TrustBadge icon="🏪" text="متاجر موثوقة ومعتمدة" />
            <TrustBadge icon="🚀" text="توصيل سريع" />
          </div>

        </div>
      </div>
    </section>
  )
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

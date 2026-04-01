// components/layout/site-footer.tsx
// Footer عام للصفحات العامة — Server Component

import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer dir="rtl" className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* ── Main row ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand */}
          <div className="space-y-2">
            <Link href="/" className="text-xl font-black text-stone-900">
              رِواق
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-stone-400">
              سوق إلكتروني عربي يجمع أفضل البائعين والمتسوقين في مكان واحد.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-6 text-sm">

            <div className="space-y-3">
              <p className="font-semibold text-stone-700">تسوّق</p>
              <nav className="flex flex-col gap-2">
                <FooterLink href="/marketplace">جميع المنتجات</FooterLink>
                <FooterLink href="/marketplace?sort=newest">الأحدث</FooterLink>
                <FooterLink href="/marketplace?sort=featured">المنتجات المميزة</FooterLink>
              </nav>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-stone-700">بائع؟</p>
              <nav className="flex flex-col gap-2">
                <FooterLink href="/become-seller">ابدأ البيع</FooterLink>
                <FooterLink href="/seller">لوحة البائع</FooterLink>
              </nav>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-stone-700">حسابك</p>
              <nav className="flex flex-col gap-2">
                <FooterLink href="/auth/login">تسجيل الدخول</FooterLink>
                <FooterLink href="/auth/signup">إنشاء حساب</FooterLink>
                <FooterLink href="/account/orders">طلباتي</FooterLink>
              </nav>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-stone-100 py-5 text-xs text-stone-400 sm:flex-row">
          <p>© {new Date().getFullYear()} رِواق — جميع الحقوق محفوظة</p>
          <div className="flex gap-4">
            <FooterLink href="/terms">شروط الاستخدام</FooterLink>
            <FooterLink href="/privacy">الخصوصية</FooterLink>
          </div>
        </div>

      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-stone-500 hover:text-amber-600 transition">
      {children}
    </Link>
  )
}

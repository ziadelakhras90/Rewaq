// app/layout.tsx
// Root layout — يُطبَّق على كل الصفحات
// يتضمن: تحميل الخط العربي، direction RTL، global CSS، metadata أساسية

import type { Metadata, Viewport } from 'next'
import './globals.css'

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  'رِواق | Riwaq — سوق إلكتروني عربي',
    template: '%s | رِواق',
  },
  description: 'تسوّق من أفضل المتاجر العربية في مكان واحد. منصة رِواق للتجارة الإلكترونية متعددة البائعين.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type:   'website',
    locale: 'ar_SA',
    siteName: 'رِواق | Riwaq',
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/*
          خط عربي عبر Google Fonts
          يتم تحميله مسبقًا للأداء الأفضل
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-stone-50 antialiased">
        {children}
      </body>
    </html>
  )
}

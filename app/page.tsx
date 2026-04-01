// app/page.tsx
// الصفحة الرئيسية لـ رِواق
// Server Component — يجلب البيانات ويُمرّرها لأقسام الصفحة

import type { Metadata }          from 'next'
import { SiteHeader }             from '@/components/layout/site-header'
import { SiteFooter }             from '@/components/layout/site-footer'
import { HeroSection }            from '@/components/home/hero-section'
import { FeaturedCategories }     from '@/components/home/featured-categories'
import { FeaturedProducts }       from '@/components/home/featured-products'
import { SellerCTA }              from '@/components/home/seller-cta'
import { CustomerCTA }            from '@/components/home/customer-cta'
import { createClient }           from '@/lib/supabase/server'
import { getFeaturedProducts, getActiveCategories } from '@/services/catalog.service'

export const metadata: Metadata = {
  title: 'رِواق | Riwaq — سوق إلكتروني عربي',
  description: 'تسوّق من أفضل المتاجر العربية في مكان واحد. منصة رِواق للتجارة الإلكترونية متعددة البائعين.',
}

export default async function HomePage() {
  const supabase = await createClient()

  // جلب البيانات موازيًا
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(supabase, 8),
    getActiveCategories(supabase),
  ])

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturedCategories categories={categories} />
        <FeaturedProducts   products={featuredProducts} />
        <SellerCTA />
        <CustomerCTA />
      </main>
      <SiteFooter />
    </>
  )
}

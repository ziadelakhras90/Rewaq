// components/home/featured-products.tsx
// قسم المنتجات المميزة في الصفحة الرئيسية — Server Component

import Link              from 'next/link'
import { ProductCard }   from '@/components/catalog/product-card'
import type { ProductListItem } from '@/services/catalog.service'

interface FeaturedProductsProps {
  products: ProductListItem[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null

  return (
    <section dir="rtl" className="bg-stone-50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-900">منتجات مميزة</h2>
            <p className="mt-1 text-sm text-stone-400">اختيارات بعناية من أفضل المتاجر</p>
          </div>
          <Link
            href="/marketplace?sort=featured"
            className="text-sm font-medium text-amber-600 hover:underline"
          >
            عرض الكل ←
          </Link>
        </div>

        {/* Grid — يعيد استخدام ProductCard الموجود */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA bottom */}
        <div className="mt-8 text-center">
          <Link
            href="/marketplace"
            className="
              inline-flex items-center gap-2 rounded-2xl border border-stone-200
              bg-white px-6 py-3 text-sm font-semibold text-stone-700
              hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition
            "
          >
            تصفح جميع المنتجات
            <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}

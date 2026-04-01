// components/product/related-products.tsx

import { ProductCard }  from '@/components/catalog/product-card'
import type { ProductListItem } from '@/services/catalog.service'

interface RelatedProductsProps {
  products: ProductListItem[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section dir="rtl" className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-900">منتجات مشابهة</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

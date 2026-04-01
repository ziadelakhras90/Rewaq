// app/(public)/product/[slug]/page.tsx
// Server Component — يجلب المنتج بالـ slug ويمرّره للـ client components

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProductBySlug, getProducts } from '@/services/catalog.service'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { RelatedProducts } from '@/components/product/related-products'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const product = await getProductBySlug(supabase, slug)

  if (!product) return { title: 'منتج غير موجود — رِواق' }

  return {
    title: `${product.name} — رِواق`,
    description: product.description ?? `${product.name} من متجر ${(product as any).stores?.name}`,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const product = await getProductBySlug(supabase, slug)

  if (!product) notFound()

  const relatedResult = await getProducts(supabase, {
    categoryId: product.category_id ?? undefined,
    pageSize: 4,
  })
  const related = relatedResult.data.filter((p) => p.id !== product.id).slice(0, 4)

  const images: { url: string; alt_text: string | null }[] =
    (product as any).product_images ?? []

  const store: { id: string; name: string; slug: string; city: string | null } =
    (product as any).stores

  const category: { id: string; name: string } | null =
    (product as any).categories

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          storeName={store.name}
          storeSlug={store.slug}
          categoryName={category?.name}
          productName={product.name}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <ProductGallery images={images} productName={product.name} />
          <ProductInfo
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              price: Number(product.price),
              compare_price: product.compare_price ? Number(product.compare_price) : null,
              stock_quantity: product.stock_quantity,
              track_inventory: product.track_inventory,
              sku: product.sku,
              store,
              category,
            }}
          />
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <RelatedProducts products={related} />
          </div>
        )}
      </div>
    </div>
  )
}

function Breadcrumb({
  storeName,
  storeSlug,
  categoryName,
  productName,
}: {
  storeName: string
  storeSlug: string
  categoryName: string | undefined
  productName: string
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-stone-400">
      <Link href="/marketplace" className="hover:text-stone-600 transition">
        تصفح المنتجات
      </Link>
      <span>/</span>
      <span className="text-stone-600">{storeName}</span>
      {categoryName && (
        <>
          <span>/</span>
          <span>{categoryName}</span>
        </>
      )}
      <span>/</span>
      <span className="max-w-48 truncate text-stone-600">{productName}</span>
    </nav>
  )
}

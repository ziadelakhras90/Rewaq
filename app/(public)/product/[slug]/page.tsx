export const dynamic = 'force-dynamic'
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

  if (!product) return { title: 'منتج غير موجود — Rewq' }

  return {
    title: `${product.name} — Rewq`,
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

  const rawImages = Array.isArray((product as any).product_images)
    ? (product as any).product_images
    : []

  const images: { url: string; alt_text: string | null }[] = rawImages
    .map((img: any) => ({
      url: typeof img?.url === 'string' ? img.url : '',
      alt_text: typeof img?.alt_text === 'string' ? img.alt_text : null,
      sort_order: Number(img?.sort_order ?? 0),
      is_primary: Boolean(img?.is_primary),
    }))
    .filter((img: any) => img.url)
    .sort((a: any, b: any) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
      return a.sort_order - b.sort_order
    })
    .map(({ url, alt_text }) => ({ url, alt_text }))

  const rawStore = Array.isArray((product as any).stores)
    ? (product as any).stores[0]
    : (product as any).stores

  const store: { id: string; name: string; slug: string; city: string | null } = {
    id: rawStore?.id ?? '',
    name: rawStore?.name ?? 'المتجر',
    slug: rawStore?.slug ?? '',
    city: rawStore?.city ?? null,
  }

  const rawCategory = Array.isArray((product as any).categories)
    ? (product as any).categories[0]
    : (product as any).categories

  const category: { id: string; name: string } | null = rawCategory
    ? { id: rawCategory.id, name: rawCategory.name }
    : null

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

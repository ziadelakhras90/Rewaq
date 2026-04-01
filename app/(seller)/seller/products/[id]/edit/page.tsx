import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerCategories, getSellerProductById, getSellerStoreId } from '@/services/seller-products.service'
import { SellerNav } from '@/components/seller/seller-nav'
import { ProductForm } from '@/components/seller/product-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'تعديل المنتج — رِواق' }
}

export default async function EditSellerProductPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/seller/products/${id}/edit`)

  const [storeId, categories, product] = await Promise.all([
    getSellerStoreId(supabase, user.id),
    getSellerCategories(supabase),
    getSellerProductById(supabase, user.id, id),
  ])

  if (!storeId) redirect('/seller/status')
  if (!product) notFound()

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <SellerNav />
        <ProductForm storeId={storeId} categories={categories} existing={product as any} />
      </div>
    </div>
  )
}

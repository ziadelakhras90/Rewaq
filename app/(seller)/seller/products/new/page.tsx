import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerCategories, getSellerStoreId } from '@/services/seller-products.service'
import { SellerNav } from '@/components/seller/seller-nav'
import { ProductForm } from '@/components/seller/product-form'

export const metadata: Metadata = {
  title: 'إضافة منتج — رِواق',
}

export default async function NewSellerProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/seller/products/new')

  const [storeId, categories] = await Promise.all([
    getSellerStoreId(supabase, user.id),
    getSellerCategories(supabase),
  ])

  if (!storeId) redirect('/seller/status')

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <SellerNav />
        <ProductForm storeId={storeId} categories={categories} />
      </div>
    </div>
  )
}

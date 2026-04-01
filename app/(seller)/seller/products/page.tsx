import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerProducts } from '@/services/seller-products.service'
import { getSellerStore } from '@/services/seller.service'
import { SellerNav } from '@/components/seller/seller-nav'
import { SellerProductsTable } from '@/components/seller/seller-products-table'

export const metadata: Metadata = {
  title: 'منتجاتي — رِواق',
}

interface PageProps {
  searchParams?: Promise<{ filter?: string }>
}

export default async function SellerProductsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/seller/products')

  const store = await getSellerStore(supabase, user.id)
  if (!store) redirect('/seller/status')

  const products = await getSellerProducts(supabase, user.id)
  const activeFilter = resolvedSearchParams?.filter === 'low-stock' ? 'low-stock' : 'all'

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <SellerNav />
        <div>
          <h1 className="text-2xl font-bold text-stone-900">منتجات المتجر</h1>
          <p className="mt-1 text-sm text-stone-500">أضف منتجاتك ونظّم الأسعار والمخزون والصور.</p>
        </div>
        <SellerProductsTable products={products} initialFilter={activeFilter} />
      </div>
    </div>
  )
}

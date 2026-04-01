import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerStore } from '@/services/seller.service'
import { SellerNav } from '@/components/seller/seller-nav'
import { SellerSettingsForm } from '@/components/seller/seller-settings-form'

export const metadata: Metadata = {
  title: 'إعدادات المتجر — رِواق',
}

export default async function SellerSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/seller/settings')

  const store = await getSellerStore(supabase, user.id)
  if (!store) redirect('/seller/status')

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <SellerNav />
        <SellerSettingsForm store={store} />
      </div>
    </div>
  )
}

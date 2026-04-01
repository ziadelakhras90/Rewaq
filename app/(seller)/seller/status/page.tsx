import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerApplicationStatus } from '@/services/seller.service'
import { SellerApplicationStatus } from '@/components/seller/seller-application-status'

export const metadata: Metadata = {
  title: 'حالة طلب البائع — رِواق',
}

export default async function SellerStatusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/seller/status')

  const { application, store } = await getSellerApplicationStatus(supabase, user.id)

  if (!application && !store) {
    redirect('/become-seller')
  }

  if (store && application?.status === 'approved') {
    redirect('/seller')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900">حالة الطلب</h1>
          <p className="mt-1 text-sm text-stone-500">تابع حالة طلب الانضمام كبائع في رِواق.</p>
        </div>

        <SellerApplicationStatus application={application} store={store} />
      </div>
    </div>
  )
}

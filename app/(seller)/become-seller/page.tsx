import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerApplicationStatus } from '@/services/seller.service'
import { SellerApplicationForm } from '@/components/seller/seller-application-form'
import { SellerApplicationStatus } from '@/components/seller/seller-application-status'

export const metadata: Metadata = {
  title: 'انضم كبائع — رِواق',
}

export default async function BecomeSellerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/become-seller')

  const { application, store } = await getSellerApplicationStatus(supabase, user.id)

  if (store && application?.status === 'approved') {
    redirect('/seller')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium text-amber-600">رِواق للبائعين</p>
          <h1 className="text-3xl font-bold text-stone-900">ابدأ البيع داخل رِواق</h1>
          <p className="max-w-2xl text-sm leading-7 text-stone-500">إذا كان لديك متجر أو منتجات جاهزة للبيع، قدّم طلب الانضمام وسنراجع بياناتك في أقرب وقت.</p>
        </div>

        {application ? (
          <SellerApplicationStatus application={application} store={store} />
        ) : (
          <SellerApplicationForm userId={user.id} />
        )}
      </div>
    </div>
  )
}

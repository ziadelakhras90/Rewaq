export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSellerApplicationStatus } from '@/services/seller.service'
import { SellerApplicationForm, mapApplicationToSellerFormValues } from '@/components/seller/seller-application-form'
import { SellerApplicationStatus } from '@/components/seller/seller-application-status'
import { BackButton } from '@/components/layout/main-navigation'

export const metadata: Metadata = {
  title: 'انضم كبائع — Rewq',
}

interface PageProps {
  searchParams?: Promise<{ reapply?: string }>
}

export default async function BecomeSellerPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const wantsReapply = params.reapply === '1'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/become-seller')

  const { application, store } = await getSellerApplicationStatus(supabase, user.id)

  if (store && application?.status === 'approved') {
    redirect('/seller')
  }

  const showForm = !application || (application.status === 'rejected' && wantsReapply)
  const initialValues = application?.status === 'rejected'
    ? mapApplicationToSellerFormValues(application)
    : undefined

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-4">
          <BackButton href="/" />
        </div>
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium text-amber-600">Rewq للبائعين</p>
          <h1 className="text-3xl font-bold text-stone-900">ابدأ البيع داخل Rewq</h1>
          <p className="max-w-2xl text-sm leading-7 text-stone-500">إذا كان لديك متجر أو منتجات جاهزة للبيع، قدّم طلب الانضمام وسنراجع بياناتك في أقرب وقت.</p>
        </div>

        {showForm ? (
          <SellerApplicationForm userId={user.id} initialValues={initialValues} />
        ) : (
          <SellerApplicationStatus application={application} store={store} />
        )}
      </div>
    </div>
  )
}

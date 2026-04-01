// app/(customer)/account/addresses/page.tsx
// Server Component — يجلب العناوين ويمرّرها لـ AddressList

import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AddressList } from '@/components/account/address-list'
import type { CustomerAddress } from '@/services/address.service'

export const metadata: Metadata = {
  title: 'عناويني — رِواق',
}

interface PageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function AddressesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/account/addresses')

  const { data: addresses } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  const backHref = resolvedSearchParams.redirect ?? '/account'

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-stone-900">عناويني</h1>
            <p className="text-sm text-stone-400">إدارة عناوين التوصيل</p>
          </div>
        </div>

        {resolvedSearchParams.redirect?.startsWith('/checkout') && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-700">
              أضف عنوانًا وسيُعاد توجيهك تلقائيًا لإكمال طلبك.
            </p>
          </div>
        )}

        <AddressList
          customerId={user.id}
          initialAddresses={(addresses ?? []) as CustomerAddress[]}
        />
      </div>
    </div>
  )
}

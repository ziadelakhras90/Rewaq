// app/(customer)/checkout/success/page.tsx
// يُعرض بعد نجاح create-order
// يقرأ orderNumber من searchParams

import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'تم استلام طلبك — رِواق',
}

interface PageProps {
  searchParams: Promise<{ orderNumber?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { orderNumber } = await searchParams

  if (!orderNumber) redirect('/')

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-stone-900">تم استلام طلبك!</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          شكرًا لتسوّقك في رِواق. سيتواصل معك البائع قريبًا لتأكيد التوصيل.
        </p>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white px-6 py-5">
          <p className="mb-1 text-xs text-stone-400">رقم طلبك</p>
          <p className="font-mono text-xl font-bold tracking-wide text-stone-800">{orderNumber}</p>
          <p className="mt-2 text-xs text-stone-400">احتفظ بهذا الرقم للمتابعة</p>
        </div>

        <div className="mt-6 space-y-2 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-start">
          <p className="text-xs font-semibold text-amber-800">ماذا يحدث الآن؟</p>
          <StepItem step="١" text="البائع يؤكد طلبك" />
          <StepItem step="٢" text="يتم تجهيز الطلب وشحنه" />
          <StepItem step="٣" text="يصلك الطلب على عنوان التوصيل" />
          <StepItem step="٤" text="الدفع عند الاستلام" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/account/orders"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition shadow-sm hover:bg-amber-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
            </svg>
            متابعة طلبي
          </Link>

          <Link
            href="/marketplace"
            className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-9-4h4" />
            </svg>
            متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  )
}

function StepItem({ step, text }: { step: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
        {step}
      </span>
      <span className="text-sm text-stone-600">{text}</span>
    </div>
  )
}

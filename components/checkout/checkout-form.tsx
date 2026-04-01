'use client'

import Link from 'next/link'
// components/checkout/checkout-form.tsx

import { useState }         from 'react'
import { useRouter }        from 'next/navigation'
import { createClient }     from '@/lib/supabase/client'
import { AddressSelector }  from './address-selector'
import { OrderSummary }     from './order-summary'
import type { Address }     from './address-selector'
import type { CartWithItems } from '@/services/cart.service'
import type { CreateOrderRequest, CreateOrderResponse } from '@/types/api.types'

interface CheckoutFormProps {
  cart:      CartWithItems
  subtotal:  number
  addresses: Address[]
  userId:    string
}

export function CheckoutForm({ cart, subtotal, addresses, userId }: CheckoutFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  // الاختيار الأولي: العنوان الافتراضي أو الأول
  const defaultAddr = addresses.find(a => a.is_default) ?? addresses[0] ?? null

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddr?.id ?? null
  )
  const [paymentMethod] = useState<'cash_on_delivery'>('cash_on_delivery')
  const [notes,   setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit() {
    if (!selectedAddressId) {
      setError('الرجاء اختيار عنوان التوصيل')
      return
    }
    if (cart.cart_items.length === 0) {
      setError('سلتك فارغة')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const body: CreateOrderRequest = {
        cartId:        cart.id,
        addressId:     selectedAddressId,
        paymentMethod,
        notes:         notes.trim() || undefined,
      }

      const { data, error: fnError } = await supabase.functions.invoke<CreateOrderResponse>(
        'create-order',
        { body }
      )

      if (fnError) {
        // Supabase wraps Edge Function errors — نحاول استخراج الرسالة
        const message = (fnError as any)?.context?.error
                     ?? (fnError as any)?.message
                     ?? 'حدث خطأ أثناء إنشاء الطلب'

        // حالة خاصة: تغيّر السعر
        if (message.includes('PRICE_CHANGED')) {
          setError('تغيّرت أسعار بعض المنتجات. يرجى مراجعة سلتك والمحاولة مجددًا.')
        } else {
          setError(message)
        }
        return
      }

      if (!data?.orderNumber) {
        setError('حدث خطأ غير متوقع. حاول مجددًا.')
        return
      }

      router.push(`/checkout/success?orderNumber=${data.orderNumber}`)

    } catch {
      setError('تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مجددًا.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddNewAddress() {
    router.push('/account/addresses?redirect=/checkout')
  }

  return (
    <div dir="rtl" className="grid gap-6 lg:grid-cols-3">

      {/* ── العمود الأيسر: عنوان + ملاحظات ─────────────────────────────── */}
      <div className="space-y-6 lg:col-span-2">

        {/* ── عنوان التوصيل ─────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
          <h2 className="text-base font-bold text-stone-900">عنوان التوصيل</h2>
          <AddressSelector
            addresses={addresses}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
            onAddNew={handleAddNewAddress}
          />
        </section>

        {/* ── طريقة الدفع ───────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-stone-900">طريقة الدفع</h2>
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800">الدفع عند الاستلام</p>
              <p className="text-xs text-stone-400">ادفع نقدًا عند وصول طلبك</p>
            </div>
            <div className="ms-auto h-5 w-5 rounded-full border-2 border-amber-500 bg-amber-500 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          </div>
        </section>

        {/* ── ملاحظات ───────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-stone-900">
            ملاحظات إضافية
            <span className="ms-1 text-xs font-normal text-stone-400">(اختياري)</span>
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: اتصل قبل التوصيل، اترك عند الباب..."
            rows={3}
            maxLength={300}
            className="
              w-full resize-none rounded-xl border border-stone-200 bg-stone-50
              px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400
              focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20
              transition
            "
          />
        </section>

      </div>

      {/* ── العمود الأيمن: ملخص + تأكيد ─────────────────────────────────── */}
      <div className="space-y-4 lg:col-span-1">
        <div className="sticky top-6 space-y-4">

          <OrderSummary cart={cart} subtotal={subtotal} />

          {/* رسالة الخطأ */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* زر التأكيد */}
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedAddressId}
            className="
              flex w-full items-center justify-center gap-2 rounded-xl
              bg-amber-500 py-4 text-sm font-bold text-white shadow-sm
              hover:bg-amber-600 active:scale-95 transition
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {loading ? (
              <><Spinner /> جاري إرسال الطلب…</>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                تأكيد الطلب
              </>
            )}
          </button>

          <p className="text-center text-xs text-stone-400">
            بالضغط على تأكيد الطلب، أنت توافق على{' '}
            <Link href="/terms" className="underline hover:text-stone-600">شروط الاستخدام</Link>
          </p>

        </div>
      </div>

    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

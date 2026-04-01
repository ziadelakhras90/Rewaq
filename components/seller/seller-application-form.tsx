'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateStoreSlug } from '@/lib/utils/store-slug'
import { submitSellerApplication, type SellerApplicationFormValues } from '@/services/seller.service'

interface SellerApplicationFormProps {
  userId: string
}

const EMPTY_VALUES: SellerApplicationFormValues = {
  store_name: '',
  store_description: '',
  phone: '',
  city: '',
}

export function SellerApplicationForm({ userId }: SellerApplicationFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [values, setValues] = useState<SellerApplicationFormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<Partial<Record<keyof SellerApplicationFormValues, string>>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const slugPreview = useMemo(() => generateStoreSlug(values.store_name), [values.store_name])

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const next: Partial<Record<keyof SellerApplicationFormValues, string>> = {}
    if (!values.store_name.trim()) next.store_name = 'اسم المتجر مطلوب'
    if (!values.phone.trim()) next.phone = 'رقم الجوال مطلوب'
    if (!/^05\d{8}$/.test(values.phone.trim())) next.phone = 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام'
    if (!values.city.trim()) next.city = 'المدينة مطلوبة'
    return next
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setApiError(null)
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    const result = await submitSellerApplication(supabase, userId, values)
    setLoading(false)

    if (!result.success) {
      setApiError(result.error)
      return
    }

    router.push('/seller/status')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
      <div>
        <h2 className="text-xl font-bold text-stone-900">طلب الانضمام كبائع</h2>
        <p className="mt-2 text-sm leading-7 text-stone-500">املأ البيانات الأساسية لمتجرك. سنراجع الطلب ثم نفعّل لك مساحة البائع.</p>
      </div>

      {apiError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {apiError}
        </div>
      )}

      <Field label="اسم المتجر" required error={errors.store_name}>
        <input name="store_name" value={values.store_name} onChange={handleChange} placeholder="مثال: بيت القهوة" className={inputClass(Boolean(errors.store_name))} />
      </Field>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
        <p className="text-xs font-medium text-stone-400">معاينة الرابط</p>
        <p className="mt-1 text-sm font-semibold text-stone-700" dir="ltr">Riwaq.store/{slugPreview || 'your-store'}</p>
        <p className="mt-1 text-xs text-stone-400">سيُنشأ الرابط النهائي تلقائيًا عند الموافقة ويمكنك تعديله لاحقًا من إعدادات المتجر.</p>
      </div>

      <Field label="نبذة عن المتجر">
        <textarea name="store_description" value={values.store_description} onChange={handleChange} rows={4} placeholder="ما الذي تبيعه؟ وما الذي يميز متجرك؟" className={textareaClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="رقم الجوال" required error={errors.phone}>
          <input name="phone" value={values.phone} onChange={handleChange} placeholder="0512345678" dir="ltr" className={inputClass(Boolean(errors.phone), 'text-start')} />
        </Field>
        <Field label="المدينة" required error={errors.city}>
          <input name="city" value={values.city} onChange={handleChange} placeholder="الرياض" className={inputClass(Boolean(errors.city))} />
        </Field>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-700">
        يمكنك استكمال عنوان المتجر التفصيلي وبياناته التشغيلية بعد الموافقة على الطلب من صفحة إعدادات المتجر.
      </div>

      <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? 'جارٍ إرسال الطلب…' : 'إرسال الطلب'}
      </button>
    </form>
  )
}

function Field({ label, children, required = false, error }: { label: string; children: React.ReactNode; required?: boolean; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="mr-1 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean, extra = '') {
  return `w-full rounded-xl border bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition ${extra} ${hasError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20' : 'border-stone-200 focus:border-amber-400 focus:ring-amber-400/20'}`
}

const textareaClass = 'w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition'

'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateStoreSlug } from '@/lib/utils/store-slug'
import {
  EGYPT_GOVERNORATES,
  getCountryOption,
  SELLER_COUNTRY_OPTIONS,
  validateSellerLocalPhone,
} from '@/lib/utils/seller-form'
import type { SellerApplicationFormValues } from '@/services/seller.service'

interface SellerApplicationFormProps {
  userId: string
  initialValues?: Partial<SellerApplicationFormValues>
}

const EMPTY_VALUES: SellerApplicationFormValues = {
  store_name: '',
  store_description: '',
  country: 'EG',
  phone_local: '',
  city: '',
  address_details: '',
}

export function SellerApplicationForm({ userId, initialValues }: SellerApplicationFormProps) {
  const router = useRouter()

  const [values, setValues] = useState<SellerApplicationFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SellerApplicationFormValues, string>>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const slugPreview = useMemo(() => generateStoreSlug(values.store_name), [values.store_name])
  const selectedCountry = useMemo(() => getCountryOption(values.country), [values.country])

  function updateField(name: keyof SellerApplicationFormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleTextChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target
    updateField(name as keyof SellerApplicationFormValues, value)
  }

  function validate() {
    const next: Partial<Record<keyof SellerApplicationFormValues, string>> = {}

    if (!values.store_name.trim()) next.store_name = 'اسم المتجر مطلوب'
    if (!values.country.trim()) next.country = 'اختر الدولة'

    const phoneError = validateSellerLocalPhone(values.country, values.phone_local)
    if (phoneError) next.phone_local = phoneError

    if (!values.city.trim()) next.city = 'اختر المحافظة'
    if (!values.address_details.trim()) next.address_details = 'العنوان التفصيلي مطلوب'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    setApiError(null)

    try {
      const response = await fetch('/api/seller-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          store_name: values.store_name.trim(),
          store_description: values.store_description.trim(),
          country: values.country,
          phone_local: values.phone_local.replace(/\D/g, ''),
          city: values.city.trim(),
          address_details: values.address_details.trim(),
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        setApiError(payload?.error ?? 'تعذّر إرسال طلب الانضمام. حاول مرة أخرى.')
        return
      }

      router.push('/seller/status')
      router.refresh()
    } catch {
      setApiError('تعذّر الاتصال. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-stone-900">طلب الانضمام كبائع</h2>
        <p className="mt-2 text-sm leading-7 text-stone-500">املأ البيانات الأساسية لمتجرك. سنراجع الطلب ثم نفعّل لك مساحة البائع.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="اسم المتجر" required error={errors.store_name}>
          <input name="store_name" value={values.store_name} onChange={handleTextChange} placeholder="متجر الزهراء" className={inputClass(Boolean(errors.store_name))} />
        </Field>

        <Field label="رابط متجرك المقترح">
          <div dir="ltr" className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
            rewq.store/{slugPreview || 'your-store'}
          </div>
          <p className="mt-1 text-xs text-stone-500">يمكنك تعديل الرابط بعد الموافقة من إعدادات المتجر.</p>
        </Field>
      </div>

      <Field label="نبذة عن المتجر">
        <textarea name="store_description" value={values.store_description} onChange={handleTextChange} rows={4} placeholder="ما الذي تبيعه؟ وما الذي يميز متجرك؟" className={textareaClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="الدولة" required error={errors.country}>
          <select name="country" value={values.country} onChange={handleTextChange} className={inputClass(Boolean(errors.country))}>
            {SELLER_COUNTRY_OPTIONS.map((country) => (
              <option key={country.code} value={country.code}>{country.name}</option>
            ))}
          </select>
        </Field>

        <Field label="رقم الجوال" required error={errors.phone_local}>
          <div className="flex overflow-hidden rounded-2xl border border-stone-200 bg-white focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
            <span className="inline-flex items-center border-s border-stone-200 bg-stone-50 px-3 text-sm font-semibold text-stone-600" dir="ltr">
              {selectedCountry.dialCode}
            </span>
            <input
              name="phone_local"
              value={values.phone_local}
              onChange={(e) => updateField('phone_local', e.target.value.replace(/\D/g, '').slice(0, selectedCountry.localDigits))}
              placeholder={selectedCountry.localPlaceholder}
              dir="ltr"
              inputMode="numeric"
              className="w-full border-0 bg-transparent px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-stone-500">{selectedCountry.hint}</p>
        </Field>

        <Field label="المحافظة" required error={errors.city}>
          <select name="city" value={values.city} onChange={handleTextChange} className={inputClass(Boolean(errors.city))}>
            <option value="">اختر المحافظة (مثال: القاهرة)</option>
            {EGYPT_GOVERNORATES.map((governorate) => (
              <option key={governorate} value={governorate}>{governorate}</option>
            ))}
          </select>
        </Field>

        <Field label="العنوان بالتفصيل" required error={errors.address_details}>
          <input name="address_details" value={values.address_details} onChange={handleTextChange} placeholder="الحي، الشارع، رقم المبنى..." className={inputClass(Boolean(errors.address_details))} />
        </Field>
      </div>

      {apiError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {apiError}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-stone-500">
        سنستخدم المحافظة ورقم الجوال لمراجعة الطلب. يمكنك استكمال بيانات المتجر التشغيلية بعد الموافقة من صفحة إعدادات المتجر.
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {loading ? 'جارٍ إرسال الطلب…' : 'إرسال طلب الانضمام'}
      </button>
    </form>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-stone-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </label>
  )
}

function inputClass(hasError: boolean) {
  return [
    'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 transition focus:outline-none focus:ring-2',
    hasError
      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20'
      : 'border-stone-200 focus:border-amber-400 focus:ring-amber-400/20',
  ].join(' ')
}

const textareaClass = 'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20'

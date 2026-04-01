'use client'

// components/account/address-form.tsx
// نموذج إضافة / تعديل عنوان — يُستخدم في Modal داخل صفحة العناوين

import { useState }      from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient }  from '@/lib/supabase/client'
import {
  addAddress,
  updateAddress,
  type CustomerAddress,
} from '@/services/address.service'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AddressFormValues {
  label:      string
  full_name:  string
  phone:      string
  city:       string
  district:   string
  street:     string
  building:   string
  notes:      string
  is_default: boolean
}

interface AddressFormProps {
  customerId:  string
  existing?:   CustomerAddress   // إذا كان موجودًا → وضع التعديل
  onSuccess:   (address: CustomerAddress) => void
  onCancel:    () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM: AddressFormValues = {
  label:      '',
  full_name:  '',
  phone:      '',
  city:       '',
  district:   '',
  street:     '',
  building:   '',
  notes:      '',
  is_default: false,
}

function toFormValues(addr: CustomerAddress): AddressFormValues {
  return {
    label:      addr.label      ?? '',
    full_name:  addr.full_name,
    phone:      addr.phone,
    city:       addr.city,
    district:   addr.district   ?? '',
    street:     addr.street     ?? '',
    building:   addr.building   ?? '',
    notes:      addr.notes      ?? '',
    is_default: addr.is_default,
  }
}

function validate(values: AddressFormValues): Partial<Record<keyof AddressFormValues, string>> {
  const errors: Partial<Record<keyof AddressFormValues, string>> = {}
  if (!values.full_name.trim())  errors.full_name  = 'الاسم مطلوب'
  if (!values.phone.trim())      errors.phone      = 'رقم الجوال مطلوب'
  else if (!/^05\d{8}$/.test(values.phone.trim())) errors.phone = 'رقم الجوال غير صحيح (مثال: 0512345678)'
  if (!values.city.trim())       errors.city       = 'المدينة مطلوبة'
  return errors
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AddressForm({ customerId, existing, onSuccess, onCancel }: AddressFormProps) {
  const supabase    = createClient()
  const router      = useRouter()
  const searchParams = useSearchParams()
  const redirectTo  = searchParams.get('redirect')
  const isEdit      = Boolean(existing)

  const [values,  setValues]  = useState<AddressFormValues>(
    existing ? toFormValues(existing) : EMPTY_FORM
  )
  const [errors,  setErrors]  = useState<Partial<Record<keyof AddressFormValues, string>>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
    // مسح الخطأ الخاص بالحقل عند الكتابة
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)

    const fieldErrors = validate(values)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    const payload = {
      label:      values.label.trim()    || null,
      full_name:  values.full_name.trim(),
      phone:      values.phone.trim(),
      city:       values.city.trim(),
      district:   values.district.trim() || null,
      street:     values.street.trim()   || null,
      building:   values.building.trim() || null,
      notes:      values.notes.trim()    || null,
      is_default: values.is_default,
    }

    try {
      if (isEdit && existing) {
        const result = await updateAddress(supabase, customerId, existing.id, payload)
        if (!result.success) {
          setApiError(result.error ?? 'فشل تحديث العنوان')
          return
        }
        onSuccess({ ...existing, ...payload })
      } else {
        const result = await addAddress(supabase, customerId, payload)
        if (!result.success) {
          setApiError(result.error ?? 'فشل إضافة العنوان')
          return
        }
        // إذا جاء المستخدم من checkout → نعيده إليه بعد الإضافة
        if (redirectTo) {
          router.push(redirectTo)
          return
        }
        onSuccess(result.address)
      }
    } catch {
      setApiError('حدث خطأ غير متوقع. حاول مجددًا.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-5" noValidate>

      <h2 className="text-base font-bold text-stone-900">
        {isEdit ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
      </h2>

      {/* ── تسمية العنوان (اختياري) ────────────────────────────────── */}
      <Field
        label="تسمية العنوان"
        hint="مثال: المنزل، العمل"
        name="label"
        value={values.label}
        onChange={handleChange}
        placeholder="المنزل"
      />

      {/* ── الصف الأول: الاسم + الجوال ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="اسم المستلم"
          name="full_name"
          value={values.full_name}
          onChange={handleChange}
          required
          error={errors.full_name}
          placeholder="أحمد محمد"
        />
        <Field
          label="رقم الجوال"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          required
          error={errors.phone}
          placeholder="0512345678"
          dir="ltr"
          inputClassName="text-start"
        />
      </div>

      {/* ── الصف الثاني: المدينة + الحي ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="المدينة"
          name="city"
          value={values.city}
          onChange={handleChange}
          required
          error={errors.city}
          placeholder="الرياض"
        />
        <Field
          label="الحي"
          name="district"
          value={values.district}
          onChange={handleChange}
          placeholder="العليا"
        />
      </div>

      {/* ── الشارع ───────────────────────────────────────────────────── */}
      <Field
        label="الشارع"
        name="street"
        value={values.street}
        onChange={handleChange}
        placeholder="شارع الملك فهد"
      />

      {/* ── رقم المبنى / الشقة ───────────────────────────────────────── */}
      <Field
        label="رقم المبنى / الشقة"
        name="building"
        value={values.building}
        onChange={handleChange}
        placeholder="مبنى ٥، الدور ٢"
      />

      {/* ── ملاحظات ──────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-700">
          ملاحظات للمندوب
          <span className="ms-1 text-xs font-normal text-stone-400">(اختياري)</span>
        </label>
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="مثال: الدخول من الباب الخلفي..."
          rows={2}
          maxLength={200}
          className="
            w-full resize-none rounded-xl border border-stone-200 bg-stone-50
            px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-400
            focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20
            transition
          "
        />
      </div>

      {/* ── الافتراضي ─────────────────────────────────────────────────── */}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="is_default"
          checked={values.is_default}
          onChange={handleChange}
          className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
        />
        <span className="text-sm text-stone-700">تعيين كعنوان افتراضي</span>
      </label>

      {/* ── API Error ─────────────────────────────────────────────────── */}
      {apiError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-700">{apiError}</p>
        </div>
      )}

      {/* ── Buttons ───────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="
            flex flex-1 items-center justify-center gap-2 rounded-xl
            bg-amber-500 py-3 text-sm font-bold text-white shadow-sm
            hover:bg-amber-600 active:scale-95 transition
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {loading ? <Spinner /> : null}
          {isEdit ? 'حفظ التعديلات' : 'إضافة العنوان'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="
            rounded-xl border border-stone-200 bg-white px-5 py-3
            text-sm font-medium text-stone-600
            hover:bg-stone-50 transition
            disabled:opacity-50
          "
        >
          إلغاء
        </button>
      </div>

    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Field — Input مُعاد استخدامه
// ─────────────────────────────────────────────────────────────────────────────

interface FieldProps {
  label:          string
  name:           string
  value:          string
  onChange:       (e: React.ChangeEvent<HTMLInputElement>) => void
  type?:          string
  placeholder?:   string
  required?:      boolean
  error?:         string
  hint?:          string
  dir?:           string
  inputClassName?: string
}

function Field({
  label, name, value, onChange, type = 'text',
  placeholder, required, error, hint, dir, inputClassName = '',
}: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="ms-0.5 text-rose-500">*</span>}
        {hint && <span className="ms-1 text-xs font-normal text-stone-400">({hint})</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        dir={dir}
        autoComplete="off"
        className={`
          w-full rounded-xl border px-4 py-2.5 text-sm transition
          placeholder:text-stone-400
          focus:outline-none focus:ring-2 focus:ring-amber-400/20
          ${error
            ? 'border-rose-300 bg-rose-50 focus:border-rose-400'
            : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:bg-white'
          }
          ${inputClassName}
        `}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateSellerStoreSettings } from '@/services/seller.service'
import type { Database } from '@/types/database.types'

type Store = Database['public']['Tables']['stores']['Row']

export function SellerSettingsForm({ store }: { store: Store }) {
  const router = useRouter()
  const supabase = createClient()
  const [values, setValues] = useState({
    name: store.name,
    description: store.description ?? '',
    phone: store.phone ?? '',
    email: store.email ?? '',
    city: store.city ?? '',
    district: store.district ?? '',
    address_line: store.address_line ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const result = await updateSellerStoreSettings(supabase, store.id, values)
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'تعذّر تحديث بيانات المتجر.')
      return
    }

    setMessage('تم حفظ بيانات المتجر بنجاح.')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-stone-900">إعدادات المتجر</h1>
        <p className="mt-1 text-sm text-stone-500">حدّث البيانات الأساسية التي تظهر لعملائك داخل رِواق.</p>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم المتجر"><input value={values.name} onChange={(e) => update('name', e.target.value)} className={inputClass} /></Field>
        <Field label="البريد الإلكتروني"><input value={values.email} onChange={(e) => update('email', e.target.value)} dir="ltr" className={`${inputClass} text-start`} /></Field>
      </div>

      <Field label="وصف المتجر"><textarea value={values.description} onChange={(e) => update('description', e.target.value)} rows={4} className={textareaClass} /></Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="رقم الجوال"><input value={values.phone} onChange={(e) => update('phone', e.target.value)} dir="ltr" className={`${inputClass} text-start`} /></Field>
        <Field label="المدينة"><input value={values.city} onChange={(e) => update('city', e.target.value)} className={inputClass} /></Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="الحي / المنطقة"><input value={values.district} onChange={(e) => update('district', e.target.value)} className={inputClass} /></Field>
        <Field label="العنوان"><input value={values.address_line} onChange={(e) => update('address_line', e.target.value)} className={inputClass} /></Field>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition'
const textareaClass = 'w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition'

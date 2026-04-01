'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  createSellerProduct,
  updateSellerProduct,
  type SellerProductFormValues,
  type ProductImageInput,
} from '@/services/seller-products.service'
import { generateStoreSlug } from '@/lib/utils/store-slug'
import type { Database } from '@/types/database.types'
import { ProductImageUploader } from './product-image-uploader'
import { PRODUCT_STATUS_LABELS } from '@/lib/utils/arabic'

type Category = Pick<Database['public']['Tables']['categories']['Row'], 'id' | 'name'>
type Product = Database['public']['Tables']['products']['Row']
type ProductImage = Database['public']['Tables']['product_images']['Row']

interface ProductFormProps {
  storeId: string
  categories: Category[]
  existing?: (Product & { product_images?: ProductImage[] }) | null
}

const EMPTY_FORM: SellerProductFormValues = {
  category_id: null,
  name: '',
  slug: '',
  description: '',
  price: '',
  compare_price: '',
  sku: '',
  stock_quantity: '0',
  track_inventory: true,
  status: 'draft',
  is_featured: false,
  images: [{ url: '', is_primary: true }],
}

function toFormValues(product: Product & { product_images?: ProductImage[] }): SellerProductFormValues {
  const images: ProductImageInput[] = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order).map((image) => ({
    id: image.id,
    url: image.url,
    alt_text: image.alt_text,
    is_primary: image.is_primary,
    sort_order: image.sort_order,
  }))

  return {
    category_id: product.category_id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    price: String(product.price),
    compare_price: product.compare_price ? String(product.compare_price) : '',
    sku: product.sku ?? '',
    stock_quantity: String(product.stock_quantity),
    track_inventory: product.track_inventory,
    status: product.status,
    is_featured: product.is_featured,
    images: images.length ? images : [{ url: '', is_primary: true }],
  }
}

export function ProductForm({ storeId, categories, existing }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = Boolean(existing)

  const [values, setValues] = useState<SellerProductFormValues>(existing ? toFormValues(existing as any) : EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const slugPreview = useMemo(() => values.slug.trim() || generateStoreSlug(values.name), [values.name, values.slug])

  function updateField<K extends keyof SellerProductFormValues>(key: K, value: SellerProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!values.name.trim()) next.name = 'اسم المنتج مطلوب'
    if (!values.price || Number(values.price) <= 0) next.price = 'السعر يجب أن يكون أكبر من صفر'
    if (values.compare_price && Number(values.compare_price) <= Number(values.price)) next.compare_price = 'سعر المقارنة يجب أن يكون أكبر من السعر الحالي'
    if (values.track_inventory && Number(values.stock_quantity) < 0) next.stock_quantity = 'المخزون لا يمكن أن يكون سالبًا'
    if (values.images.some((image) => image.url.trim() === '')) next.images = 'احذف صفوف الصور الفارغة أو أكمل الروابط.'
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
    const result = isEdit && existing
      ? await updateSellerProduct(supabase, existing.id, values)
      : await createSellerProduct(supabase, storeId, values)
    setLoading(false)

    if (!result.success) {
      setApiError(result.error ?? 'تعذّر حفظ المنتج.')
      return
    }

    router.push('/seller/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h1>
          <p className="mt-1 text-sm text-stone-500">أدخل البيانات الأساسية للمنتج كما ستظهر للعميل داخل رِواق.</p>
        </div>
        <div className="rounded-2xl bg-stone-50 px-4 py-3 text-xs text-stone-500" dir="ltr">
          /product/{slugPreview || 'your-product'}
        </div>
      </div>

      {apiError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{apiError}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم المنتج" error={errors.name} required>
          <input value={values.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass(Boolean(errors.name))} placeholder="مثال: قهوة مختصة" />
        </Field>
        <Field label="الرابط المختصر" hint="اختياري — إن تركته فارغًا سنولّده من الاسم.">
          <input value={values.slug} onChange={(e) => updateField('slug', e.target.value)} dir="ltr" className={inputClass(false, 'text-start')} placeholder="special-coffee" />
        </Field>
      </div>

      <Field label="الوصف">
        <textarea value={values.description} onChange={(e) => updateField('description', e.target.value)} rows={4} className={textareaClass} placeholder="اكتب وصفًا واضحًا ومباشرًا عن المنتج" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="التصنيف">
          <select value={values.category_id ?? ''} onChange={(e) => updateField('category_id', e.target.value || null)} className={inputClass(false)}>
            <option value="">بدون تصنيف</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="السعر" required error={errors.price}>
          <input value={values.price} onChange={(e) => updateField('price', e.target.value)} dir="ltr" className={inputClass(Boolean(errors.price), 'text-start')} placeholder="120" />
        </Field>
        <Field label="سعر المقارنة" error={errors.compare_price}>
          <input value={values.compare_price} onChange={(e) => updateField('compare_price', e.target.value)} dir="ltr" className={inputClass(Boolean(errors.compare_price), 'text-start')} placeholder="150" />
        </Field>
        <Field label="SKU">
          <input value={values.sku} onChange={(e) => updateField('sku', e.target.value)} dir="ltr" className={inputClass(false, 'text-start')} placeholder="RIW-001" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="المخزون" error={errors.stock_quantity}>
          <input value={values.stock_quantity} onChange={(e) => updateField('stock_quantity', e.target.value)} dir="ltr" className={inputClass(Boolean(errors.stock_quantity), 'text-start')} placeholder="10" />
        </Field>
        <Field label="الحالة">
          <select value={values.status} onChange={(e) => updateField('status', e.target.value as SellerProductFormValues['status'])} className={inputClass(false)}>
            <option value="draft">{PRODUCT_STATUS_LABELS.draft}</option>
            <option value="active">{PRODUCT_STATUS_LABELS.active}</option>
            <option value="archived">{PRODUCT_STATUS_LABELS.archived}</option>
          </select>
        </Field>
        <Toggle label="تتبع المخزون" checked={values.track_inventory} onChange={(checked) => updateField('track_inventory', checked)} />
        <Toggle label="منتج مميز" checked={values.is_featured} onChange={(checked) => updateField('is_featured', checked)} />
      </div>

      <div className="rounded-3xl border border-stone-200 p-4">
        <ProductImageUploader images={values.images} onChange={(images) => updateField('images', images)} />
        {errors.images && <p className="mt-2 text-xs text-rose-600">{errors.images}</p>}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => router.push('/seller/products')} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-300">
          إلغاء
        </button>
        <button type="submit" disabled={loading} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'جارٍ الحفظ…' : isEdit ? 'حفظ التعديلات' : 'إنشاء المنتج'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children, error, hint, required = false }: { label: string; children: React.ReactNode; error?: string; hint?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="mr-1 text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-stone-400">{hint}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex h-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-stone-300'}`}>
        <span className={`inline-block h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-1' : '-translate-x-5'}`} />
      </button>
    </label>
  )
}

function inputClass(hasError: boolean, extra = '') {
  return `w-full rounded-xl border bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition ${extra} ${hasError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20' : 'border-stone-200 focus:border-amber-400 focus:ring-amber-400/20'}`
}

const textareaClass = 'w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition'

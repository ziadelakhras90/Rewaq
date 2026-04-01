'use client'

// components/admin/admin-category-form.tsx
// نموذج إضافة / تعديل تصنيف

import { useState }      from 'react'
import { createClient }  from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']

interface AdminCategoryFormProps {
  existing?: CategoryRow
  onSuccess: (category: CategoryRow) => void
  onCancel:  () => void
}

function generateSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export function AdminCategoryForm({ existing, onSuccess, onCancel }: AdminCategoryFormProps) {
  const supabase = createClient() as any
  const isEdit   = Boolean(existing)

  const [name,        setName]        = useState(existing?.name        ?? '')
  const [slug,        setSlug]        = useState(existing?.slug        ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [sortOrder,   setSortOrder]   = useState(String(existing?.sort_order ?? '0'))
  const [isActive,    setIsActive]    = useState(existing?.is_active   ?? true)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)
    if (!isEdit) setSlug(generateSlug(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError('اسم التصنيف مطلوب'); return }
    if (!slug.trim()) { setError('الـ slug مطلوب');     return }

    setLoading(true)
    try {
      const payload = {
        name:        name.trim(),
        slug:        slug.trim(),
        description: description.trim() || null,
        sort_order:  parseInt(sortOrder, 10) || 0,
        is_active:   isActive,
      }

      if (isEdit && existing) {
        const { data, error: err } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single()

        if (err) { setError(err.message); return }
        onSuccess(data as CategoryRow)
      } else {
        const { data, error: err } = await supabase
          .from('categories')
          .insert(payload)
          .select()
          .single()

        if (err) {
          setError(
            err.message.includes('duplicate') || err.message.includes('unique')
              ? 'هذا الـ slug مستخدم بالفعل. اختر slug مختلفًا.'
              : err.message
          )
          return
        }
        onSuccess(data as CategoryRow)
      }
    } catch {
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-4" noValidate>
      <h2 className="text-base font-bold text-stone-900">
        {isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
      </h2>

      {/* Name */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-700">
          الاسم <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="مثال: إلكترونيات"
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none transition"
        />
      </div>

      {/* Slug */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-700">
          Slug <span className="text-rose-500">*</span>
          <span className="ms-1 text-xs font-normal text-stone-400">(يُستخدم في الرابط)</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          dir="ltr"
          placeholder="electronics"
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-start focus:border-amber-400 focus:bg-white focus:outline-none transition"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-700">
          الوصف <span className="text-xs font-normal text-stone-400">(اختياري)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:border-amber-400 focus:bg-white focus:outline-none transition"
        />
      </div>

      {/* Sort order + Active */}
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700">ترتيب العرض</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            min="0"
            className="w-24 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none transition"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 pt-5">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
          />
          <span className="text-sm text-stone-700">مفعّل</span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition"
        >
          {loading ? 'جاري الحفظ…' : isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition"
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}

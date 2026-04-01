'use client'

// components/admin/admin-categories-table.tsx
// CRUD كامل للتصنيفات — client component

import { useState }              from 'react'
import { createClient }          from '@/lib/supabase/client'
import { AdminCategoryForm }     from './admin-category-form'
import type { Database }         from '@/types/database.types'

type CategoryRow = Database['public']['Tables']['categories']['Row']

interface AdminCategoriesTableProps {
  initialCategories: CategoryRow[]
}

export function AdminCategoriesTable({ initialCategories }: AdminCategoriesTableProps) {
  const supabase = createClient() as any

  const [categories,  setCategories]  = useState<CategoryRow[]>(initialCategories)
  const [showForm,    setShowForm]    = useState(false)
  const [editTarget,  setEditTarget]  = useState<CategoryRow | null>(null)
  const [togglingId,  setTogglingId]  = useState<string | null>(null)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  function openAdd() {
    setEditTarget(null)
    setShowForm(true)
    setError(null)
  }

  function openEdit(cat: CategoryRow) {
    setEditTarget(cat)
    setShowForm(true)
    setError(null)
  }

  function handleFormSuccess(saved: CategoryRow) {
    setShowForm(false)
    setEditTarget(null)
    setCategories((prev) => {
      const exists = prev.find((c) => c.id === saved.id)
      return exists
        ? prev.map((c) => c.id === saved.id ? saved : c)
        : [saved, ...prev]
    })
  }

  async function handleToggleActive(cat: CategoryRow) {
    setTogglingId(cat.id)
    setError(null)
    const { error: err } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id)
    setTogglingId(null)
    if (err) { setError('فشل تحديث الحالة'); return }
    setCategories((prev) =>
      prev.map((c) => c.id === cat.id ? { ...c, is_active: !cat.is_active } : c)
    )
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError(null)
    const { error: err } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    setDeletingId(null)
    if (err) {
      setError(
        err.message.includes('foreign key') || err.message.includes('violates')
          ? 'لا يمكن حذف هذا التصنيف لأنه مرتبط بمنتجات. عطّله بدلًا من حذفه.'
          : 'فشل حذف التصنيف'
      )
      return
    }
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-4">

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <AdminCategoryForm
              existing={editTarget ?? undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditTarget(null) }}
            />
          </div>
        </div>
      )}

      {/* ── Add button ────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 active:scale-95 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة تصنيف
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-14 text-center">
          <p className="text-sm text-stone-400">لا توجد تصنيفات بعد</p>
          <button onClick={openAdd} className="mt-4 text-sm text-amber-600 hover:underline">
            أضف أول تصنيف
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">الاسم</th>
                <th className="px-4 py-3 text-start font-semibold">Slug</th>
                <th className="px-4 py-3 text-start font-semibold">الترتيب</th>
                <th className="px-4 py-3 text-start font-semibold">الحالة</th>
                <th className="px-4 py-3 text-start font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[...categories]
                .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
                .map((cat) => (
                  <tr key={cat.id} className={`hover:bg-stone-50 transition ${!cat.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-stone-800">{cat.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-400">{cat.slug}</td>
                    <td className="px-4 py-3 text-stone-500">{cat.sort_order}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        disabled={Boolean(togglingId || deletingId)}
                        className={`
                          inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition
                          ${cat.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }
                          disabled:cursor-not-allowed disabled:opacity-50
                        `}
                      >
                        {togglingId === cat.id ? '…' : cat.is_active ? 'مفعّل' : 'معطّل'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          disabled={Boolean(togglingId || deletingId)}
                          className="text-xs text-amber-600 hover:underline disabled:opacity-50"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={Boolean(togglingId || deletingId)}
                          className="text-xs text-rose-500 hover:underline disabled:opacity-50"
                        >
                          {deletingId === cat.id ? '…' : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

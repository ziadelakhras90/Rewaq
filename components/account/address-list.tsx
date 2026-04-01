'use client'

// components/account/address-list.tsx
// يدير state العناوين + modal الإضافة/التعديل + عمليات CRUD

import { useState }             from 'react'
import { createClient }         from '@/lib/supabase/client'
import { AddressCard }          from './address-card'
import { AddressForm }          from './address-form'
import { AddressEmptyState }    from './address-empty-state'
import {
  deleteAddress,
  setDefaultAddress,
  type CustomerAddress,
} from '@/services/address.service'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AddressListProps {
  customerId:        string
  initialAddresses:  CustomerAddress[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AddressList({ customerId, initialAddresses }: AddressListProps) {
  const supabase = createClient()

  const [addresses,      setAddresses]      = useState<CustomerAddress[]>(initialAddresses)
  const [showForm,       setShowForm]       = useState(false)
  const [editTarget,     setEditTarget]     = useState<CustomerAddress | null>(null)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)
  const [globalError,    setGlobalError]    = useState<string | null>(null)

  // ── فتح نموذج الإضافة ────────────────────────────────────────────────────
  function handleAddNew() {
    setEditTarget(null)
    setShowForm(true)
    setGlobalError(null)
  }

  // ── فتح نموذج التعديل ────────────────────────────────────────────────────
  function handleEdit(address: CustomerAddress) {
    setEditTarget(address)
    setShowForm(true)
    setGlobalError(null)
  }

  // ── إغلاق النموذج ────────────────────────────────────────────────────────
  function handleCancel() {
    setShowForm(false)
    setEditTarget(null)
  }

  // ── نجاح الإضافة / التعديل ───────────────────────────────────────────────
  function handleFormSuccess(saved: CustomerAddress) {
    setShowForm(false)
    setEditTarget(null)

    if (saved.is_default) {
      // لو الجديد/المعدَّل أصبح افتراضيًا، نلغي افتراضية الآخرين محليًا
      setAddresses((prev) =>
        prev
          .map((a) => (a.id === saved.id ? saved : { ...a, is_default: false }))
          .concat(prev.some((a) => a.id === saved.id) ? [] : [saved])
      )
    } else if (editTarget) {
      // تعديل
      setAddresses((prev) =>
        prev.map((a) => (a.id === saved.id ? saved : a))
      )
    } else {
      // إضافة جديدة
      setAddresses((prev) => [saved, ...prev])
    }
  }

  // ── حذف عنوان ────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setGlobalError(null)
    setDeletingId(id)
    try {
      const result = await deleteAddress(supabase, customerId, id)
      if (!result.success) {
        setGlobalError(result.error ?? 'فشل حذف العنوان')
        return
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch {
      setGlobalError('حدث خطأ غير متوقع')
    } finally {
      setDeletingId(null)
    }
  }

  // ── تعيين افتراضي ────────────────────────────────────────────────────────
  async function handleSetDefault(id: string) {
    setGlobalError(null)
    setSettingDefaultId(id)
    try {
      const result = await setDefaultAddress(supabase, customerId, id)
      if (!result.success) {
        setGlobalError(result.error ?? 'فشل تعيين العنوان الافتراضي')
        return
      }
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      )
    } catch {
      setGlobalError('حدث خطأ غير متوقع')
    } finally {
      setSettingDefaultId(null)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── رسالة خطأ عامة ──────────────────────────────────────────── */}
      {globalError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-700">{globalError}</p>
        </div>
      )}

      {/* ── Modal الإضافة / التعديل ──────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div
            className="
              w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-xl
              sm:rounded-2xl sm:p-7
              max-h-[90dvh] overflow-y-auto
            "
          >
            <AddressForm
              customerId={customerId}
              existing={editTarget ?? undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* ── زر الإضافة ───────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleAddNew}
          className="
            flex items-center gap-2 rounded-xl bg-amber-500
            px-4 py-2.5 text-sm font-semibold text-white shadow-sm
            hover:bg-amber-600 active:scale-95 transition
          "
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة عنوان
        </button>
      </div>

      {/* ── القائمة أو empty state ───────────────────────────────────── */}
      {addresses.length === 0 ? (
        <AddressEmptyState onAdd={handleAddNew} />
      ) : (
        <div className="space-y-3">
          {/* الافتراضي أولًا */}
          {[...addresses]
            .sort((a, b) => Number(b.is_default) - Number(a.is_default))
            .map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                deletingId={deletingId}
                settingDefaultId={settingDefaultId}
              />
            ))
          }
        </div>
      )}

    </div>
  )
}

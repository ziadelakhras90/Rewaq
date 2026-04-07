'use client'

// components/admin/admin-application-card.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getApplicationStatusLabel } from '@/lib/utils/arabic'
import type { ApplicationWithProfile } from '@/services/admin.service'
import type { ApproveSellerRequest, RejectSellerRequest } from '@/types/api.types'

interface AdminApplicationCardProps {
  application: ApplicationWithProfile
  onStatusChange: (id: string, newStatus: 'approved' | 'rejected') => void
  isFocused?: boolean
}

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
}

export function AdminApplicationCard({ application, onStatusChange, isFocused = false }: AdminApplicationCardProps) {
  const supabase = createClient()
  const isPending = application.status === 'pending'

  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleApprove() {
    setLoading('approve')
    setError(null)
    setSuccess(null)

    try {
      const body: ApproveSellerRequest = { applicationId: application.id }
      const { error: fnError } = await supabase.functions.invoke('approve-seller', { body })

      if (fnError) {
        const msg = (fnError as any)?.context?.error ?? (fnError as any)?.message ?? 'فشلت الموافقة. تحقق من صلاحياتك.'
        setError(msg)
        return
      }

      setSuccess('تمت الموافقة على الطلب بنجاح ✓')
      setTimeout(() => setSuccess(null), 3000)
      onStatusChange(application.id, 'approved')
    } catch {
      setError('تعذّر الاتصال. حاول مجددًا.')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!rejectNote.trim()) {
      setError('سبب الرفض مطلوب')
      return
    }

    setLoading('reject')
    setError(null)
    setSuccess(null)

    try {
      const body: RejectSellerRequest = { applicationId: application.id, adminNotes: rejectNote.trim() }
      const response = await fetch('/api/admin/seller-applications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error ?? 'فشل الرفض. تحقق من صلاحياتك.')
      }

      setSuccess('تم رفض الطلب ✓')
      setTimeout(() => setSuccess(null), 3000)
      onStatusChange(application.id, 'rejected')
      setShowReject(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر الاتصال. حاول مجددًا.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      id={`seller-application-${application.id}`}
      className={`space-y-4 rounded-2xl border bg-white p-5 shadow-sm transition ${isFocused ? 'border-amber-300 ring-2 ring-amber-200' : 'border-stone-200 hover:border-stone-300'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-800">{application.store_name}</p>
          <p className="mt-0.5 text-xs text-stone-400">
            {application.profiles?.full_name ?? '—'} · {formatDate(application.created_at)}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[application.status] ?? 'bg-stone-100 text-stone-600'}`}
        >
          {getApplicationStatusLabel(application.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-stone-600">
        <Detail label="المدينة" value={application.city} />
        <Detail label="الجوال" value={application.phone} />
        {application.business_type && <Detail label="نوع النشاط" value={application.business_type} />}
        {application.store_description && (
          <div className="col-span-2">
            <Detail label="وصف المتجر" value={application.store_description} />
          </div>
        )}
        {application.admin_notes && (
          <div className="col-span-2">
            <Detail label="ملاحظات الإدارة" value={application.admin_notes} />
          </div>
        )}
      </div>

      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {error}
        </p>
      )}

      {showReject && (
        <div className="space-y-2">
          <textarea
            value={rejectNote}
            onChange={(e) => {
              setRejectNote(e.target.value)
              setError(null)
            }}
            placeholder="سبب الرفض (مطلوب)..."
            rows={2}
            className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 transition focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading === 'reject'}
              className="flex-1 rounded-xl bg-rose-500 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
            >
              {loading === 'reject' ? 'جاري الرفض…' : 'تأكيد الرفض'}
            </button>
            <button
              onClick={() => {
                setShowReject(false)
                setError(null)
              }}
              disabled={Boolean(loading)}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {isPending && !showReject && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleApprove}
            disabled={Boolean(loading)}
            className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
          >
            {loading === 'approve' ? 'جاري الموافقة…' : '✓ موافقة'}
          </button>
          <button
            onClick={() => {
              setShowReject(true)
              setError(null)
            }}
            disabled={Boolean(loading)}
            className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
          >
            ✕ رفض
          </button>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null

  return (
    <div>
      <span className="text-xs text-stone-400">{label}: </span>
      <span className="text-sm text-stone-700">{value}</span>
    </div>
  )
}

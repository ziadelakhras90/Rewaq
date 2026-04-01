'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SELLER_STATUS_TRANSITIONS, updateSellerOrderStatus } from '@/services/seller-orders.service'
import type { OrderStatus } from '@/types/api.types'
import { getOrderStatusLabel } from '@/lib/utils/arabic'

interface SellerOrderStatusFormProps {
  orderId: string
  currentStatus: OrderStatus
}

export function SellerOrderStatusForm({ orderId, currentStatus }: SellerOrderStatusFormProps) {
  const supabase = createClient()
  const router = useRouter()

  const [newStatus, setNewStatus] = useState<OrderStatus>(currentStatus)
  const availableStatuses = SELLER_STATUS_TRANSITIONS[currentStatus] ?? []
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const result = await updateSellerOrderStatus(supabase, {
      orderId,
      newStatus,
      notes: notes.trim() || undefined,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'تعذّر تحديث حالة الطلب.')
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-bold text-stone-900">تحديث حالة الطلب</h3>
        <p className="mt-1 text-sm text-stone-400">الحالة الحالية: {getOrderStatusLabel(currentStatus)}</p>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700">الحالة الجديدة</label>
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20">
          <option value={currentStatus}>{getOrderStatusLabel(currentStatus)}</option>
          {availableStatuses.map((status) => (
            <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700">ملاحظة داخلية</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20" placeholder="مثال: تم تسليم الطلب لشركة الشحن" />
      </div>

      <button type="submit" disabled={loading || newStatus === currentStatus || availableStatuses.length === 0} className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? 'جارٍ الحفظ…' : 'حفظ الحالة'}
      </button>
    </form>
  )
}

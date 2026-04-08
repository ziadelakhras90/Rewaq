'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CANCELLABLE_STATUSES = ['pending', 'under_review']

export function CancelOrderButton({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!CANCELLABLE_STATUSES.includes(status)) return null

  async function handleCancel() {
    const confirmed = window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')
    if (!confirmed) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(result?.error || 'تعذر إلغاء الطلب الآن.')
        return
      }

      router.refresh()
    } catch {
      setError('تعذر إلغاء الطلب الآن.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-rose-700">يمكنك إلغاء الطلب الآن</p>
          <p className="mt-1 text-xs leading-6 text-rose-600">متاح فقط طالما الطلب ما زال قيد الانتظار أو قيد المراجعة.</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'جارٍ الإلغاء…' : 'إلغاء الطلب'}
        </button>
      </div>
      {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
}

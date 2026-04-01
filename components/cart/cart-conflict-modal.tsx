'use client'

// components/cart/cart-conflict-modal.tsx
// Component مستقل — يملك useCart مباشرة
// لا يحتاج clearCart prop من الخارج

import { useState }  from 'react'
import { useCart }   from '@/hooks/useCart'

interface CartConflictModalProps {
  userId:      string
  productId:   string
  productName: string
  quantity:    number
  onSuccess:   () => void
  onCancel:    () => void
}

export function CartConflictModal({
  userId,
  productId,
  productName,
  quantity,
  onSuccess,
  onCancel,
}: CartConflictModalProps) {
  const { clearCart, addItem } = useCart(userId)
  const [loading, setLoading]  = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await clearCart()
    const result = await addItem(productId, quantity)
    setLoading(false)
    if (result.success) {
      onSuccess()
    } else {
      // نغلق الـ modal حتى لو فشل — المستخدم يرى الخطأ في الزر الأصلي
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div dir="rtl" className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {/* أيقونة تحذير */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>

        <h3 className="text-base font-bold text-stone-900">
          سلتك تحتوي منتجات من متجر آخر
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          رِواق يدعم طلبًا واحدًا من متجر واحد في كل مرة.
          هل تريد إفراغ السلة وإضافة «{productName}» بدلًا من ذلك؟
        </p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition"
          >
            {loading
              ? <><Spinner /> جاري…</>
              : 'نعم، إفراغ وإضافة'
            }
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
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

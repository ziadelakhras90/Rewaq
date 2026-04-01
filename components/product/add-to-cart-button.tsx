'use client'

// components/product/add-to-cart-button.tsx
// refactored: CartConflictModal مستقل في components/cart/

import { useState }  from 'react'
import { useRouter } from 'next/navigation'
import { useAuth }   from '@/hooks/useAuth'
import { useCart }   from '@/hooks/useCart'
import { CartConflictModal } from '@/components/cart/cart-conflict-modal'

interface AddToCartButtonProps {
  productId:      string
  productName:    string
  stockQuantity:  number
  trackInventory: boolean
}

export function AddToCartButton({
  productId,
  productName,
  stockQuantity,
  trackInventory,
}: AddToCartButtonProps) {
  const router      = useRouter()
  const { user }    = useAuth()
  const { addItem } = useCart(user?.id ?? null)

  const [qty,      setQty]      = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)
  const [conflict, setConflict] = useState(false)

  const outOfStock = trackInventory && stockQuantity === 0
  const maxQty     = trackInventory ? stockQuantity : 99

  async function handleAdd() {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    setLoading(true)
    setFeedback(null)
    const result = await addItem(productId, qty)
    setLoading(false)

    if (result.success) {
      setFeedback('success')
      setTimeout(() => setFeedback(null), 2500)
    } else if ('conflict' in result && result.conflict) {
      setConflict(true)
    } else {
      setFeedback('error')
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  return (
    <>
      <div className="space-y-3" dir="rtl">
        {!outOfStock && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">الكمية:</span>
            <div className="flex items-center rounded-xl border border-stone-200 bg-white">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                className="flex h-9 w-9 items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 transition">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-8 text-center text-sm font-medium text-stone-800">{qty}</span>
              <button onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                disabled={trackInventory && qty >= stockQuantity}
                className="flex h-9 w-9 items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 transition">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <button onClick={handleAdd} disabled={outOfStock || loading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition
            ${outOfStock ? 'cursor-not-allowed bg-stone-100 text-stone-400'
              : feedback === 'success' ? 'bg-emerald-500 text-white'
              : feedback === 'error' ? 'bg-rose-500 text-white'
              : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-sm'}`}>
          {loading ? <><Spinner /> جاري الإضافة…</>
           : feedback === 'success' ? <><CheckIcon /> أُضيف إلى السلة</>
           : feedback === 'error' ? 'حدث خطأ، حاول مجددًا'
           : outOfStock ? 'نفد المخزون'
           : <><CartIcon /> أضف إلى السلة</>}
        </button>
      </div>

      {conflict && (
        <CartConflictModal
          userId={user!.id}
          productId={productId}
          productName={productName}
          quantity={qty}
          onSuccess={() => { setConflict(false); setFeedback('success'); setTimeout(() => setFeedback(null), 2500) }}
          onCancel={() => setConflict(false)}
        />
      )}
    </>
  )
}

function Spinner() {
  return <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
}
function CheckIcon() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
}
function CartIcon() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-9-4h4" /></svg>
}

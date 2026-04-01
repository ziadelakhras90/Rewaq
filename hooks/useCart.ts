// ─────────────────────────────────────────────────────────────────────────────
// hooks/useCart.ts
// React hook للسلة — يدير الـ state ويستدعي cart.service
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient }  from '@/lib/supabase/client'
import {
  getCartWithItems,
  addToCart        as addToCartService,
  updateCartItemQuantity,
  removeFromCart   as removeFromCartService,
  clearCart        as clearCartService,
  type CartWithItems,
  type AddToCartResult,
} from '@/services/cart.service'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseCartReturn {
  cart:           CartWithItems | null
  itemCount:      number
  subtotal:       number
  loading:        boolean
  error:          string | null

  addItem:        (productId: string, quantity?: number) => Promise<AddToCartResult>
  updateQuantity: (itemId: string, quantity: number)    => Promise<void>
  removeItem:     (itemId: string)                      => Promise<void>
  clearCart:      ()                                    => Promise<void>
  refresh:        ()                                    => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCart(userId: string | null): UseCartReturn {
  const supabase = createClient()

  const [cart,    setCart]    = useState<CartWithItems | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // ── جلب السلة ─────────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!userId) {
      setCart(null)
      return
    }
    setLoading(true)
    try {
      const data = await getCartWithItems(supabase, userId)
      setCart(data)
    } catch (err) {
      setError('فشل تحميل السلة')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // ── Realtime: تحديث السلة عند تغيير cart_items ───────────────────────────
  useEffect(() => {
    if (!userId || !cart?.id) return

    const channel = supabase
      .channel(`cart:${cart.id}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'cart_items',
          filter: `cart_id=eq.${cart.id}`,
        },
        () => { fetchCart() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, cart?.id])

  // ── addItem ────────────────────────────────────────────────────────────────
  const addItem = useCallback(async (
    productId: string,
    quantity   = 1
  ): Promise<AddToCartResult> => {
    if (!userId) return { success: false, error: 'يجب تسجيل الدخول أولًا' }

    const result = await addToCartService(supabase, userId, productId, quantity)
    if (result.success) await fetchCart()
    return result
  }, [userId, fetchCart])

  // ── updateQuantity ─────────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (
    itemId:   string,
    quantity: number
  ): Promise<void> => {
    if (!userId) return
    await updateCartItemQuantity(supabase, userId, itemId, quantity)
    await fetchCart()
  }, [userId, fetchCart])

  // ── removeItem ─────────────────────────────────────────────────────────────
  const removeItem = useCallback(async (itemId: string): Promise<void> => {
    if (!userId) return
    await removeFromCartService(supabase, userId, itemId)
    await fetchCart()
  }, [userId, fetchCart])

  // ── clearCart ──────────────────────────────────────────────────────────────
  const clear = useCallback(async (): Promise<void> => {
    if (!userId) return
    await clearCartService(supabase, userId)
    await fetchCart()
  }, [userId, fetchCart])

  // ── المجاميع ───────────────────────────────────────────────────────────────
  const itemCount = cart?.cart_items?.reduce(
    (sum, item) => sum + item.quantity, 0
  ) ?? 0

  const subtotal = cart?.cart_items?.reduce(
    (sum, item) => sum + item.quantity * Number(item.products.price), 0
  ) ?? 0

  return {
    cart,
    itemCount,
    subtotal,
    loading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: clear,
    refresh:   fetchCart,
  }
}

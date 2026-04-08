'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getCartWithItems,
  addToCart as addToCartService,
  updateCartItemQuantity,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
  type CartWithItems,
  type AddToCartResult,
} from '@/services/cart.service'

export interface UseCartReturn {
  cart: CartWithItems | null
  itemCount: number
  subtotal: number
  loading: boolean
  error: string | null
  addItem: (productId: string, quantity?: number) => Promise<AddToCartResult>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refresh: () => Promise<void>
}

type CartState = {
  userId: string | null
  cart: CartWithItems | null
  loading: boolean
  error: string | null
  pendingItemCountDelta: number
}

const supabase = createClient()
const initialCartState: CartState = {
  userId: null,
  cart: null,
  loading: false,
  error: null,
  pendingItemCountDelta: 0,
}

let cartState: CartState = initialCartState
let fetchPromise: Promise<void> | null = null
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null
const cartListeners = new Set<(state: CartState) => void>()

function emitCartState() {
  cartListeners.forEach((listener) => listener(cartState))
}

function setCartState(updater: CartState | ((prev: CartState) => CartState)) {
  cartState = typeof updater === 'function' ? (updater as (prev: CartState) => CartState)(cartState) : updater
  emitCartState()
}

function subscribe(listener: (state: CartState) => void) {
  cartListeners.add(listener)
  listener(cartState)
  return () => {
    cartListeners.delete(listener)
  }
}

function teardownRealtime() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
}

function setupRealtime(cartId: string | null) {
  teardownRealtime()

  if (!cartState.userId || !cartId) return

  realtimeChannel = supabase
    .channel(`cart:${cartState.userId}:${cartId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: `cart_id=eq.${cartId}`,
      },
      () => {
        void fetchCart(cartState.userId, { silent: true })
      }
    )
    .subscribe()
}

async function fetchCart(userId: string | null, options?: { silent?: boolean }) {
  if (!userId) {
    teardownRealtime()
    setCartState({ ...initialCartState })
    return
  }

  if (fetchPromise) return fetchPromise

  const silent = options?.silent ?? false

  if (!silent) {
    setCartState((prev) => ({ ...prev, userId, loading: true, error: null }))
  }

  fetchPromise = (async () => {
    try {
      const data = await getCartWithItems(supabase, userId)
      setCartState((prev) => ({
        ...prev,
        userId,
        cart: data,
        loading: false,
        error: null,
        pendingItemCountDelta: 0,
      }))
      setupRealtime(data?.id ?? null)
    } catch {
      setCartState((prev) => ({
        ...prev,
        userId,
        loading: false,
        error: 'فشل تحميل السلة',
      }))
    } finally {
      fetchPromise = null
    }
  })()

  return fetchPromise
}

function cloneCart(cart: CartWithItems | null): CartWithItems | null {
  if (!cart) return null
  return {
    ...cart,
    cart_items: Array.isArray(cart.cart_items) ? cart.cart_items.map((item) => ({
      ...item,
      products: item.products ? { ...item.products, product_images: Array.isArray(item.products.product_images) ? [...item.products.product_images] : [] } : item.products,
    })) : [],
  }
}

export function useCart(userId: string | null): UseCartReturn {
  const [state, setState] = useState<CartState>(cartState)

  useEffect(() => subscribe(setState), [])

  useEffect(() => {
    if (!userId) {
      void fetchCart(null)
      return
    }

    if (cartState.userId !== userId || (!cartState.cart && !cartState.loading)) {
      void fetchCart(userId)
    }
  }, [userId])

  const addItem = useCallback(async (productId: string, quantity = 1): Promise<AddToCartResult> => {
    if (!userId) return { success: false, error: 'يجب تسجيل الدخول أولًا' }

    const previousState = cartState
    setCartState((prev) => ({
      ...prev,
      userId,
      pendingItemCountDelta: prev.pendingItemCountDelta + quantity,
    }))

    const result = await addToCartService(supabase, userId, productId, quantity)

    if (!result.success) {
      setCartState(previousState)
      return result
    }

    await fetchCart(userId, { silent: true })
    return result
  }, [userId])

  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<void> => {
    if (!userId) return

    const previousState = cartState
    const nextCart = cloneCart(cartState.cart)
    if (nextCart) {
      nextCart.cart_items = nextCart.cart_items.map((item) => (
        item.id === itemId ? { ...item, quantity } : item
      ))
      setCartState((prev) => ({ ...prev, cart: nextCart }))
    }

    const result = await updateCartItemQuantity(supabase, userId, itemId, quantity)
    if (!result.success) {
      setCartState(previousState)
      return
    }

    void fetchCart(userId, { silent: true })
  }, [userId])

  const removeItem = useCallback(async (itemId: string): Promise<void> => {
    if (!userId) return

    const previousState = cartState
    const nextCart = cloneCart(cartState.cart)
    if (nextCart) {
      nextCart.cart_items = nextCart.cart_items.filter((item) => item.id !== itemId)
      setCartState((prev) => ({ ...prev, cart: nextCart }))
    }

    const result = await removeFromCartService(supabase, userId, itemId)
    if (!result.success) {
      setCartState(previousState)
      return
    }

    void fetchCart(userId, { silent: true })
  }, [userId])

  const clearCart = useCallback(async (): Promise<void> => {
    if (!userId) return

    const previousState = cartState
    const nextCart = cloneCart(cartState.cart)
    if (nextCart) {
      nextCart.cart_items = []
      setCartState((prev) => ({ ...prev, cart: nextCart }))
    }

    const result = await clearCartService(supabase, userId)
    if (!result.success) {
      setCartState(previousState)
      return
    }

    void fetchCart(userId, { silent: true })
  }, [userId])

  const refresh = useCallback(async (): Promise<void> => {
    await fetchCart(userId)
  }, [userId])

  const safeCartItems = useMemo(
    () => (Array.isArray(state.cart?.cart_items) ? state.cart!.cart_items : []),
    [state.cart]
  )

  const itemCount = useMemo(() => {
    const baseCount = safeCartItems.reduce((sum, item) => sum + Number(item?.quantity ?? 0), 0)
    return Math.max(0, baseCount + state.pendingItemCountDelta)
  }, [safeCartItems, state.pendingItemCountDelta])

  const subtotal = useMemo(() => {
    return safeCartItems.reduce((sum, item) => {
      const quantity = Number(item?.quantity ?? 0)
      const unitPrice = Number((item as any)?.products?.price ?? (item as any)?.unit_price ?? 0)
      return sum + quantity * unitPrice
    }, 0)
  }, [safeCartItems])

  return {
    cart: state.cart,
    itemCount,
    subtotal,
    loading: state.loading,
    error: state.error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refresh,
  }
}

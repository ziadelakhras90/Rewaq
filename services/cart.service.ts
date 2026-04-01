// ─────────────────────────────────────────────────────────────────────────────
// services/cart.service.ts
// منطق السلة — single-vendor enforcement
// لا يعرف عن UI أو HTTP — يُستدعى من hooks أو server actions
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type SupabaseClient = any

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Cart = Database['public']['Tables']['carts']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']

export interface CartItemWithProduct extends CartItem {
  products: {
    id:             string
    name:           string
    slug:           string
    price:          number
    stock_quantity: number
    track_inventory: boolean
    status:         string
    store_id:       string
    product_images: { url: string; is_primary: boolean }[]
  }
}

export interface CartWithItems extends Cart {
  cart_items: CartItemWithProduct[]
}

export type AddToCartResult =
  | { success: true }
  | { success: false; error: string }
  | { success: false; conflict: true; currentStoreId: string; newStoreId: string }

// ─────────────────────────────────────────────────────────────────────────────
// getOrCreateActiveCart
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrCreateActiveCart(
  supabase:   SupabaseClient,
  customerId: string
): Promise<Cart> {
  // محاولة جلب السلة النشطة
  const { data: existing } = await supabase
    .from('carts')
    .select('*')
    .eq('customer_id', customerId)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) return existing

  // إنشاء سلة جديدة
  const { data: created, error } = await supabase
    .from('carts')
    .insert({ customer_id: customerId, status: 'active' })
    .select()
    .single()

  if (error || !created) {
    throw new Error('فشل إنشاء سلة التسوق')
  }

  return created
}

// ─────────────────────────────────────────────────────────────────────────────
// getCartWithItems
// ─────────────────────────────────────────────────────────────────────────────

export async function getCartWithItems(
  supabase:   SupabaseClient,
  customerId: string
): Promise<CartWithItems | null> {
  const { data, error } = await supabase
    .from('carts')
    .select(`
      *,
      cart_items (
        *,
        products (
          id,
          name,
          slug,
          price,
          stock_quantity,
          track_inventory,
          status,
          store_id,
          product_images (
            url,
            is_primary
          )
        )
      )
    `)
    .eq('customer_id', customerId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) {
    console.error('getCartWithItems error:', error)
    return null
  }

  return data as any as CartWithItems | null
}

// ─────────────────────────────────────────────────────────────────────────────
// addToCart
// ─────────────────────────────────────────────────────────────────────────────

export async function addToCart(
  supabase:   SupabaseClient,
  customerId: string,
  productId:  string,
  quantity:   number = 1
): Promise<AddToCartResult> {
  // 1. جلب بيانات المنتج
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, price, stock_quantity, track_inventory, status, store_id')
    .eq('id', productId)
    .maybeSingle()

  if (productError || !product) {
    return { success: false, error: 'المنتج غير موجود' }
  }

  if (product.status !== 'active') {
    return { success: false, error: 'هذا المنتج غير متاح حاليًا' }
  }

  if (product.track_inventory && product.stock_quantity < quantity) {
    return { success: false, error: `الكمية المتاحة: ${product.stock_quantity}` }
  }

  // 2. جلب أو إنشاء السلة النشطة
  const cart = await getOrCreateActiveCart(supabase, customerId)

  // 3. التحقق من تعارض المتجر (single-vendor enforcement)
  if (cart.store_id && cart.store_id !== product.store_id) {
    return {
      success:        false,
      conflict:       true,
      currentStoreId: cart.store_id,
      newStoreId:     product.store_id,
    }
  }

  // 4. إضافة العنصر أو زيادة الكمية
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cart.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existingItem) {
    const newQty = existingItem.quantity + quantity

    // تحقق من المخزون بعد الزيادة
    if (product.track_inventory && product.stock_quantity < newQty) {
      return { success: false, error: `الكمية المتاحة: ${product.stock_quantity}` }
    }

    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', existingItem.id)

    if (updateError) return { success: false, error: 'فشل تحديث الكمية' }
  } else {
    const { error: insertError } = await supabase
      .from('cart_items')
      .insert({
        cart_id:    cart.id,
        product_id: productId,
        quantity,
        unit_price: product.price,
      })

    if (insertError) return { success: false, error: 'فشل إضافة المنتج' }
  }

  // 5. تعيين store_id في السلة إذا كانت فارغة
  if (!cart.store_id) {
    await supabase
      .from('carts')
      .update({ store_id: product.store_id })
      .eq('id', cart.id)
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// updateCartItemQuantity
// ─────────────────────────────────────────────────────────────────────────────

export async function updateCartItemQuantity(
  supabase:   SupabaseClient,
  customerId: string,
  itemId:     string,
  quantity:   number
): Promise<{ success: boolean; error?: string }> {
  if (quantity < 1) {
    return removeFromCart(supabase, customerId, itemId)
  }

  // تحقق من الملكية أولًا
  const { data: item } = await supabase
    .from('cart_items')
    .select('id, product_id, carts!inner(customer_id)')
    .eq('id', itemId)
    .maybeSingle()

  if (!item || (item.carts as any)?.customer_id !== customerId) {
    return { success: false, error: 'العنصر غير موجود' }
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)

  if (error) return { success: false, error: 'فشل تحديث الكمية' }
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// removeFromCart
// ─────────────────────────────────────────────────────────────────────────────

export async function removeFromCart(
  supabase:   SupabaseClient,
  customerId: string,
  itemId:     string
): Promise<{ success: boolean; error?: string }> {
  // نتحقق من الملكية عبر JOIN — RLS يحمي لكن نتحقق مزدوج
  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .in('cart_id', (
      supabase.from('carts').select('id').eq('customer_id', customerId).eq('status', 'active') as any
    ))

  if (deleteError) return { success: false, error: 'فشل حذف العنصر' }

  // لو السلة أصبحت فارغة، نمسح store_id
  await clearStoreIdIfEmpty(supabase, customerId)

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// clearCart — يُستخدم عند conflict (المستخدم يريد البدء من متجر جديد)
// ─────────────────────────────────────────────────────────────────────────────

export async function clearCart(
  supabase:   SupabaseClient,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const cart = await getOrCreateActiveCart(supabase, customerId)

  // حذف كل العناصر (ON DELETE CASCADE من carts — لكن نحذفها يدويًا للوضوح)
  await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)

  // مسح store_id
  await supabase
    .from('carts')
    .update({ store_id: null })
    .eq('id', cart.id)

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// getCartItemCount — للـ badge في الـ header
// ─────────────────────────────────────────────────────────────────────────────

export async function getCartItemCount(
  supabase:   SupabaseClient,
  customerId: string
): Promise<number> {
  const { data } = await supabase
    .from('carts')
    .select('cart_items(quantity)')
    .eq('customer_id', customerId)
    .eq('status', 'active')
    .maybeSingle()

  if (!data) return 0

  const items = (data as any).cart_items as { quantity: number }[] ?? []
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

async function clearStoreIdIfEmpty(
  supabase:   SupabaseClient,
  customerId: string
): Promise<void> {
  const { data: cart } = await supabase
    .from('carts')
    .select('id, cart_items(id)')
    .eq('customer_id', customerId)
    .eq('status', 'active')
    .maybeSingle()

  if (!cart) return

  const itemCount = ((cart as any).cart_items as any[])?.length ?? 0
  if (itemCount === 0) {
    await supabase
      .from('carts')
      .update({ store_id: null })
      .eq('id', cart.id)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// supabase/functions/create-order/index.ts
//
// Edge Function: إنشاء طلب جديد
// تُستدعى من client عبر supabase.functions.invoke('create-order', { body })
// ─────────────────────────────────────────────────────────────────────────────

import {
  getAdminClient,
  json,
  handleOptions,
  handleError,
  requireUser,
  getUserEmail,
  sendBrevoEmail,
  BREVO_TEMPLATES,
  AuthError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../_shared/helpers.ts'

import type {
  CreateOrderRequest,
  CreateOrderResponse,
  CartWithItems,
  CartItemWithProduct,
  CustomerAddress,
} from '../../../types/api.types.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabase = getAdminClient()

  try {
    // ── 1. التحقق من المستخدم ─────────────────────────────────────────────
    const user = await requireUser(req, supabase)

    // ── 2. قراءة وتحقق من body ────────────────────────────────────────────
    let body: CreateOrderRequest
    try {
      body = await req.json()
    } catch {
      throw new ValidationError('Request body غير صالح')
    }

    const { cartId, addressId, paymentMethod, notes } = body

    if (!cartId)        throw new ValidationError('cartId مطلوب')
    if (!addressId)     throw new ValidationError('addressId مطلوب')
    if (!paymentMethod) throw new ValidationError('paymentMethod مطلوب')

    const allowedPaymentMethods = ['cash_on_delivery', 'bank_transfer']
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      throw new ValidationError(`paymentMethod غير مدعوم: ${paymentMethod}`)
    }

    // ── 3. جلب السلة مع عناصرها ومنتجاتها ───────────────────────────────
    const cart = await fetchCartWithItems(supabase, cartId, user.id)

    // ── 4. التحقق من السلة ────────────────────────────────────────────────
    validateCart(cart, user.id)

    // ── 5. التحقق من أن كل المنتجات من نفس المتجر ───────────────────────
    const storeId = validateSingleVendor(cart)

    // ── 6. التحقق من حالة المتجر ─────────────────────────────────────────
    await validateStoreActive(supabase, storeId)

    // ── 7. التحقق من الأسعار والمخزون ────────────────────────────────────
    const { items, subtotal, priceDiscrepancies } = validateItemsAndPrices(cart)

    // إذا تغيّرت الأسعار، نعيد للـ client ليقرر (لا نمضي بصمت)
    if (priceDiscrepancies.length > 0) {
      return json({
        error:             'تغيّرت أسعار بعض المنتجات منذ إضافتها للسلة',
        code:              'PRICE_CHANGED',
        priceDiscrepancies,
      }, 409)
    }

    // ── 8. جلب عنوان التوصيل ─────────────────────────────────────────────
    const address = await fetchAddress(supabase, addressId, user.id)

    // ── 9. توليد رقم الطلب ────────────────────────────────────────────────
    const orderNumber = await generateOrderNumber(supabase)

    // ── 10. حساب المبالغ النهائية ─────────────────────────────────────────
    const deliveryFee    = 0     // MVP: شحن مجاني أو ثابت — يُطوَّر لاحقًا
    const discountAmount = 0     // MVP: لا كوبونات بعد
    const totalAmount    = subtotal + deliveryFee - discountAmount

    // ── 11. تنفيذ الـ Transaction عبر RPC ────────────────────────────────
    const { data: orderId, error: rpcError } = await supabase.rpc(
      'create_order_transaction',
      {
        p_order_number:    orderNumber,
        p_customer_id:     user.id,
        p_store_id:        storeId,
        p_cart_id:         cartId,

        p_delivery_name:     address.full_name,
        p_delivery_phone:    address.phone,
        p_delivery_city:     address.city,
        p_delivery_district: address.district ?? null,
        p_delivery_street:   address.street   ?? null,
        p_delivery_notes:    address.notes    ?? null,

        p_subtotal:        subtotal,
        p_delivery_fee:    deliveryFee,
        p_discount_amount: discountAmount,
        p_total_amount:    totalAmount,

        p_payment_method: paymentMethod,
        p_notes:          notes ?? null,

        p_items: items,
      }
    )

    if (rpcError) {
      // خطأ مخزون من Postgres (ERRCODE P0001)
      if (rpcError.message?.includes('نفد المخزون')) {
        throw new ConflictError(rpcError.message)
      }
      console.error('RPC error:', rpcError)
      throw new Error('فشل إنشاء الطلب في قاعدة البيانات')
    }

    const finalOrderId = orderId as string

    // ── 12. إشعار داخلي للبائع ────────────────────────────────────────────
    await notifySeller(supabase, storeId, finalOrderId, orderNumber)

    // ── 13. إرسال إيميل تأكيد للعميل ─────────────────────────────────────
    await sendOrderConfirmationEmail(supabase, user, orderNumber, totalAmount)

    // ── 14. الرد على الـ client ───────────────────────────────────────────
    const response: CreateOrderResponse = {
      orderId:     finalOrderId,
      orderNumber,
    }

    return json(response, 201)

  } catch (err) {
    return handleError(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers (خاصة بهذه الـ function)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCartWithItems(
  supabase:   ReturnType<typeof getAdminClient>,
  cartId:     string,
  customerId: string
): Promise<CartWithItems> {
  const { data, error } = await supabase
    .from('carts')
    .select(`
      id,
      customer_id,
      store_id,
      status,
      cart_items (
        id,
        cart_id,
        product_id,
        quantity,
        unit_price,
        products (
          id,
          name,
          sku,
          price,
          stock_quantity,
          track_inventory,
          status,
          store_id,
          stores (
            id,
            status
          )
        )
      )
    `)
    .eq('id', cartId)
    .eq('customer_id', customerId)   // RLS إضافية: السلة تخص هذا المستخدم
    .maybeSingle()

  if (error) {
    console.error('fetchCartWithItems error:', error)
    throw new Error('فشل جلب بيانات السلة')
  }

  if (!data) {
    throw new NotFoundError('السلة غير موجودة')
  }

  return data as unknown as CartWithItems
}

function validateCart(cart: CartWithItems, customerId: string): void {
  if (cart.customer_id !== customerId) {
    throw new AuthError('هذه السلة لا تخصك')
  }

  if (cart.status !== 'active') {
    throw new ConflictError(
      cart.status === 'checked_out'
        ? 'هذه السلة تم تحويلها إلى طلب مسبقًا'
        : 'السلة غير نشطة'
    )
  }

  if (!cart.cart_items || cart.cart_items.length === 0) {
    throw new ValidationError('السلة فارغة')
  }
}

function validateSingleVendor(cart: CartWithItems): string {
  const storeIds = new Set(
    cart.cart_items.map((item) => item.products.store_id)
  )

  if (storeIds.size > 1) {
    // هذا لا يجب أن يحدث إذا كانت cart.service.ts تعمل بشكل صحيح
    throw new ConflictError(
      'السلة تحتوي منتجات من متاجر متعددة. يرجى إعادة تنظيم السلة.'
    )
  }

  const storeId = [...storeIds][0]

  // تحقق إضافي: يجب أن يتطابق مع cart.store_id المحفوظ
  if (cart.store_id && cart.store_id !== storeId) {
    throw new ConflictError('تعارض في متجر السلة')
  }

  return storeId
}

async function validateStoreActive(
  supabase: ReturnType<typeof getAdminClient>,
  storeId:  string
): Promise<void> {
  const { data } = await supabase
    .from('stores')
    .select('status')
    .eq('id', storeId)
    .single()

  if (!data || data.status !== 'active') {
    throw new ConflictError('المتجر غير متاح حاليًا')
  }
}

interface ValidatedItem {
  product_id:   string
  product_name: string
  product_sku:  string | null
  unit_price:   number
  quantity:     number
  total_price:  number
}

interface PriceDiscrepancy {
  productId:   string
  productName: string
  cartPrice:   number
  actualPrice: number
}

function validateItemsAndPrices(cart: CartWithItems): {
  items:               ValidatedItem[]
  subtotal:            number
  priceDiscrepancies:  PriceDiscrepancy[]
} {
  const items:              ValidatedItem[]      = []
  const priceDiscrepancies: PriceDiscrepancy[]   = []
  let subtotal = 0

  for (const item of cart.cart_items) {
    const product = item.products

    // المنتج يجب أن يكون active
    if (product.status !== 'active') {
      throw new ConflictError(
        `المنتج "${product.name}" لم يعد متاحًا`
      )
    }

    // تحقق من المخزون
    if (product.track_inventory && product.stock_quantity < item.quantity) {
      throw new ConflictError(
        `الكمية المطلوبة من "${product.name}" (${item.quantity}) ` +
        `تتجاوز المخزون المتاح (${product.stock_quantity})`
      )
    }

    // تحقق من السعر: السعر الفعلي من DB vs السعر في السلة
    const actualPrice = Number(product.price)
    const cartPrice   = Number(item.unit_price)

    if (Math.abs(actualPrice - cartPrice) > 0.01) {
      priceDiscrepancies.push({
        productId:   product.id,
        productName: product.name,
        cartPrice,
        actualPrice,
      })
    }

    // نستخدم السعر الفعلي من DB دائمًا
    const lineTotal = actualPrice * item.quantity
    subtotal += lineTotal

    items.push({
      product_id:   product.id,
      product_name: product.name,
      product_sku:  product.sku,
      unit_price:   actualPrice,
      quantity:     item.quantity,
      total_price:  lineTotal,
    })
  }

  return { items, subtotal, priceDiscrepancies }
}

async function fetchAddress(
  supabase:   ReturnType<typeof getAdminClient>,
  addressId:  string,
  customerId: string
): Promise<CustomerAddress> {
  const { data, error } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('id', addressId)
    .eq('customer_id', customerId)   // يضمن أن العنوان يخص هذا العميل
    .maybeSingle()

  if (error) {
    console.error('fetchAddress error:', error)
    throw new Error('فشل جلب عنوان التوصيل')
  }

  if (!data) {
    throw new NotFoundError('عنوان التوصيل غير موجود')
  }

  return data as CustomerAddress
}

async function generateOrderNumber(
  supabase: ReturnType<typeof getAdminClient>
): Promise<string> {
  // نستخدم الـ sequence function من migration 022
  const { data, error } = await supabase.rpc('generate_order_number')

  if (error || !data) {
    console.error('generate_order_number error:', error)
    throw new Error('فشل توليد رقم الطلب')
  }

  return data as string
}

async function notifySeller(
  supabase:    ReturnType<typeof getAdminClient>,
  storeId:     string,
  orderId:     string,
  orderNumber: string
): Promise<void> {
  // نجلب seller_id من المتجر
  const { data: store } = await supabase
    .from('stores')
    .select('seller_id, name')
    .eq('id', storeId)
    .single()

  if (!store) return

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: store.seller_id,
      type:    'order_pending',
      title:   'طلب جديد وصل لمتجرك',
      body:    `رقم الطلب: ${orderNumber}`,
      link:    `/seller/orders/${orderNumber}`,
    })

  if (error) {
    // نسجّل فقط — الإشعار لا يوقف الطلب
    console.error('notifySeller error:', error)
  }
}

async function sendOrderConfirmationEmail(
  supabase:    ReturnType<typeof getAdminClient>,
  user:        { id: string; email: string },
  orderNumber: string,
  totalAmount: number
): Promise<void> {
  // email قد يكون موجودًا من JWT، لكن نتحقق من admin API للتأكد
  const email = user.email || await getUserEmail(user.id, supabase)
  if (!email) return

  await sendBrevoEmail({
    to:         email,
    templateId: BREVO_TEMPLATES.ORDER_CONFIRMED,
    params: {
      order_number: orderNumber,
      total_amount: totalAmount.toFixed(2),
      track_link:   `${Deno.env.get('APP_URL') ?? ''}/account/orders/${orderNumber}`,
    },
  })
}

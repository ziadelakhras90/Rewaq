// ─────────────────────────────────────────────────────────────────────────────
// supabase/functions/update-order-status/index.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  getAdminClient,
  json,
  handleOptions,
  handleError,
  requireUser,
  sendBrevoEmail,
  BREVO_TEMPLATES,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../_shared/helpers.ts'

import type {
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  OrderStatus,
} from '../../../types/api.types.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Transition maps — الانتقالات المسموحة لكل دور
// ─────────────────────────────────────────────────────────────────────────────

const SELLER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped'],
  // shipped → delivered: يؤكدها العميل أو الأدمن فقط
}

const ADMIN_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'cancelled'],
  delivered:  ['refunded'],
  cancelled:  ['refunded'],
}

// نصوص الإشعارات للعميل
const STATUS_NOTIFICATION: Partial<Record<OrderStatus, { title: string; body: string }>> = {
  confirmed:  { title: 'تم تأكيد طلبك',         body: 'البائع أكّد طلبك وبدأ التجهيز.' },
  processing: { title: 'طلبك قيد التجهيز',        body: 'يتم تجهيز طلبك الآن.' },
  shipped:    { title: 'طلبك في الطريق إليك',      body: 'تم شحن طلبك وهو في طريقه إليك.' },
  delivered:  { title: 'تم تسليم طلبك',           body: 'نتمنى أن ينال رضاك.' },
  cancelled:  { title: 'تم إلغاء طلبك',           body: 'تواصل معنا إذا كان لديك استفسار.' },
  refunded:   { title: 'تم استرداد قيمة طلبك',    body: 'سيتم إعادة المبلغ خلال 3-5 أيام عمل.' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  const supabase = getAdminClient()

  try {
    // ── 1. تحقق من المستخدم ───────────────────────────────────────────────
    const user = await requireUser(req, supabase)

    // ── 2. body ───────────────────────────────────────────────────────────
    let body: UpdateOrderStatusRequest
    try {
      body = await req.json()
    } catch {
      throw new ValidationError('Request body غير صالح')
    }

    const { orderId, newStatus, notes } = body
    if (!orderId)   throw new ValidationError('orderId مطلوب')
    if (!newStatus) throw new ValidationError('newStatus مطلوب')

    // ── 3. جلب الطلب ──────────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, store_id, customer_id, order_number')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError) throw new Error('فشل جلب الطلب')
    if (!order)     throw new NotFoundError('الطلب غير موجود')

    const currentStatus = order.status as OrderStatus

    // ── 4. تحديد دور المستخدم وصلاحياته ──────────────────────────────────
    const [adminRoleResult, sellerStoreResult] = await Promise.all([
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle(),

      supabase
        .from('stores')
        .select('id')
        .eq('seller_id', user.id)
        .eq('id', order.store_id)
        .maybeSingle(),
    ])

    const isAdmin  = !!adminRoleResult.data
    const isSeller = !!sellerStoreResult.data

    if (!isAdmin && !isSeller) {
      throw new ForbiddenError('ليس لديك صلاحية تعديل حالة هذا الطلب')
    }

    // ── 5. التحقق من صحة الانتقال ─────────────────────────────────────────
    const allowedTransitions = isAdmin
      ? ADMIN_TRANSITIONS[currentStatus]  ?? []
      : SELLER_TRANSITIONS[currentStatus] ?? []

    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `لا يمكن الانتقال من "${currentStatus}" إلى "${newStatus}". ` +
        `الانتقالات المسموحة: ${allowedTransitions.join(', ') || 'لا يوجد'}`
      )
    }

    // ── 6. تنفيذ الـ transaction ───────────────────────────────────────────
    const { error: rpcError } = await supabase.rpc('update_order_status_transaction', {
      p_order_id:   orderId,
      p_old_status: currentStatus,
      p_new_status: newStatus,
      p_changed_by: user.id,
      p_notes:      notes ?? null,
    })

    if (rpcError) {
      console.error('update_order_status_transaction error:', rpcError)
      throw new Error('فشل تحديث حالة الطلب')
    }

    // ── 7. إشعار داخلي للعميل ─────────────────────────────────────────────
    const notification = STATUS_NOTIFICATION[newStatus]
    if (notification) {
      await supabase.from('notifications').insert({
        user_id: order.customer_id,
        type:    `order_${newStatus}`,
        title:   notification.title,
        body:    notification.body,
        link:    `/account/orders/${order.order_number}`,
      })
    }

    // ── 8. إرسال إيميل عند الشحن ─────────────────────────────────────────
    if (newStatus === 'shipped') {
      const { data: customerAuth } = await supabase.auth.admin.getUserById(
        order.customer_id
      )
      const customerEmail = customerAuth?.user?.email
      if (customerEmail) {
        await sendBrevoEmail({
          to:         customerEmail,
          templateId: BREVO_TEMPLATES.ORDER_SHIPPED,
          params: {
            order_number: order.order_number,
            track_link:   `${Deno.env.get('APP_URL') ?? ''}/account/orders/${order.order_number}`,
          },
        })
      }
    }

    // ── 9. audit log (للأدمن فقط) ─────────────────────────────────────────
    if (isAdmin) {
      await supabase.from('admin_audit_logs').insert({
        admin_id:    user.id,
        action:      'update_order_status',
        target_type: 'order',
        target_id:   orderId,
        notes:       `${currentStatus} → ${newStatus}${notes ? ': ' + notes : ''}`,
      })
    }

    const response: UpdateOrderStatusResponse = { success: true, newStatus }
    return json(response)

  } catch (err) {
    return handleError(err)
  }
})

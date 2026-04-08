import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const CUSTOMER_CANCELLABLE_STATUSES = ['pending', 'under_review'] as const

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const supabase = await createClient()
  const service = createServiceClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولًا.' }, { status: 401 })
  }

  const { data: order, error: orderError } = await service
    .from('orders')
    .select('id, customer_id, status, order_number, store_id')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError) {
    return NextResponse.json({ error: 'تعذر جلب الطلب.' }, { status: 500 })
  }

  if (!order || order.customer_id !== user.id) {
    return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 })
  }

  if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json({ error: 'لا يمكن إلغاء الطلب بعد تأكيده.' }, { status: 400 })
  }

  const { data: items } = await service
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', order.id)

  const { error: updateError } = await service
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', order.id)

  if (updateError) {
    return NextResponse.json({ error: 'تعذر إلغاء الطلب.' }, { status: 500 })
  }

  await service
    .from('order_status_history')
    .insert({
      order_id: order.id,
      old_status: order.status,
      new_status: 'cancelled',
      changed_by: user.id,
      notes: 'ألغى العميل الطلب بنفسه قبل التأكيد',
    })

  if (Array.isArray(items)) {
    for (const item of items) {
      const { data: product } = await service
        .from('products')
        .select('id, stock_quantity, track_inventory')
        .eq('id', item.product_id)
        .maybeSingle()

      if (product?.track_inventory) {
        await service
          .from('products')
          .update({ stock_quantity: Number(product.stock_quantity ?? 0) + Number(item.quantity ?? 0) })
          .eq('id', item.product_id)
      }
    }
  }

  await service
    .from('notifications')
    .insert({
      user_id: user.id,
      type: 'order_cancelled',
      title: 'تم إلغاء طلبك',
      body: 'ألغيت الطلب قبل تأكيده ويمكنك متابعة التسوق الآن.',
      link: `/account/orders/${order.order_number}`,
    })

  return NextResponse.json({ success: true })
}

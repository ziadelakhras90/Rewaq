// ─────────────────────────────────────────────────────────────────────────────
// services/order.service.ts
// منطق جلب الطلبات للعميل
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type OrderRow         = Database['public']['Tables']['orders']['Row']
type OrderItemRow     = Database['public']['Tables']['order_items']['Row']
type OrderHistoryRow  = Database['public']['Tables']['order_status_history']['Row']

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderSummary extends OrderRow {
  item_count: number
}

export interface OrderDetails extends OrderRow {
  order_items: OrderItemRow[]
  order_status_history: OrderHistoryRow[]
  stores: {
    id:       string
    name:     string
    slug:     string
    logo_url: string | null
  } | null
}

// ─────────────────────────────────────────────────────────────────────────────
// getCustomerOrders — قائمة الطلبات مع عدد العناصر
// ─────────────────────────────────────────────────────────────────────────────

export async function getCustomerOrders(customerId: string): Promise<OrderSummary[]> {
  const supabase = (await createClient()) as any

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items ( id )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getCustomerOrders error:', error)
    return []
  }

  return ((data as any[]) ?? []).map((order: any) => ({
    ...order,
    item_count: (order as any).order_items?.length ?? 0,
    order_items: undefined,   // نحذف العناصر من النتيجة، لا نحتاجها هنا
  })) as OrderSummary[]
}

// ─────────────────────────────────────────────────────────────────────────────
// getOrderDetails — تفاصيل طلب واحد
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrderDetails(
  orderNumber: string,
  customerId:  string
): Promise<OrderDetails | null> {
  const supabase = (await createClient()) as any

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      stores (
        id,
        name,
        slug,
        logo_url
      ),
      order_items (*),
      order_status_history (
        *
      )
    `)
    .eq('order_number', orderNumber)
    .eq('customer_id', customerId)   // RLS مزدوج: نضمن أن الطلب يخص هذا العميل
    .maybeSingle()

  if (error) {
    console.error('getOrderDetails error:', error)
    return null
  }

  if (!data) return null

  // ترتيب الـ history تصاعديًا
  const sortedHistory = [...((data as any).order_status_history ?? [])].sort(
    (a: OrderHistoryRow, b: OrderHistoryRow) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return {
    ...(data as any),
    order_status_history: sortedHistory,
  } as unknown as OrderDetails
}

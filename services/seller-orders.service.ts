import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UpdateOrderStatusResponse, UpdateOrderStatusRequest, OrderStatus } from '@/types/api.types'

type AppSupabaseClient = SupabaseClient<Database, 'public', any>
type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderItemRow = Database['public']['Tables']['order_items']['Row']
type OrderHistoryRow = Database['public']['Tables']['order_status_history']['Row']

export interface SellerOrderSummary extends OrderRow {
  item_count: number
}

export interface SellerOrderDetails extends OrderRow {
  order_items: OrderItemRow[]
  order_status_history: OrderHistoryRow[]
}

export async function getSellerOrders(
  supabase: AppSupabaseClient,
  userId: string
): Promise<SellerOrderSummary[]> {
  const { data: store } = await supabase.from('stores').select('id').eq('seller_id', userId).maybeSingle()
  if (!store) return []

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items ( id )
    `)
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getSellerOrders error:', error)
    return []
  }

  return (data ?? []).map((order: any) => ({
    ...order,
    item_count: order.order_items?.length ?? 0,
  })) as SellerOrderSummary[]
}

export async function getSellerOrderDetails(
  supabase: AppSupabaseClient,
  userId: string,
  orderNumber: string
): Promise<SellerOrderDetails | null> {
  const { data: store } = await supabase.from('stores').select('id').eq('seller_id', userId).maybeSingle()
  if (!store) return null

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items ( * ),
      order_status_history ( * )
    `)
    .eq('store_id', store.id)
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (error) {
    console.error('getSellerOrderDetails error:', error)
    return null
  }

  return data as SellerOrderDetails | null
}

export async function updateSellerOrderStatus(
  supabase: AppSupabaseClient,
  payload: UpdateOrderStatusRequest,
): Promise<{ success: boolean; error?: string; data?: UpdateOrderStatusResponse }> {
  const { data, error } = await supabase.functions.invoke<UpdateOrderStatusResponse>('update-order-status', {
    body: payload,
  })

  if (error || !data) {
    return {
      success: false,
      error: (error as any)?.context?.error ?? error?.message ?? 'تعذّر تحديث حالة الطلب.',
    }
  }

  return { success: true, data }
}

export const SELLER_STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
}

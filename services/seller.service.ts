import { generateStoreSlug } from '@/lib/utils/store-slug'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type AppSupabaseClient = SupabaseClient<Database, 'public', any>
type SellerApplicationRow = Database['public']['Tables']['seller_applications']['Row']
type StoreRow = Database['public']['Tables']['stores']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']
type OrderRow = Database['public']['Tables']['orders']['Row']

export interface SellerApplicationFormValues {
  store_name: string
  store_description: string
  phone: string
  city: string
}

export interface SellerApplicationStatusResult {
  application: SellerApplicationRow | null
  store: StoreRow | null
}

export interface SellerDashboardStats {
  productsCount: number
  pendingOrders: number
  activeOrders: number
  completedOrders: number
  lowStockCount: number
}

export { generateStoreSlug }

export async function getSellerApplicationStatus(
  supabase: AppSupabaseClient,
  userId: string
): Promise<SellerApplicationStatusResult> {
  const [{ data: application }, { data: store }] = await Promise.all([
    supabase
      .from('seller_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('stores')
      .select('*')
      .eq('seller_id', userId)
      .maybeSingle(),
  ])

  return {
    application: application ?? null,
    store: store ?? null,
  }
}

export async function submitSellerApplication(
  supabase: AppSupabaseClient,
  userId: string,
  values: SellerApplicationFormValues,
): Promise<{ success: true; application: SellerApplicationRow } | { success: false; error: string }> {
  const payload = {
    user_id: userId,
    store_name: values.store_name.trim(),
    store_description: values.store_description.trim() || null,
    phone: values.phone.trim(),
    city: values.city.trim(),
  }

  const { data, error } = await supabase
    .from('seller_applications')
    .insert(payload)
    .select('*')
    .single()

  if (error || !data) {
    const message = error?.message ?? ''
    if (message.includes('one_pending_application_per_user')) {
      return { success: false, error: 'لديك بالفعل طلب قيد المراجعة.' }
    }
    if (message.includes('one_approved_application_per_user')) {
      return { success: false, error: 'تمت الموافقة على حسابك كبائع بالفعل.' }
    }
    return { success: false, error: 'تعذّر إرسال طلب الانضمام. حاول مرة أخرى.' }
  }

  return { success: true, application: data }
}

export async function getSellerDashboardStats(
  supabase: AppSupabaseClient,
  userId: string
): Promise<SellerDashboardStats> {
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('seller_id', userId)
    .maybeSingle()

  if (!store) {
    return {
      productsCount: 0,
      pendingOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      lowStockCount: 0,
    }
  }

  const storeId = store.id
  const [{ count: productsCount }, { data: orders }, { count: lowStockCount }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    supabase.from('orders').select('status').eq('store_id', storeId),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', storeId).lte('stock_quantity', 5).eq('track_inventory', true),
  ])

  const orderList = (orders ?? []) as Pick<OrderRow, 'status'>[]

  return {
    productsCount: productsCount ?? 0,
    pendingOrders: orderList.filter((order) => order.status === 'pending').length,
    activeOrders: orderList.filter((order) => ['confirmed', 'processing', 'shipped'].includes(order.status)).length,
    completedOrders: orderList.filter((order) => order.status === 'delivered').length,
    lowStockCount: lowStockCount ?? 0,
  }
}

export async function getRecentSellerOrders(
  supabase: AppSupabaseClient,
  userId: string,
  limit = 5
) {
  const { data: store } = await supabase.from('stores').select('id').eq('seller_id', userId).maybeSingle()
  if (!store) return []

  const { data } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, created_at, delivery_name')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getLowStockProducts(
  supabase: AppSupabaseClient,
  userId: string,
  limit = 5
): Promise<ProductRow[]> {
  const { data: store } = await supabase.from('stores').select('id').eq('seller_id', userId).maybeSingle()
  if (!store) return []

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('track_inventory', true)
    .lte('stock_quantity', 5)
    .order('stock_quantity', { ascending: true })
    .limit(limit)

  return data ?? []
}

export async function getSellerStore(
  supabase: AppSupabaseClient,
  userId: string
): Promise<StoreRow | null> {
  const { data } = await supabase
    .from('stores')
    .select('*')
    .eq('seller_id', userId)
    .maybeSingle()

  return data ?? null
}

export async function updateSellerStoreSettings(
  supabase: AppSupabaseClient,
  storeId: string,
  values: Pick<StoreRow, 'name' | 'description' | 'phone' | 'email' | 'city' | 'district' | 'address_line'>,
): Promise<{ success: boolean; error?: string; store?: StoreRow }> {
  const payload = {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    phone: values.phone?.trim() || null,
    email: values.email?.trim() || null,
    city: values.city?.trim() || null,
    district: values.district?.trim() || null,
    address_line: values.address_line?.trim() || null,
  }

  const { data, error } = await supabase
    .from('stores')
    .update(payload)
    .eq('id', storeId)
    .select('*')
    .single()

  if (error || !data) {
    return { success: false, error: 'تعذّر تحديث بيانات المتجر.' }
  }

  return { success: true, store: data }
}

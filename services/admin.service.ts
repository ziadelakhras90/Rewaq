// ─────────────────────────────────────────────────────────────────────────────
// services/admin.service.ts
// Admin-only data fetching — يستخدم service client يتجاوز RLS
// يُستخدم حصرًا من Server Components بعد التحقق من الدور في الـ middleware
// ─────────────────────────────────────────────────────────────────────────────

import { createServiceClient } from '@/lib/supabase/service'
import type { Database }        from '@/types/database.types'

type OrderRow        = Database['public']['Tables']['orders']['Row']
type OrderItemRow    = Database['public']['Tables']['order_items']['Row']
type OrderHistoryRow = Database['public']['Tables']['order_status_history']['Row']
type CategoryRow     = Database['public']['Tables']['categories']['Row']
type StoreRow        = Database['public']['Tables']['stores']['Row']
type ApplicationRow  = Database['public']['Tables']['seller_applications']['Row']

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalSellers:      number
  pendingApplications: number
  totalProducts:     number
  totalOrders:       number
}

export interface AdminDashboardData extends AdminStats {
  recentApplications: ApplicationWithProfile[]
  recentOrders:       AdminOrderSummary[]
}

export interface ApplicationWithProfile extends ApplicationRow {
  profiles: { full_name: string } | null
}

export interface AdminOrderSummary extends OrderRow {
  item_count: number
  stores:     { name: string } | null
}

export interface AdminOrderDetails extends OrderRow {
  order_items:          OrderItemRow[]
  order_status_history: OrderHistoryRow[]
  stores: {
    id:       string
    name:     string
    slug:     string
    logo_url: string | null
  } | null
}

export type AdminSellerRow = StoreRow & {
  profiles: { full_name: string; phone: string | null } | null
  seller_applications: { status: string } | null
}

// ─────────────────────────────────────────────────────────────────────────────
// getDashboardData
// ─────────────────────────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<AdminDashboardData> {
  const supabase = createServiceClient() as any

  const [
    { count: totalSellers },
    { count: pendingApplications },
    { count: totalProducts },
    { count: totalOrders },
    { data: recentApps },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'seller'),
    supabase
      .from('seller_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('seller_applications')
      .select('*, profiles ( full_name )')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orders')
      .select('*, stores ( name ), order_items ( id )')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    totalSellers:        totalSellers       ?? 0,
    pendingApplications: pendingApplications ?? 0,
    totalProducts:       totalProducts      ?? 0,
    totalOrders:         totalOrders        ?? 0,
    recentApplications: (recentApps ?? []) as ApplicationWithProfile[],
    recentOrders: ((recentOrders as any[]) ?? []).map((o: any) => ({
      ...o,
      item_count: (o as any).order_items?.length ?? 0,
      order_items: undefined,
    })) as AdminOrderSummary[],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getAdminApplications
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminApplications(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<ApplicationWithProfile[]> {
  const supabase = createServiceClient() as any

  let query = supabase
    .from('seller_applications')
    .select('*, profiles ( full_name )')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) { console.error('getAdminApplications:', error); return [] }
  return (data ?? []) as ApplicationWithProfile[]
}

// ─────────────────────────────────────────────────────────────────────────────
// getAdminSellers
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminSellers(): Promise<AdminSellerRow[]> {
  const supabase = createServiceClient() as any

  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      profiles ( full_name, phone ),
      seller_applications ( status )
    `)
    .order('created_at', { ascending: false })

  if (error) { console.error('getAdminSellers:', error); return [] }
  return (data ?? []) as unknown as AdminSellerRow[]
}

// ─────────────────────────────────────────────────────────────────────────────
// getAdminOrders
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminOrders(): Promise<AdminOrderSummary[]> {
  const supabase = createServiceClient() as any

  const { data, error } = await supabase
    .from('orders')
    .select('*, stores ( name ), order_items ( id )')
    .order('created_at', { ascending: false })

  if (error) { console.error('getAdminOrders:', error); return [] }

  return ((data as any[]) ?? []).map((o: any) => ({
    ...o,
    item_count: (o as any).order_items?.length ?? 0,
    order_items: undefined,
  })) as AdminOrderSummary[]
}

// ─────────────────────────────────────────────────────────────────────────────
// getAdminOrderDetails
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminOrderDetails(
  orderNumber: string
): Promise<AdminOrderDetails | null> {
  const supabase = createServiceClient() as any

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      stores ( id, name, slug, logo_url ),
      order_items (*),
      order_status_history (*)
    `)
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (error) { console.error('getAdminOrderDetails:', error); return null }
  if (!data)  return null

  const sortedHistory = [...((data as any).order_status_history ?? [])].sort(
    (a: OrderHistoryRow, b: OrderHistoryRow) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return { ...(data as any), order_status_history: sortedHistory } as unknown as AdminOrderDetails
}

// ─────────────────────────────────────────────────────────────────────────────
// getCategories
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminCategories(): Promise<CategoryRow[]> {
  const supabase = createServiceClient() as any

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name',       { ascending: true })

  if (error) { console.error('getAdminCategories:', error); return [] }
  return data ?? []
}

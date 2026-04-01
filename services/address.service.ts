// ─────────────────────────────────────────────────────────────────────────────
// services/address.service.ts
// منطق عناوين العملاء — CRUD + default
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type SupabaseClient = any

export type CustomerAddress = Database['public']['Tables']['customer_addresses']['Row']
export type CustomerAddressInsert = Database['public']['Tables']['customer_addresses']['Insert']
export type CustomerAddressUpdate = Database['public']['Tables']['customer_addresses']['Update']

// ─────────────────────────────────────────────────────────────────────────────
// getAddresses
// ─────────────────────────────────────────────────────────────────────────────

export async function getAddresses(
  supabase:   SupabaseClient,
  customerId: string
): Promise<CustomerAddress[]> {
  const { data, error } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false })
    .order('created_at',  { ascending: false })

  if (error) {
    console.error('getAddresses error:', error)
    return []
  }

  return data ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// addAddress
// ─────────────────────────────────────────────────────────────────────────────

export async function addAddress(
  supabase:   SupabaseClient,
  customerId: string,
  input:      Omit<CustomerAddressInsert, 'customer_id'>
): Promise<{ success: true; address: CustomerAddress } | { success: false; error: string }> {
  // إذا كان is_default مضبوطًا على true → نلغي الافتراضي الحالي أولًا
  if (input.is_default) {
    await clearDefaultAddress(supabase, customerId)
  }

  const { data, error } = await supabase
    .from('customer_addresses')
    .insert({ ...input, customer_id: customerId })
    .select()
    .single()

  if (error || !data) {
    console.error('addAddress error:', error)
    return { success: false, error: 'فشل إضافة العنوان' }
  }

  return { success: true, address: data }
}

// ─────────────────────────────────────────────────────────────────────────────
// updateAddress
// ─────────────────────────────────────────────────────────────────────────────

export async function updateAddress(
  supabase:   SupabaseClient,
  customerId: string,
  addressId:  string,
  input:      CustomerAddressUpdate
): Promise<{ success: boolean; error?: string }> {
  // إذا كان is_default مضبوطًا على true → نلغي الافتراضي الحالي أولًا
  if (input.is_default) {
    await clearDefaultAddress(supabase, customerId)
  }

  const { error } = await supabase
    .from('customer_addresses')
    .update(input)
    .eq('id', addressId)
    .eq('customer_id', customerId)   // نضمن أن العنوان يخص هذا العميل

  if (error) {
    console.error('updateAddress error:', error)
    return { success: false, error: 'فشل تحديث العنوان' }
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteAddress
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteAddress(
  supabase:   SupabaseClient,
  customerId: string,
  addressId:  string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('customer_addresses')
    .delete()
    .eq('id', addressId)
    .eq('customer_id', customerId)

  if (error) {
    console.error('deleteAddress error:', error)
    return { success: false, error: 'فشل حذف العنوان' }
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// setDefaultAddress
// ─────────────────────────────────────────────────────────────────────────────

export async function setDefaultAddress(
  supabase:   SupabaseClient,
  customerId: string,
  addressId:  string
): Promise<{ success: boolean; error?: string }> {
  // خطوة 1: إلغاء الافتراضي الحالي
  await clearDefaultAddress(supabase, customerId)

  // خطوة 2: تعيين الجديد
  const { error } = await supabase
    .from('customer_addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('customer_id', customerId)

  if (error) {
    console.error('setDefaultAddress error:', error)
    return { success: false, error: 'فشل تعيين العنوان الافتراضي' }
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helper
// ─────────────────────────────────────────────────────────────────────────────

async function clearDefaultAddress(
  supabase:   SupabaseClient,
  customerId: string
): Promise<void> {
  await supabase
    .from('customer_addresses')
    .update({ is_default: false })
    .eq('customer_id', customerId)
    .eq('is_default', true)
}

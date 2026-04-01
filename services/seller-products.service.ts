import { generateStoreSlug } from '@/lib/utils/store-slug'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type AppSupabaseClient = SupabaseClient<Database, 'public', any>
type ProductRow = Database['public']['Tables']['products']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']
type ProductImageRow = Database['public']['Tables']['product_images']['Row']

export interface SellerProductFormValues {
  category_id: string | null
  name: string
  slug: string
  description: string
  price: string
  compare_price: string
  sku: string
  stock_quantity: string
  track_inventory: boolean
  status: 'draft' | 'active' | 'archived'
  is_featured: boolean
  images: ProductImageInput[]
}

export interface ProductImageInput {
  id?: string
  url: string
  alt_text?: string | null
  is_primary?: boolean
  sort_order?: number
}

export interface SellerProductListItem extends ProductRow {
  category_name: string | null
  primary_image: string | null
}

export interface SellerProductDetails extends ProductRow {
  categories: Pick<CategoryRow, 'id' | 'name'> | null
  product_images: ProductImageRow[]
}

export async function getSellerProducts(
  supabase: AppSupabaseClient,
  userId: string
): Promise<SellerProductListItem[]> {
  const { data: store } = await supabase.from('stores').select('id').eq('seller_id', userId).maybeSingle()
  if (!store) return []

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, name ),
      product_images ( url, is_primary )
    `)
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getSellerProducts error:', error)
    return []
  }

  return (data ?? []).map((product: any) => ({
    ...product,
    category_name: product.categories?.name ?? null,
    primary_image: (product.product_images ?? []).find((image: any) => image.is_primary)?.url ?? product.product_images?.[0]?.url ?? null,
  }))
}

export async function getSellerProductById(
  supabase: AppSupabaseClient,
  userId: string,
  productId: string
): Promise<SellerProductDetails | null> {
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, name ),
      product_images ( * )
    `)
    .eq('id', productId)
    .maybeSingle()

  if (!data) return null

  const { data: store } = await supabase.from('stores').select('id').eq('seller_id', userId).maybeSingle()
  if (!store || data.store_id !== store.id) return null

  return data as SellerProductDetails
}

export async function getSellerCategories(
  supabase: AppSupabaseClient
): Promise<Pick<CategoryRow, 'id' | 'name'>[]> {
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return data ?? []
}

export async function getSellerStoreId(
  supabase: AppSupabaseClient,
  userId: string
): Promise<string | null> {
  const { data: store } = await supabase.from('stores').select('id').eq('seller_id', userId).maybeSingle()
  return store?.id ?? null
}

export async function createSellerProduct(
  supabase: AppSupabaseClient,
  storeId: string,
  values: SellerProductFormValues,
): Promise<{ success: boolean; error?: string; product?: ProductRow }> {
  const slug = values.slug.trim() || generateStoreSlug(values.name)

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      category_id: values.category_id,
      name: values.name.trim(),
      slug,
      description: values.description.trim() || null,
      price: Number(values.price),
      compare_price: values.compare_price ? Number(values.compare_price) : null,
      sku: values.sku.trim() || null,
      stock_quantity: Number(values.stock_quantity || 0),
      track_inventory: values.track_inventory,
      status: values.status,
      is_featured: values.is_featured,
    })
    .select('*')
    .single()

  if (error || !product) {
    return { success: false, error: 'تعذّر إنشاء المنتج.' }
  }

  const imageResult = await syncProductImages(supabase, product.id, values.images)
  if (!imageResult.success) {
    return { success: false, error: imageResult.error }
  }

  return { success: true, product }
}

export async function updateSellerProduct(
  supabase: AppSupabaseClient,
  productId: string,
  values: SellerProductFormValues,
): Promise<{ success: boolean; error?: string; product?: ProductRow }> {
  const slug = values.slug.trim() || generateStoreSlug(values.name)

  const { data: product, error } = await supabase
    .from('products')
    .update({
      category_id: values.category_id,
      name: values.name.trim(),
      slug,
      description: values.description.trim() || null,
      price: Number(values.price),
      compare_price: values.compare_price ? Number(values.compare_price) : null,
      sku: values.sku.trim() || null,
      stock_quantity: Number(values.stock_quantity || 0),
      track_inventory: values.track_inventory,
      status: values.status,
      is_featured: values.is_featured,
    })
    .eq('id', productId)
    .select('*')
    .single()

  if (error || !product) {
    return { success: false, error: 'تعذّر تحديث المنتج.' }
  }

  const imageResult = await syncProductImages(supabase, product.id, values.images)
  if (!imageResult.success) {
    return { success: false, error: imageResult.error }
  }

  return { success: true, product }
}

export async function archiveSellerProduct(
  supabase: AppSupabaseClient,
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('id', productId)

  if (error) return { success: false, error: 'تعذّر أرشفة المنتج.' }
  return { success: true }
}

async function syncProductImages(
  supabase: AppSupabaseClient,
  productId: string,
  images: ProductImageInput[],
): Promise<{ success: boolean; error?: string }> {
  const cleaned = images
    .map((image, index) => ({
      url: image.url.trim(),
      alt_text: image.alt_text?.trim() || null,
      is_primary: image.is_primary ?? index === 0,
      sort_order: index,
    }))
    .filter((image) => image.url)

  await supabase.from('product_images').delete().eq('product_id', productId)

  if (cleaned.length === 0) {
    return { success: true }
  }

  const normalized = cleaned.map((image, index) => ({
    product_id: productId,
    ...image,
    is_primary: cleaned.some((candidate) => candidate.is_primary) ? image.is_primary : index === 0,
  }))

  const { error } = await supabase.from('product_images').insert(normalized)
  if (error) {
    return { success: false, error: 'تم حفظ المنتج لكن تعذّر حفظ الصور.' }
  }

  return { success: true }
}

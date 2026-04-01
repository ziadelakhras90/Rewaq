// ─────────────────────────────────────────────────────────────────────────────
// services/catalog.service.ts
// عرض المنتجات والبحث والفلترة للـ public catalog
// ─────────────────────────────────────────────────────────────────────────────

import { prepareForSearch } from '@/lib/utils/arabic'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductFilters {
  categoryId?:  string
  storeId?:     string
  minPrice?:    number
  maxPrice?:    number
  search?:      string
  isFeatured?:  boolean
  sort?:        'newest' | 'price_asc' | 'price_desc' | 'featured'
  page?:        number
  pageSize?:    number
}

export interface ProductListItem {
  id:            string
  name:          string
  slug:          string
  price:         number
  compare_price: number | null
  stock_quantity: number
  is_featured:   boolean
  store: {
    id:   string
    name: string
    slug: string
  }
  category: {
    id:   string
    name: string
  } | null
  primary_image: string | null
}

export interface PaginatedProducts {
  data:       ProductListItem[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}

// ─────────────────────────────────────────────────────────────────────────────
// getProducts — للـ marketplace listing
// ─────────────────────────────────────────────────────────────────────────────

export async function getProducts(
  supabase: SupabaseClient<Database, 'public', any>,
  filters:  ProductFilters = {}
): Promise<PaginatedProducts> {
  const {
    categoryId,
    storeId,
    minPrice,
    maxPrice,
    search,
    isFeatured,
    sort     = 'newest',
    page     = 1,
    pageSize = 24,
  } = filters

  const offset = (page - 1) * pageSize

  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      compare_price,
      stock_quantity,
      is_featured,
      stores!inner (
        id,
        name,
        slug
      ),
      categories (
        id,
        name
      ),
      product_images (
        url,
        is_primary
      )
    `, { count: 'exact' })
    .eq('status', 'active')
    .eq('stores.status', 'active')

  if (categoryId) query = query.eq('category_id', categoryId)
  if (storeId)    query = query.eq('store_id', storeId)
  if (isFeatured) query = query.eq('is_featured', true)
  if (minPrice !== undefined) query = query.gte('price', minPrice)
  if (maxPrice !== undefined) query = query.lte('price', maxPrice)

  // البحث: يعمل على الاسم والوصف بعد normalization
  if (search?.trim()) {
    const normalized = prepareForSearch(search)
    // Supabase ilike مع النص المنظَّم
    query = query.or(
      `name.ilike.%${normalized}%,description.ilike.%${normalized}%`
    )
  }

  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query
    .range(offset, offset + pageSize - 1)

  if (error) {
    console.error('getProducts error:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const products: ProductListItem[] = (data ?? []).map((p: any) => ({
    id:             p.id,
    name:           p.name,
    slug:           p.slug,
    price:          p.price,
    compare_price:  p.compare_price,
    stock_quantity: p.stock_quantity,
    is_featured:    p.is_featured,
    store: {
      id:   p.stores.id,
      name: p.stores.name,
      slug: p.stores.slug,
    },
    category: p.categories
      ? { id: p.categories.id, name: p.categories.name }
      : null,
    primary_image:
      (p.product_images as any[])?.find((img: any) => img.is_primary)?.url ??
      (p.product_images as any[])?.[0]?.url ??
      null,
  }))

  const total      = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return { data: products, total, page, pageSize, totalPages }
}

// ─────────────────────────────────────────────────────────────────────────────
// getProductBySlug — لصفحة تفاصيل المنتج
// ─────────────────────────────────────────────────────────────────────────────

export async function getProductBySlug(
  supabase: SupabaseClient<Database, 'public', any>,
  slug:     string
): Promise<ProductRow & {
  stores:         { id: string; name: string; slug: string; city: string | null }
  categories:     { id: string; name: string } | null
  product_images: { url: string; alt_text: string | null; sort_order: number; is_primary: boolean }[]
} | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      stores!inner (
        id,
        name,
        slug,
        city
      ),
      categories (
        id,
        name
      ),
      product_images (
        url,
        alt_text,
        sort_order,
        is_primary
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .eq('stores.status', 'active')
    .maybeSingle()

  if (error) {
    console.error('getProductBySlug error:', error)
    return null
  }

  return data as any
}

// ─────────────────────────────────────────────────────────────────────────────
// getFeaturedProducts — للـ homepage
// ─────────────────────────────────────────────────────────────────────────────

export async function getFeaturedProducts(
  supabase: SupabaseClient<Database, 'public', any>,
  limit     = 8
): Promise<ProductListItem[]> {
  const result = await getProducts(supabase, { isFeatured: true, pageSize: limit })
  return result.data
}

// ─────────────────────────────────────────────────────────────────────────────
// getActiveCategories — للـ sidebar/filters
// ─────────────────────────────────────────────────────────────────────────────

export async function getActiveCategories(
  supabase: SupabaseClient<Database, 'public', any>
): Promise<{ id: string; name: string; slug: string; image_url: string | null }[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .eq('is_active', true)
    .is('parent_id', null)           // المستوى الأول فقط في MVP
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('getActiveCategories error:', error)
    return []
  }

  return data ?? []
}

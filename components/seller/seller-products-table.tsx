'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { archiveSellerProduct, type SellerProductListItem } from '@/services/seller-products.service'
import { formatCurrency, getProductStatusLabel } from '@/lib/utils/arabic'

export function SellerProductsTable({ products, initialFilter = 'all' }: { products: SellerProductListItem[]; initialFilter?: string }) {
  const supabase = createClient()
  const [items, setItems] = useState(products)
  const [query, setQuery] = useState('')
  const [archivingId, setArchivingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery = `${item.name} ${item.slug}`.toLowerCase().includes(query.trim().toLowerCase())
      const matchesFilter = initialFilter === 'low-stock'
        ? item.track_inventory && item.stock_quantity > 0 && item.stock_quantity <= 5 && item.status === 'active'
        : true
      return matchesQuery && matchesFilter
    })
  }, [items, query, initialFilter])

  async function handleArchive(productId: string) {
    setArchivingId(productId)
    const result = await archiveSellerProduct(supabase, productId)
    setArchivingId(null)
    if (!result.success) return
    setItems((prev) => prev.map((item) => item.id === productId ? { ...item, status: 'archived' } : item))
  }

  return (
    <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">منتجات المتجر</h2>
          <p className="text-sm text-stone-400">أدر العناوين والأسعار والمخزون من مكان واحد.</p>
        </div>
        <Link href="/seller/products/new" className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600">
          إضافة منتج
        </Link>
      </div>

      {initialFilter === 'low-stock' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          يتم الآن عرض المنتجات ذات المخزون المنخفض فقط.
        </div>
      )}

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو الرابط المختصر" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20" />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center text-sm text-stone-500">
          لا توجد منتجات مطابقة حاليًا.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-right">
            <thead>
              <tr className="text-xs text-stone-400">
                <th className="px-3 py-3 font-medium">المنتج</th>
                <th className="px-3 py-3 font-medium">السعر</th>
                <th className="px-3 py-3 font-medium">المخزون</th>
                <th className="px-3 py-3 font-medium">الحالة</th>
                <th className="px-3 py-3 font-medium">التصنيف</th>
                <th className="px-3 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl bg-stone-100">
                        {product.primary_image ? <img src={product.primary_image} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">بدون</div>}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{product.name}</p>
                        <p className="text-xs text-stone-400" dir="ltr">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 font-semibold">{formatCurrency(product.price)}</td>
                  <td className="px-3 py-4">{product.track_inventory ? product.stock_quantity : 'غير محدود'}</td>
                  <td className="px-3 py-4"><StatusBadge status={product.status} /></td>
                  <td className="px-3 py-4">{product.category_name ?? '—'}</td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/seller/products/${product.id}/edit`} className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-stone-300">تعديل</Link>
                      {product.status !== 'archived' && (
                        <button type="button" onClick={() => handleArchive(product.id)} disabled={archivingId === product.id} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
                          {archivingId === product.id ? 'جارٍ الأرشفة…' : 'أرشفة'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'active'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : status === 'archived'
      ? 'border-stone-200 bg-stone-100 text-stone-600'
      : 'border-amber-200 bg-amber-50 text-amber-700'

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{getProductStatusLabel(status)}</span>
}

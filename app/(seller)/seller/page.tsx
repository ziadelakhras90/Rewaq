import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLowStockProducts, getRecentSellerOrders, getSellerDashboardStats, getSellerStore } from '@/services/seller.service'
import { SellerDashboardHeader } from '@/components/seller/seller-dashboard-header'
import { SellerStatsCards } from '@/components/seller/seller-stats-cards'
import { SellerNav } from '@/components/seller/seller-nav'
import { formatCurrency, formatDateTime } from '@/lib/utils/arabic'

export const metadata: Metadata = {
  title: 'مساحة البائع — رِواق',
}

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/seller')

  const store = await getSellerStore(supabase, user.id)
  if (!store) redirect('/seller/status')

  const [stats, recentOrders, lowStock] = await Promise.all([
    getSellerDashboardStats(supabase, user.id),
    getRecentSellerOrders(supabase, user.id),
    getLowStockProducts(supabase, user.id),
  ])

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <SellerNav />
        <SellerDashboardHeader store={store} />
        <SellerStatsCards stats={stats} />

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">أحدث الطلبات</h2>
                <p className="text-sm text-stone-400">آخر ما ورد إلى متجرك من طلبات.</p>
              </div>
              <Link href="/seller/orders" className="text-sm font-semibold text-amber-600 hover:text-amber-700">عرض الكل</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <EmptyMessage text="لا توجد طلبات حديثة بعد." />
              ) : recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-stone-900">{order.order_number}</p>
                    <p className="mt-1 text-xs text-stone-400">{order.delivery_name} • {formatDateTime(order.created_at)}</p>
                  </div>
                  <p className="font-semibold text-stone-900">{formatCurrency(order.total_amount)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">تنبيهات المخزون</h2>
                <p className="text-sm text-stone-400">المنتجات التي تحتاج متابعة قبل نفادها.</p>
              </div>
              <Link href="/seller/products?filter=low-stock" className="text-sm font-semibold text-amber-600 hover:text-amber-700">إدارة المنتجات</Link>
            </div>
            <div className="space-y-3">
              {lowStock.length === 0 ? (
                <EmptyMessage text="كل المنتجات في حالة جيدة حاليًا." />
              ) : lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-stone-900">{product.name}</p>
                    <p className="mt-1 text-xs text-stone-400">/{product.slug}</p>
                  </div>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    المتبقي {product.stock_quantity}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function EmptyMessage({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-400">{text}</div>
}

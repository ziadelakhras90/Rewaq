import Link from 'next/link'
import type { SellerDashboardStats } from '@/services/seller.service'

const cards = [
  { key: 'productsCount', label: 'المنتجات', href: '/seller/products' },
  { key: 'pendingOrders', label: 'طلبات جديدة', href: '/seller/orders?status=pending' },
  { key: 'activeOrders', label: 'طلبات جارية', href: '/seller/orders?status=active' },
  { key: 'completedOrders', label: 'طلبات مكتملة', href: '/seller/orders?status=delivered' },
  { key: 'lowStockCount', label: 'مخزون منخفض', href: '/seller/products?filter=low-stock' },
] as const

export function SellerStatsCards({ stats }: { stats: SellerDashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Link key={card.key} href={card.href} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300">
          <p className="text-sm text-stone-400">{card.label}</p>
          <p className="mt-3 text-3xl font-bold text-stone-900">{stats[card.key]}</p>
        </Link>
      ))}
    </div>
  )
}

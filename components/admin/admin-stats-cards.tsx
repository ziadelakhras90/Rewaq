// components/admin/admin-stats-cards.tsx

import type { AdminStats } from '@/services/admin.service'

interface AdminStatsCardsProps {
  stats: AdminStats
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      label: 'البائعون',
      value: stats.totalSellers,
      icon: '🏪',
      href:  '/admin/sellers',
      accent: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'طلبات بانتظار المراجعة',
      value: stats.pendingApplications,
      icon:  '📋',
      href:  '/admin/seller-applications',
      accent: stats.pendingApplications > 0
        ? 'bg-amber-50 text-amber-700'
        : 'bg-stone-50 text-stone-600',
    },
    {
      label: 'المنتجات النشطة',
      value: stats.totalProducts,
      icon:  '📦',
      href:  null,
      accent: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'إجمالي الطلبات',
      value: stats.totalOrders,
      icon:  '🛒',
      href:  '/admin/orders',
      accent: 'bg-purple-50 text-purple-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => {
        const inner = (
          <div className={`rounded-2xl p-5 transition ${card.accent}`}>
            <div className="mb-2 text-2xl">{card.icon}</div>
            <p className="text-2xl font-bold">{card.value.toLocaleString('ar-SA')}</p>
            <p className="mt-1 text-xs font-medium opacity-80">{card.label}</p>
          </div>
        )

        return card.href ? (
          <a key={card.label} href={card.href} className="block hover:opacity-90 transition">
            {inner}
          </a>
        ) : (
          <div key={card.label}>{inner}</div>
        )
      })}
    </div>
  )
}

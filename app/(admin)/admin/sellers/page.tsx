// app/(admin)/admin/sellers/page.tsx

import type { Metadata }       from 'next'
import { getAdminSellers }     from '@/services/admin.service'
import { AdminSellersTable }   from '@/components/admin/admin-sellers-table'

export const metadata: Metadata = { title: 'البائعون — لوحة إدارة رِواق' }

export default async function AdminSellersPage() {
  const sellers = await getAdminSellers()

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">البائعون</h1>
        <p className="text-sm text-stone-400">
          جميع المتاجر المسجّلة على المنصة ({sellers.length})
        </p>
      </div>
      <AdminSellersTable sellers={sellers} />
    </div>
  )
}

// app/(admin)/admin/orders/page.tsx

import type { Metadata }       from 'next'
import { getAdminOrders }      from '@/services/admin.service'
import { AdminOrdersTable }    from '@/components/admin/admin-orders-table'

export const metadata: Metadata = { title: 'الطلبات — لوحة إدارة رِواق' }

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders()

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">الطلبات</h1>
        <p className="text-sm text-stone-400">
          جميع طلبات المنصة ({orders.length})
        </p>
      </div>
      <AdminOrdersTable orders={orders} />
    </div>
  )
}

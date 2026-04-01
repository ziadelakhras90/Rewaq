// app/(admin)/admin/seller-applications/page.tsx

import type { Metadata }             from 'next'
import { getAdminApplications }      from '@/services/admin.service'
import { AdminApplicationsList }     from '@/components/admin/admin-applications-list'

export const metadata: Metadata = { title: 'طلبات البائعين — لوحة إدارة رِواق' }

export default async function SellerApplicationsPage() {
  const applications = await getAdminApplications()

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">طلبات البائعين</h1>
        <p className="text-sm text-stone-400">
          مراجعة وقبول أو رفض طلبات الانضمام كبائع
        </p>
      </div>
      <AdminApplicationsList initialApplications={applications} />
    </div>
  )
}

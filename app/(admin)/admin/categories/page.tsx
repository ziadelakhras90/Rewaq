// app/(admin)/admin/categories/page.tsx

import type { Metadata }          from 'next'
import { getAdminCategories }     from '@/services/admin.service'
import { AdminCategoriesTable }   from '@/components/admin/admin-categories-table'

export const metadata: Metadata = { title: 'التصنيفات — لوحة إدارة رِواق' }

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">التصنيفات</h1>
        <p className="text-sm text-stone-400">
          إنشاء وتعديل وتفعيل تصنيفات المنتجات
        </p>
      </div>
      <AdminCategoriesTable initialCategories={categories} />
    </div>
  )
}

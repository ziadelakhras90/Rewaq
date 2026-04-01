import type { Database } from '@/types/database.types'

type Store = Database['public']['Tables']['stores']['Row']

export function SellerDashboardHeader({ store }: { store: Store }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-stone-400">مساحة البائع</p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">{store.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">{store.description || 'ابدأ بإدارة منتجاتك وطلباتك من لوحة تحكم واحدة بسيطة وواضحة.'}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
          <p className="font-semibold text-stone-800">{store.city || 'المدينة غير محددة'}</p>
          <p className="mt-1">{store.phone || 'أضف رقم المتجر من الإعدادات'}</p>
        </div>
      </div>
    </div>
  )
}

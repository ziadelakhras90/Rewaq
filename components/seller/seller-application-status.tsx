import Link from 'next/link'
import { APPLICATION_STATUS_LABELS, STORE_STATUS_LABELS, formatDateTime } from '@/lib/utils/arabic'
import type { Database } from '@/types/database.types'

type SellerApplication = Database['public']['Tables']['seller_applications']['Row']
type Store = Database['public']['Tables']['stores']['Row']

interface SellerApplicationStatusProps {
  application: SellerApplication | null
  store?: Store | null
}

export function SellerApplicationStatus({ application, store }: SellerApplicationStatusProps) {
  if (!application) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-500">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" /></svg>
        </div>
        <h2 className="text-lg font-bold text-stone-900">ابدأ رحلتك كبائع في رِواق</h2>
        <p className="mt-2 text-sm leading-7 text-stone-500">قدّم طلب الانضمام، وبعد المراجعة ستتمكن من إضافة منتجاتك واستقبال الطلبات.</p>
        <Link href="/become-seller" className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600">
          قدّم الآن
        </Link>
      </div>
    )
  }

  const statusTone = application.status === 'approved'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : application.status === 'rejected'
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : 'border-amber-200 bg-amber-50 text-amber-700'

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-stone-400">حالة طلب الانضمام</p>
            <h2 className="mt-1 text-2xl font-bold text-stone-900">{application.store_name}</h2>
          </div>
          <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusTone}`}>
            {APPLICATION_STATUS_LABELS[application.status] ?? application.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="المدينة" value={application.city} />
          <Info label="الجوال" value={application.phone} />
          <Info label="تاريخ التقديم" value={formatDateTime(application.created_at)} />
          {application.reviewed_at && <Info label="آخر مراجعة" value={formatDateTime(application.reviewed_at)} />}
        </dl>

        {application.store_description && (
          <div className="mt-5 rounded-2xl bg-stone-50 p-4">
            <p className="text-sm font-medium text-stone-500">نبذة عن المتجر</p>
            <p className="mt-1 text-sm leading-7 text-stone-700">{application.store_description}</p>
          </div>
        )}

        {application.status === 'pending' && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-700">
            طلبك قيد المراجعة حاليًا. سنشعرك فور اتخاذ القرار.
          </div>
        )}

        {application.status === 'rejected' && (
          <div className="mt-5 space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">لم تتم الموافقة على الطلب الحالي.</p>
            {application.admin_notes && <p className="text-sm leading-7 text-rose-700">سبب الرفض: {application.admin_notes}</p>}
            <Link href="/become-seller" className="inline-flex rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
              إرسال طلب جديد
            </Link>
          </div>
        )}
      </div>

      {application.status === 'approved' && store && (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-stone-400">حالة المتجر</p>
              <h3 className="mt-1 text-lg font-bold text-stone-900">{store.name}</h3>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {STORE_STATUS_LABELS[store.status] ?? store.status}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/seller" className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
              الدخول إلى مساحة البائع
            </Link>
            <Link href="/seller/settings" className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-300">
              إعدادات المتجر
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs font-medium text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-800">{value}</p>
    </div>
  )
}

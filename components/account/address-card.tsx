// components/account/address-card.tsx

import type { CustomerAddress } from '@/services/address.service'

interface AddressCardProps {
  address:          CustomerAddress
  onEdit:           (address: CustomerAddress) => void
  onDelete:         (id: string) => void
  onSetDefault:     (id: string) => void
  deletingId?:      string | null
  settingDefaultId?: string | null
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deletingId,
  settingDefaultId,
}: AddressCardProps) {
  const isDeleting      = deletingId === address.id
  const isSettingDefault = settingDefaultId === address.id

  return (
    <div
      className={`
        relative rounded-2xl border bg-white p-5 transition
        ${address.is_default
          ? 'border-amber-300 shadow-sm'
          : 'border-stone-200'
        }
        ${isDeleting ? 'opacity-50' : ''}
      `}
    >
      {/* ── Default badge ─────────────────────────────────────────────── */}
      {address.is_default && (
        <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
          </svg>
          الافتراضي
        </span>
      )}

      {/* ── Label ────────────────────────────────────────────────────── */}
      {address.label && (
        <p className="mb-1 text-xs font-medium text-stone-400">{address.label}</p>
      )}

      {/* ── Details ───────────────────────────────────────────────────── */}
      <div className="space-y-0.5">
        <p className="font-semibold text-stone-800">{address.full_name}</p>
        <p className="text-sm text-stone-500">{address.phone}</p>
        <p className="text-sm text-stone-600">
          {[address.city, address.district, address.street, address.building]
            .filter(Boolean)
            .join(' — ')}
        </p>
        {address.notes && (
          <p className="text-xs text-stone-400">ملاحظة: {address.notes}</p>
        )}
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">

        {/* تعيين افتراضي — يظهر فقط إذا لم يكن افتراضيًا */}
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address.id)}
            disabled={Boolean(isSettingDefault || deletingId)}
            className="
              flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium
              text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isSettingDefault ? (
              <MiniSpinner />
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 13l4 4L19 7" />
              </svg>
            )}
            تعيين كافتراضي
          </button>
        )}

        {/* تعديل */}
        <button
          onClick={() => onEdit(address)}
          disabled={Boolean(deletingId)}
          className="
            flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium
            text-amber-600 hover:bg-amber-50 transition
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5
                 m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          تعديل
        </button>

        {/* حذف */}
        <button
          onClick={() => onDelete(address.id)}
          disabled={Boolean(isDeleting || settingDefaultId)}
          className="
            ms-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium
            text-rose-500 hover:bg-rose-50 transition
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isDeleting ? (
            <MiniSpinner className="text-rose-400" />
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858
                   L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
            </svg>
          )}
          حذف
        </button>
      </div>
    </div>
  )
}

function MiniSpinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`h-3.5 w-3.5 animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

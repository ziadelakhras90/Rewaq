// components/account/address-empty-state.tsx

interface AddressEmptyStateProps {
  onAdd: () => void
}

export function AddressEmptyState({ onAdd }: AddressEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
        <svg className="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243
               a8 8 0 1 1 11.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-stone-700">لا توجد عناوين محفوظة</h2>
      <p className="mt-1 text-sm text-stone-400">أضف عنوانك لتسريع عملية الشراء</p>
      <button
        onClick={onAdd}
        className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition"
      >
        إضافة عنوان
      </button>
    </div>
  )
}

// components/catalog/empty-state.tsx

interface EmptyStateProps {
  title?:       string
  description?: string
  action?:      { label: string; onClick: () => void }
}

export function EmptyState({
  title       = 'لا توجد منتجات',
  description = 'لم نعثر على منتجات تطابق بحثك. جرّب تغيير الفلاتر أو مصطلح البحث.',
  action,
}: EmptyStateProps) {
  return (
    <div
      dir="rtl"
      className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-6 py-16 text-center"
    >
      {/* أيقونة */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
        <svg className="h-7 w-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="m21 21-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 12.15 12.15z" />
        </svg>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-stone-700">{title}</h3>
        <p className="max-w-xs text-sm leading-relaxed text-stone-400">{description}</p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 rounded-xl bg-amber-500 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// components/catalog/product-grid.tsx

import { ProductCard }                          from './product-card'
import { ProductGridSkeleton }                  from './product-card-skeleton'
import { EmptyState }                           from './empty-state'
import type { ProductListItem }                 from '@/services/catalog.service'

interface PaginationProps {
  page:         number
  totalPages:   number
  onPageChange: (p: number) => void
}

interface ProductGridProps {
  products:   ProductListItem[]
  loading:    boolean
  error:      string | null
  pagination?: PaginationProps
}

export function ProductGrid({ products, loading, error, pagination }: ProductGridProps) {

  // ── خطأ ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        dir="rtl"
        className="flex min-h-40 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 px-6 py-10 text-center"
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-rose-700">{error}</p>
          <p className="text-xs text-rose-400">حاول تحديث الصفحة أو التواصل مع الدعم</p>
        </div>
      </div>
    )
  }

  // ── تحميل ─────────────────────────────────────────────────────────────────
  if (loading) {
    return <ProductGridSkeleton count={12} />
  }

  // ── فارغ ──────────────────────────────────────────────────────────────────
  if (products.length === 0) {
    return <EmptyState />
  }

  // ── المنتجات ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* ── ترقيم الصفحات ──────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination {...pagination} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  // نعرض حد أقصى 7 أزرار
  const pages = buildPageRange(page, totalPages)

  return (
    <div dir="rtl" className="flex items-center justify-center gap-1.5">
      {/* السابق */}
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="الصفحة السابقة"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </PageButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-stone-400">…</span>
        ) : (
          <PageButton
            key={p}
            onClick={() => onPageChange(p as number)}
            active={(p as number) === page}
          >
            {p}
          </PageButton>
        )
      )}

      {/* التالي */}
      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="الصفحة التالية"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </PageButton>
    </div>
  )
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  ...rest
}: {
  children:  React.ReactNode
  onClick:   () => void
  disabled?: boolean
  active?:   boolean
  [key: string]: unknown
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm transition
        ${active
          ? 'bg-amber-500 font-semibold text-white shadow-sm'
          : disabled
            ? 'cursor-not-allowed text-stone-300'
            : 'border border-stone-200 bg-white text-stone-600 hover:border-amber-300 hover:text-amber-700'
        }
      `}
      {...rest}
    >
      {children}
    </button>
  )
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const result: (number | '...')[] = []
  result.push(1)

  if (current > 3)       result.push('...')
  if (current > 2)       result.push(current - 1)
                         result.push(current)
  if (current < total - 1) result.push(current + 1)
  if (current < total - 2) result.push('...')

  result.push(total)
  return result
}

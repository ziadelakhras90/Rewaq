// components/catalog/product-card-skeleton.tsx

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {/* صورة */}
      <div className="aspect-square animate-pulse bg-stone-100" />
      {/* بيانات */}
      <div className="space-y-2.5 p-3.5">
        <div className="h-3 w-16 animate-pulse rounded-full bg-stone-100" />
        <div className="h-4 w-full animate-pulse rounded-full bg-stone-100" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-stone-100" />
        <div className="pt-1">
          <div className="h-5 w-20 animate-pulse rounded-full bg-stone-100" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

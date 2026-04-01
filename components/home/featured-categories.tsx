// components/home/featured-categories.tsx
// قسم التصنيفات المميزة — Server Component

import Link  from 'next/link'
import Image from 'next/image'

interface Category {
  id:        string
  name:      string
  slug:      string
  image_url: string | null
}

interface FeaturedCategoriesProps {
  categories: Category[]
}

// أيقونات emoji احتياطية للتصنيفات بدون صورة
const CATEGORY_EMOJIS: Record<string, string> = {
  'electronics':  '📱',
  'fashion':      '👗',
  'home':         '🏠',
  'food':         '🍎',
  'beauty':       '✨',
  'sports':       '⚽',
  'books':        '📚',
  'toys':         '🧸',
}

function getCategoryEmoji(slug: string): string {
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (slug.includes(key)) return emoji
  }
  return '🛍️'
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (categories.length === 0) return null

  const shown = categories.slice(0, 8)

  return (
    <section dir="rtl" className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-900">تصفح حسب التصنيف</h2>
            <p className="mt-1 text-sm text-stone-400">اكتشف منتجات بحسب اهتمامك</p>
          </div>
          <Link
            href="/marketplace"
            className="text-sm font-medium text-amber-600 hover:underline"
          >
            عرض الكل ←
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {shown.map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace?category=${cat.id}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-stone-100 bg-stone-50 p-4 text-center transition hover:border-amber-200 hover:bg-amber-50"
            >
              {/* Image or emoji */}
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white shadow-sm">
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    {getCategoryEmoji(cat.slug)}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium leading-snug text-stone-700 group-hover:text-amber-700 transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}

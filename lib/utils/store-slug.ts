import { normalizeArabic } from '@/lib/utils/arabic'

export function generateStoreSlug(value: string): string {
  return normalizeArabic(value)
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

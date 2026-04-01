// ─────────────────────────────────────────────────────────────────────────────
// lib/utils/arabic.ts
// Arabic text utilities + unified UI labels
// ─────────────────────────────────────────────────────────────────────────────

/**
 * توحيد حروف الهمزة والتاء المربوطة والألف المقصورة
 * يُستخدم في البحث لضمان نتائج أشمل
 */
export function normalizeArabic(text: string): string {
  return text
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * تجهيز نص للبحث: normalize + lowercase للأحرف الإنجليزية
 */
export function prepareForSearch(text: string): string {
  return normalizeArabic(text).toLowerCase()
}

/**
 * تنسيق السعر بالريال السعودي
 */
export function formatCurrency(amount: number, currency = 'SAR', locale = 'ar-SA'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * تنسيق التاريخ بالعربي
 */
export function formatDate(
  date: string | Date,
  locale = 'ar-SA',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(d)
}

/**
 * تنسيق التاريخ والوقت
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  refunded: 'مسترد',
}

export const STORE_STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  suspended: 'موقوف',
  closed: 'مغلق',
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'تمت الموافقة',
  rejected: 'مرفوض',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار الدفع',
  paid: 'مدفوع',
  refunded: 'مسترد',
  failed: 'فشل الدفع',
}

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  active: 'نشط',
  archived: 'مؤرشف',
}

export function getStatusLabel(status: string, labels: Record<string, string>): string {
  return labels[status] ?? status
}

export function getOrderStatusLabel(status: string): string {
  return getStatusLabel(status, ORDER_STATUS_LABELS)
}

export function getStoreStatusLabel(status: string): string {
  return getStatusLabel(status, STORE_STATUS_LABELS)
}

export function getApplicationStatusLabel(status: string): string {
  return getStatusLabel(status, APPLICATION_STATUS_LABELS)
}

export function getPaymentStatusLabel(status: string): string {
  return getStatusLabel(status, PAYMENT_STATUS_LABELS)
}

export function getProductStatusLabel(status: string): string {
  return getStatusLabel(status, PRODUCT_STATUS_LABELS)
}

export function getStockStatus(
  stockQuantity: number,
  trackInventory = true,
): { text: string; tone: string; dot: string } | null {
  if (!trackInventory) return null
  if (stockQuantity === 0) {
    return {
      text: 'نفد المخزون',
      tone: 'text-rose-600 bg-rose-50',
      dot: 'bg-rose-500',
    }
  }
  if (stockQuantity <= 5) {
    return {
      text: `آخر ${stockQuantity} قطع`,
      tone: 'text-amber-700 bg-amber-50',
      dot: 'bg-amber-500',
    }
  }
  return {
    text: 'متوفر',
    tone: 'text-emerald-700 bg-emerald-50',
    dot: 'bg-emerald-500',
  }
}

export type SellerCountryCode = 'EG' | 'SA' | 'AE'

export interface SellerCountryOption {
  code: SellerCountryCode
  name: string
  dialCode: string
  localPlaceholder: string
  localDigits: number
  regex: RegExp
  hint: string
}

export const SELLER_COUNTRY_OPTIONS: SellerCountryOption[] = [
  {
    code: 'EG',
    name: 'مصر',
    dialCode: '+20',
    localPlaceholder: '1095315099',
    localDigits: 10,
    regex: /^(10|11|12|15)\d{8}$/,
    hint: 'رقم موبايل مصري من 10 أرقام بدون الصفر الأول.',
  },
  {
    code: 'SA',
    name: 'السعودية',
    dialCode: '+966',
    localPlaceholder: '512345678',
    localDigits: 9,
    regex: /^5\d{8}$/,
    hint: 'رقم جوال سعودي من 9 أرقام يبدأ بـ 5.',
  },
  {
    code: 'AE',
    name: 'الإمارات',
    dialCode: '+971',
    localPlaceholder: '501234567',
    localDigits: 9,
    regex: /^5\d{8}$/,
    hint: 'رقم جوال إماراتي من 9 أرقام يبدأ بـ 5.',
  },
]

export const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة', 'الفيوم', 'الغربية',
  'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط',
  'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج',
] as const

export function getCountryOption(code?: string | null) {
  return SELLER_COUNTRY_OPTIONS.find((item) => item.code === code) ?? SELLER_COUNTRY_OPTIONS[0]
}

export function formatSellerPhone(countryCode: string, localPhone: string) {
  const country = getCountryOption(countryCode)
  const digits = localPhone.replace(/\D/g, '')
  return `${country.dialCode} ${digits}`
}

export function validateSellerLocalPhone(countryCode: string, localPhone: string) {
  const country = getCountryOption(countryCode)
  const digits = localPhone.replace(/\D/g, '')

  if (!digits) {
    return 'رقم الجوال مطلوب'
  }

  if (digits.length !== country.localDigits || !country.regex.test(digits)) {
    return `رقم الجوال غير صالح لدولة ${country.name}`
  }

  return null
}

export function parseSellerStoredPhone(phone: string | null | undefined) {
  const raw = (phone ?? '').trim()

  for (const country of SELLER_COUNTRY_OPTIONS) {
    if (raw.startsWith(country.dialCode)) {
      return {
        country: country.code,
        phone_local: raw.slice(country.dialCode.length).replace(/\D/g, ''),
      }
    }
  }

  const digits = raw.replace(/\D/g, '')
  if (/^05\d{8}$/.test(digits)) {
    return { country: 'EG' as SellerCountryCode, phone_local: digits.slice(1) }
  }

  return { country: 'EG' as SellerCountryCode, phone_local: digits }
}

'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/hooks/useCart'
import { OrderSummary } from './order-summary'
import type { Address } from './address-selector'
import type { CartWithItems } from '@/services/cart.service'
import type { CreateOrderRequest, CreateOrderResponse } from '@/types/api.types'
import { formatCurrency } from '@/lib/utils/arabic'
import { EGYPT_GOVERNORATES } from '@/lib/utils/seller-form'
import { addAddress, updateAddress, type CustomerAddressInsert, type CustomerAddressUpdate } from '@/services/address.service'

interface CheckoutFormProps {
  cart: CartWithItems
  subtotal: number
  addresses: Address[]
  userId: string
}

interface CheckoutValues {
  fullName: string
  phone: string
  city: string
  street: string
  notes: string
}

interface DeliveryLocationState {
  mapsLink: string
  lat: number | null
  lng: number | null
  source: 'current_location' | 'google_maps_link' | ''
  status: string
}

const EMPTY_LOCATION: DeliveryLocationState = {
  mapsLink: '',
  lat: null,
  lng: null,
  source: '',
  status: 'لم يتم تحديد موقع تسليم على الخريطة بعد.',
}

function buildInitialValues(addresses: Address[]): CheckoutValues {
  const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0] ?? null

  return {
    fullName: defaultAddress?.full_name ?? '',
    phone: normalizeCustomerPhone(defaultAddress?.phone ?? ''),
    city: defaultAddress?.city ?? '',
    street: [defaultAddress?.district, defaultAddress?.street, defaultAddress?.building]
      .filter(Boolean)
      .join(' — '),
    notes: '',
  }
}

function normalizeCustomerPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')

  if (digits.startsWith('20') && digits.length === 12) return `0${digits.slice(2)}`
  if (digits.length === 10 && /^(10|11|12|15)/.test(digits)) return `0${digits}`

  return digits ? phone : ''
}

function validateEgyptPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return /^01(0|1|2|5)\d{8}$/.test(digits)
}

function normalizeGoogleMapsUrl(link: string) {
  const value = link.trim()
  if (!value) return ''
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function isGoogleMapsLink(link: string) {
  return /^(https?:\/\/)?(www\.)?(google\.[^/]+\/maps|maps\.app\.goo\.gl)\//i.test(link.trim())
}

function extractCoordinates(link: string) {
  const value = link.trim()
  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (!match) continue

    const lat = Number(match[1])
    const lng = Number(match[2])
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }
    }
  }

  return { lat: null, lng: null }
}

function buildMapsLink(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${Number(lat.toFixed(6))},${Number(lng.toFixed(6))}`
}

function normalizeWhatsappPhone(phone?: string | null) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('20')) return digits
  if (digits.startsWith('0')) return `20${digits.slice(1)}`
  return digits
}

function buildLocationNote(location: DeliveryLocationState) {
  if (!location.mapsLink && !Number.isFinite(location.lat) && !Number.isFinite(location.lng)) return null

  const parts: string[] = ['تم تحديد موقع التسليم على الخريطة']
  if (location.source === 'current_location') parts.push('المصدر: الموقع الحالي')
  if (location.source === 'google_maps_link') parts.push('المصدر: رابط من خرائط Google')
  if (location.lat && location.lng) parts.push(`الإحداثيات: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`)
  if (location.mapsLink) parts.push(`رابط الموقع: ${location.mapsLink}`)

  return parts.join(' | ')
}

export function CheckoutForm({ cart, subtotal, addresses, userId }: CheckoutFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0] ?? null

  const {
    cart: liveCart,
    subtotal: liveSubtotal,
    loading: cartLoading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart(userId)

  const [values, setValues] = useState<CheckoutValues>(() => buildInitialValues(addresses))
  const [mapsInput, setMapsInput] = useState('')
  const [location, setLocation] = useState<DeliveryLocationState>(EMPTY_LOCATION)
  const [submitting, setSubmitting] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeCart = liveCart ?? cart
  const activeSubtotal = liveCart ? liveSubtotal : subtotal
  const storeName = activeCart.stores?.name ?? 'المتجر'
  const storePhone = normalizeWhatsappPhone(activeCart.stores?.phone)

  const hasAddressDetails = useMemo(() => {
    return Boolean(
      values.fullName.trim() &&
      values.phone.trim() &&
      values.city.trim() &&
      values.street.trim()
    )
  }, [values])

  function updateValue<K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function persistAddress() {
    const addressPayload: CustomerAddressInsert = {
      customer_id: userId,
      full_name: values.fullName.trim(),
      phone: values.phone.replace(/\s+/g, ''),
      city: values.city.trim(),
      district: null,
      street: values.street.trim(),
      building: null,
      notes: buildLocationNote(location) ?? defaultAddress?.notes ?? null,
      is_default: defaultAddress?.is_default ?? addresses.length === 0,
      label: defaultAddress?.label ?? 'عنوان الطلب',
    }

    if (defaultAddress?.id) {
      const addressUpdate: CustomerAddressUpdate = {
        full_name: addressPayload.full_name,
        phone: addressPayload.phone,
        city: addressPayload.city,
        district: addressPayload.district,
        street: addressPayload.street,
        building: addressPayload.building,
        notes: addressPayload.notes,
        is_default: addressPayload.is_default,
        label: addressPayload.label,
      }

      const result = await updateAddress(supabase as any, userId, defaultAddress.id, addressUpdate)
      if (!result.success) throw new Error(result.error ?? 'تعذّر حفظ عنوان التوصيل الحالي')
      return defaultAddress.id
    }

    const result = await addAddress(supabase as any, userId, {
      label: addressPayload.label,
      full_name: addressPayload.full_name,
      phone: addressPayload.phone,
      city: addressPayload.city,
      district: addressPayload.district,
      street: addressPayload.street,
      building: addressPayload.building,
      notes: addressPayload.notes,
      is_default: addressPayload.is_default,
    })

    if (!result.success) {
      throw new Error(result.error ?? 'تعذّر إنشاء عنوان التوصيل')
    }

    return result.address.id
  }

  function validateBeforeSubmit() {
    if (activeCart.cart_items.length === 0) return 'سلتك فارغة حاليًا'
    if (!values.fullName.trim()) return 'الاسم مطلوب'
    if (!values.phone.trim()) return 'رقم الموبايل مطلوب'
    if (!validateEgyptPhone(values.phone)) return 'رقم الموبايل غير صحيح (مثال: 01012345678)'
    if (!values.city.trim()) return 'اختر المحافظة أولًا'
    if (!values.street.trim()) return 'اكتب العنوان بالتفصيل أولًا'
    return null
  }

  async function handleSubmit() {
    const validationError = validateBeforeSubmit()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const addressId = await persistAddress()
      const noteParts: string[] = []

      if (values.notes.trim()) noteParts.push(values.notes.trim())

      const body: CreateOrderRequest = {
        cartId: activeCart.id,
        addressId,
        paymentMethod: 'cash_on_delivery',
        notes: noteParts.length > 0 ? noteParts.join('\n\n') : undefined,
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw new Error('تعذر التحقق من جلسة المستخدم الحالية')
      }

      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        throw new Error('يجب تسجيل الدخول أولًا قبل إرسال الطلب')
      }

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-order`
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })

      const responseBody = await response.json().catch(() => null)

      if (!response.ok) {
        const rawMessage = responseBody?.error || responseBody?.message || 'حدث خطأ أثناء إنشاء الطلب'
        const rawCode = responseBody?.code || ''
        const message = typeof rawMessage === 'string' ? rawMessage : 'حدث خطأ أثناء إنشاء الطلب'

        if (message.includes('PRICE_CHANGED') || rawCode === 'PRICE_CHANGED') {
          setError('تغيّرت أسعار بعض المنتجات. راجع السلة ثم حاول مرة أخرى.')
        } else {
          setError(message)
        }
        return
      }

      const data = responseBody as CreateOrderResponse | null

      if (!data?.orderNumber) {
        setError('حدث خطأ غير متوقع أثناء تسجيل الطلب')
        return
      }

      router.push(`/checkout/success?orderNumber=${data.orderNumber}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'تعذّر إكمال الطلب الآن'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError('المتصفح الحالي لا يدعم تحديد الموقع')
      return
    }

    setLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6))
        const lng = Number(position.coords.longitude.toFixed(6))
        setLocation({
          mapsLink: buildMapsLink(lat, lng),
          lat,
          lng,
          source: 'current_location',
          status: `تم تحديد موقعك الحالي بنجاح (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        })
        setLocating(false)
      },
      () => {
        setError('تعذر الوصول إلى موقعك الحالي. فعّل إذن الموقع أو استخدم رابط خرائط Google.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  function handleApplyMapsLink() {
    const normalized = normalizeGoogleMapsUrl(mapsInput)

    if (!normalized) {
      setError('الصق رابط موقع من خرائط Google أولًا')
      return
    }

    if (!isGoogleMapsLink(normalized)) {
      setError('الرابط الحالي لا يبدو كرابط صحيح من خرائط Google')
      return
    }

    const coords = extractCoordinates(normalized)

    setLocation({
      mapsLink: normalized,
      lat: coords.lat,
      lng: coords.lng,
      source: 'google_maps_link',
      status: coords.lat && coords.lng
        ? `تم تحديد موقع التسليم من رابط خرائط Google (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`
        : 'تم تحديد موقع التسليم من رابط خرائط Google',
    })
    setError(null)
  }

  function handleClearLocation() {
    setLocation(EMPTY_LOCATION)
    setMapsInput('')
  }

  function handleWhatsApp() {
    const validationError = validateBeforeSubmit()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!storePhone) {
      setError('رقم واتساب المتجر غير متوفر حاليًا')
      return
    }

    const lines = [
      `مرحبًا ${storeName}`,
      'أرغب في إرسال هذا الطلب عبر واتساب:',
      '',
      ...activeCart.cart_items.map((item, index) => {
        return `${index + 1}- ${item.products.name} × ${item.quantity} = ${formatCurrency(Number(item.products.price) * item.quantity)}`
      }),
      '',
      `الاسم: ${values.fullName.trim()}`,
      `الموبايل: ${values.phone.trim()}`,
      `المحافظة: ${values.city.trim()}`,
      `العنوان: ${values.street.trim()}`,
      `المجموع الحالي: ${formatCurrency(activeSubtotal)}`,
      'الشحن: يحدد لاحقًا حسب المنطقة',
      `الإجمالي الحالي قبل الشحن: ${formatCurrency(activeSubtotal)}`,
    ]

    if (location.mapsLink) {
      lines.push(`موقع التسليم: ${location.mapsLink}`)
    }

    if (values.notes.trim()) {
      lines.push(`ملاحظات: ${values.notes.trim()}`)
    }

    const url = `https://wa.me/${storePhone}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div dir="rtl" className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-stone-200 bg-white/70 px-5 py-5 shadow-[0_10px_30px_rgba(28,25,23,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <span className="inline-flex rounded-full border border-[#dfe6c8] bg-[#f7f9ef] px-3 py-1 text-xs font-bold text-[#6d8c26]">
            سلة التسوق
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">
            راجع طلبك قبل الإرسال
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
            عدّل الكميات، وراجع بيانات التوصيل، ثم أرسل الطلب مباشرة من الموقع أو عبر واتساب.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center rounded-2xl border border-[#d7ddc6] bg-white px-5 py-3 text-sm font-bold text-[#6d8c26] transition hover:bg-[#fafcf4]"
        >
          العودة للمنتجات
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-6 order-2 xl:order-1">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(28,25,23,0.04)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black tracking-tight text-stone-900">بيانات الطلب</h2>
              {defaultAddress && (
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-500">
                  تم تعبئة البيانات من عنوانك الافتراضي
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم" required>
                <input
                  value={values.fullName}
                  onChange={(event) => updateValue('fullName', event.target.value)}
                  placeholder="اكتب اسمك"
                  className={inputClass}
                />
              </Field>

              <Field label="رقم الموبايل" required>
                <input
                  dir="ltr"
                  value={values.phone}
                  onChange={(event) => updateValue('phone', event.target.value.replace(/[^\d+]/g, ''))}
                  placeholder="01012345678"
                  className={`${inputClass} text-start`}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,200px)_1fr]">
              <Field label="المحافظة" required>
                <select
                  value={values.city}
                  onChange={(event) => updateValue('city', event.target.value)}
                  className={inputClass}
                >
                  <option value="">اختر المحافظة</option>
                  {EGYPT_GOVERNORATES.map((governorate) => (
                    <option key={governorate} value={governorate}>{governorate}</option>
                  ))}
                </select>
              </Field>

              <Field label="العنوان بالتفصيل" required>
                <textarea
                  rows={4}
                  value={values.street}
                  onChange={(event) => updateValue('street', event.target.value)}
                  placeholder="اكتب العنوان بالتفصيل: المنطقة، الشارع، العمارة، الدور، الشقة..."
                  className={textareaClass}
                />
              </Field>
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-[#d8dfc6] bg-[#fbfcf7] p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-black text-stone-900">
                  موقع التسليم على الخريطة
                  <span className="me-1 text-xs font-normal text-stone-400">(اختياري)</span>
                </h3>
              </div>

              <p className="text-sm leading-7 text-stone-500">
                يمكنك استخدام <strong>موقعك الحالي</strong> مباشرة، أو فتح خرائط Google لاختيار موقع تسليم مختلف ثم لصق الرابط هنا.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={handleUseCurrentLocation} className={ghostButtonClass}>
                  {locating ? 'جاري تحديد موقعي...' : 'استخدم موقعي الحالي'}
                </button>
                <button type="button" onClick={() => window.open('https://maps.google.com', '_blank', 'noopener,noreferrer')} className={ghostButtonClass}>
                  افتح خرائط Google
                </button>
                {(location.mapsLink || location.lat || location.lng) && (
                  <button type="button" onClick={handleClearLocation} className={ghostButtonClass}>
                    مسح الموقع
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  dir="ltr"
                  value={mapsInput}
                  onChange={(event) => setMapsInput(event.target.value)}
                  placeholder="الصق رابط الموقع من خرائط Google هنا"
                  className={`${inputClass} flex-1 text-start`}
                />
                <button type="button" onClick={handleApplyMapsLink} className="rounded-2xl bg-[#ef7d00] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#de7400]">
                  تأكيد الرابط
                </button>
              </div>

              <p className="mt-3 text-xs leading-6 text-stone-400">
                افتح خرائط Google، اختر الموقع الذي تريد التسليم إليه، ثم انسخ الرابط والصقه هنا.
              </p>

              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-7 ${location.mapsLink ? 'border-[#cfe6cb] bg-[#f4fbf1] text-[#4e7a23]' : 'border-stone-200 bg-white text-stone-500'}`}>
                {location.status}
              </div>

              {location.mapsLink && (
                <a
                  href={location.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-sm font-bold text-[#6d8c26] underline underline-offset-4"
                >
                  فتح الموقع المحدد
                </a>
              )}
            </div>

            <div className="mt-5">
              <Field label="ملاحظات" hint="أي تفاصيل إضافية عن الطلب">
                <textarea
                  rows={4}
                  value={values.notes}
                  onChange={(event) => updateValue('notes', event.target.value)}
                  placeholder="أي تفاصيل إضافية عن الطلب"
                  className={textareaClass}
                />
              </Field>
            </div>

            <div className="mt-4 rounded-2xl px-4 py-3 text-sm leading-7 text-stone-600">
              <strong className="block text-stone-900">تنبيه مهم</strong>
              سيتم إضافة قيمة الشحن لاحقًا حسب المنطقة (+ مصاريف الشحن).
            </div>
          </div>
        </section>

        <aside className="space-y-6 order-1 xl:order-2">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(28,25,23,0.04)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black tracking-tight text-stone-900">المنتجات المختارة</h2>
              {activeCart.cart_items.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="rounded-2xl border border-[#d7ddc6] bg-white px-4 py-2 text-sm font-bold text-[#6d8c26] transition hover:bg-[#fafcf4]"
                >
                  تفريغ السلة
                </button>
              )}
            </div>

            {activeCart.cart_items.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-stone-200 bg-stone-50 px-4 py-10 text-center">
                <p className="text-sm text-stone-500">السلة فارغة حاليًا.</p>
                <Link
                  href="/marketplace"
                  className="mt-4 inline-flex rounded-2xl border border-[#d7ddc6] bg-white px-5 py-3 text-sm font-bold text-[#6d8c26]"
                >
                  ابدأ التسوق
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeCart.cart_items.map((item) => {
                  const image = item.products.product_images?.find((img) => img.is_primary)?.url
                    ?? item.products.product_images?.[0]?.url
                    ?? null

                  return (
                    <div key={item.id} className="rounded-[1.75rem] border border-stone-200 bg-stone-50/70 p-4">
                      <div className="flex gap-3">
                        <Link href={`/product/${item.products.id}`} className="shrink-0">
                          <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image} alt={item.products.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-stone-300">🧺</div>
                            )}
                          </div>
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link href={`/product/${item.products.id}`} className="line-clamp-2 text-sm font-bold text-stone-900 hover:text-[#6d8c26]">
                                {item.products.name}
                              </Link>
                              <p className="mt-1 text-xs text-stone-400">
                                {formatCurrency(Number(item.products.price))} للقطعة
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="rounded-full p-1 text-stone-400 transition hover:bg-white hover:text-rose-500"
                              aria-label="حذف المنتج"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="flex items-center rounded-2xl border border-stone-200 bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="flex h-10 w-10 items-center justify-center text-stone-500 transition hover:text-stone-900 disabled:opacity-30"
                              >
                                −
                              </button>
                              <span className="w-10 text-center text-sm font-bold text-stone-900">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.products.track_inventory && item.quantity >= item.products.stock_quantity}
                                className="flex h-10 w-10 items-center justify-center text-stone-500 transition hover:text-stone-900 disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>

                            <p className="text-sm font-black text-stone-900">
                              {formatCurrency(Number(item.products.price) * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <OrderSummary
            cart={activeCart}
            subtotal={activeSubtotal}
            loading={submitting || cartLoading}
            hasAddressDetails={hasAddressDetails}
            hasLocation={Boolean(location.mapsLink)}
            error={error}
            onSubmit={handleSubmit}
            onWhatsApp={handleWhatsApp}
          />
        </aside>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-1 text-sm font-bold text-stone-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && <span className="text-xs font-normal text-stone-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const inputClass = 'w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-[#b8c98a] focus:outline-none focus:ring-2 focus:ring-[#dfe6c8]/70'
const textareaClass = 'w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-[#b8c98a] focus:outline-none focus:ring-2 focus:ring-[#dfe6c8]/70'
const ghostButtonClass = 'rounded-2xl border border-[#d7ddc6] bg-white px-4 py-3 text-sm font-bold text-[#6d8c26] transition hover:bg-[#fafcf4]'

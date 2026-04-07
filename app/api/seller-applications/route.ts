import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { formatSellerPhone } from '@/lib/utils/seller-form'

export async function POST(request: Request) {
  const supabase = await createClient()
  const service = createServiceClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولًا.' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'بيانات الطلب غير صالحة.' }, { status: 400 })
  }

  const payload = {
    user_id: user.id,
    store_name: String(body.store_name ?? '').trim(),
    store_description: String(body.store_description ?? '').trim() || null,
    phone: formatSellerPhone(String(body.country ?? 'EG'), String(body.phone_local ?? '')),
    city: String(body.city ?? '').trim(),
    business_type: String(body.address_details ?? '').trim() || null,
  }

  if (!payload.store_name || !payload.phone.trim() || !payload.city) {
    return NextResponse.json({ error: 'البيانات المطلوبة غير مكتملة.' }, { status: 400 })
  }

  const { data, error } = await service
    .from('seller_applications')
    .insert(payload)
    .select('*')
    .single()

  if (error || !data) {
    const message = error?.message ?? ''
    if (message.includes('one_pending_application_per_user')) {
      return NextResponse.json({ error: 'لديك بالفعل طلب قيد المراجعة.' }, { status: 400 })
    }
    if (message.includes('one_approved_application_per_user')) {
      return NextResponse.json({ error: 'تمت الموافقة على حسابك كبائع بالفعل.' }, { status: 400 })
    }
    console.error('submit seller application error:', error)
    return NextResponse.json({ error: 'تعذّر إرسال طلب الانضمام. حاول مرة أخرى.' }, { status: 500 })
  }

  const { data: admins } = await service
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')

  if (Array.isArray(admins) && admins.length > 0) {
    const notificationRows = admins.map((admin: any) => ({
      user_id: admin.user_id,
      type: 'seller_application_pending',
      title: 'طلب بائع جديد يحتاج مراجعة',
      body: `${payload.store_name} · ${payload.city}`,
      link: `/admin/seller-applications?focus=${data.id}`,
    }))

    const { error: notificationError } = await service.from('notifications').insert(notificationRows)
    if (notificationError) {
      console.error('submit seller application notifications error:', notificationError)
    }
  }

  return NextResponse.json({ success: true, application: data })
}

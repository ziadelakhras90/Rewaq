import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateStoreSlug } from '@/lib/utils/store-slug'
import type { ApproveSellerRequest } from '@/types/api.types'

async function generateUniqueStoreSlug(baseName: string, service: any) {
  const base = generateStoreSlug(baseName)
  let candidate = base
  let index = 1

  while (true) {
    const { data } = await service.from('stores').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    candidate = `${base}-${index}`
    index += 1
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const service = createServiceClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول أولًا.' }, { status: 401 })

  const { data: role } = await service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
  if (!role) return NextResponse.json({ error: 'هذا الإجراء متاح للإدارة فقط.' }, { status: 403 })

  let body: ApproveSellerRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'بيانات الطلب غير صالحة.' }, { status: 400 })
  }

  const applicationId = body.applicationId?.trim()
  if (!applicationId) return NextResponse.json({ error: 'applicationId مطلوب.' }, { status: 400 })

  const { data: application, error: appError } = await service
    .from('seller_applications')
    .select('id, user_id, store_name, store_description, phone, city, status')
    .eq('id', applicationId)
    .maybeSingle()

  if (appError) {
    console.error('approve seller fetch application error:', appError)
    return NextResponse.json({ error: 'تعذر جلب الطلب.' }, { status: 500 })
  }
  if (!application) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 })
  if (application.status !== 'pending') return NextResponse.json({ error: `لا يمكن الموافقة على طلب حالته ${application.status}.` }, { status: 400 })

  const slug = await generateUniqueStoreSlug(application.store_name, service)
  const { error: rpcError } = await service.rpc('approve_seller_transaction', {
    p_application_id: applicationId,
    p_user_id: application.user_id,
    p_store_name: application.store_name,
    p_store_description: application.store_description ?? null,
    p_store_phone: application.phone,
    p_store_city: application.city,
    p_slug: slug,
    p_admin_id: user.id,
    p_admin_notes: body.adminNotes?.trim() || null,
  })

  if (rpcError) {
    console.error('approve_seller_transaction error:', rpcError)
    return NextResponse.json({ error: 'تعذر تنفيذ الموافقة.' }, { status: 500 })
  }

  const { error: notifError } = await service.from('notifications').insert({
    user_id: application.user_id,
    type: 'seller_approved',
    title: 'تمت الموافقة على متجرك في Rewq',
    body: 'يمكنك الآن إدارة طلبات العملاء وإضافة منتجاتك.',
    link: '/seller/orders',
  })
  if (notifError) console.error('approve seller notification error:', notifError)

  const { error: auditError } = await service.from('admin_audit_logs').insert({
    admin_id: user.id,
    action: 'approve_seller',
    target_type: 'seller_application',
    target_id: applicationId,
    notes: body.adminNotes?.trim() || null,
  })
  if (auditError) console.error('approve seller audit log error:', auditError)

  return NextResponse.json({ success: true })
}

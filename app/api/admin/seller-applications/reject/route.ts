import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { RejectSellerRequest } from '@/types/api.types'

async function sendBrevoEmail(to: string, storeName: string, reason: string) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey || !to) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || ''

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: [{ email: to }],
      templateId: 2,
      params: {
        store_name: storeName,
        reason,
        reapply_link: appUrl ? `${appUrl}/become-seller` : '/become-seller',
      },
    }),
  })

  if (!res.ok) {
    console.error('reject seller Brevo error:', await res.text())
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const service = createServiceClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولًا.' }, { status: 401 })
  }

  const { data: role } = await service
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!role) {
    return NextResponse.json({ error: 'هذا الإجراء متاح للإدارة فقط.' }, { status: 403 })
  }

  let body: RejectSellerRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'بيانات الطلب غير صالحة.' }, { status: 400 })
  }

  const applicationId = body.applicationId?.trim()
  const adminNotes = body.adminNotes?.trim()

  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId مطلوب.' }, { status: 400 })
  }

  if (!adminNotes) {
    return NextResponse.json({ error: 'سبب الرفض مطلوب.' }, { status: 400 })
  }

  const { data: application, error: appError } = await service
    .from('seller_applications')
    .select('id, user_id, store_name, status')
    .eq('id', applicationId)
    .maybeSingle()

  if (appError) {
    console.error('reject seller fetch application error:', appError)
    return NextResponse.json({ error: 'تعذر جلب الطلب.' }, { status: 500 })
  }

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 })
  }

  if (application.status !== 'pending') {
    return NextResponse.json({ error: `لا يمكن رفض طلب حالته ${application.status}.` }, { status: 400 })
  }

  const { error: updateError } = await service
    .from('seller_applications')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes,
    })
    .eq('id', applicationId)

  if (updateError) {
    console.error('reject seller update error:', updateError)
    return NextResponse.json({ error: 'تعذر تحديث حالة الطلب.' }, { status: 500 })
  }

  const { data: sellerAuth } = await service.auth.admin.getUserById(application.user_id)
  const sellerEmail = sellerAuth.user?.email || ''

  const sideEffects = await Promise.allSettled([
    service.from('notifications').insert({
      user_id: application.user_id,
      type: 'seller_rejected',
      title: 'بشأن طلب انضمامك إلى Rewq',
      body: adminNotes,
      link: '/seller/status',
    }),
    service.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'reject_seller',
      target_type: 'seller_application',
      target_id: applicationId,
      notes: adminNotes,
    }),
    sendBrevoEmail(sellerEmail, application.store_name, adminNotes),
  ])

  sideEffects.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`reject seller side effect ${index} failed:`, result.reason)
    }
  })

  return NextResponse.json({ success: true })
}

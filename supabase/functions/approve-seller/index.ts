// ─────────────────────────────────────────────────────────────────────────────
// supabase/functions/approve-seller/index.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  getAdminClient,
  json,
  handleOptions,
  handleError,
  requireUser,
  requireRole,
  getUserEmail,
  sendBrevoEmail,
  BREVO_TEMPLATES,
  generateUniqueStoreSlug,
  ValidationError,
  NotFoundError,
} from '../_shared/helpers.ts'

import type { ApproveSellerRequest, ApproveSellerResponse } from '../../../types/api.types.ts'

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  const supabase = getAdminClient()

  try {
    // ── 1. تحقق من الأدمن ─────────────────────────────────────────────────
    const user = await requireUser(req, supabase)
    await requireRole(user.id, 'admin', supabase)

    // ── 2. body ───────────────────────────────────────────────────────────
    let body: ApproveSellerRequest
    try {
      body = await req.json()
    } catch {
      throw new ValidationError('Request body غير صالح')
    }

    const { applicationId, adminNotes } = body
    if (!applicationId) throw new ValidationError('applicationId مطلوب')

    // ── 3. جلب الطلب ──────────────────────────────────────────────────────
    const { data: application, error: appError } = await supabase
      .from('seller_applications')
      .select('id, user_id, store_name, store_description, phone, city, status')
      .eq('id', applicationId)
      .maybeSingle()

    if (appError) throw new Error('فشل جلب الطلب')
    if (!application) throw new NotFoundError('الطلب غير موجود')
    if (application.status !== 'pending') {
      throw new ValidationError(
        `الطلب في حالة "${application.status}" — لا يمكن الموافقة عليه`
      )
    }

    // ── 4. توليد slug فريد للمتجر ─────────────────────────────────────────
    const slug = await generateUniqueStoreSlug(application.store_name, supabase)

    // ── 5. تنفيذ الـ transaction ──────────────────────────────────────────
    const { error: rpcError } = await supabase.rpc('approve_seller_transaction', {
      p_application_id:    applicationId,
      p_user_id:           application.user_id,
      p_store_name:        application.store_name,
      p_store_description: application.store_description ?? null,
      p_store_phone:       application.phone,
      p_store_city:        application.city,
      p_slug:              slug,
      p_admin_id:          user.id,
      p_admin_notes:       adminNotes ?? null,
    })

    if (rpcError) {
      console.error('approve_seller_transaction error:', rpcError)
      throw new Error('فشل تنفيذ الموافقة')
    }

    // ── 6. إشعار داخلي للبائع ────────────────────────────────────────────
    await supabase.from('notifications').insert({
      user_id: application.user_id,
      type:    'seller_approved',
      title:   'تمت الموافقة على متجرك في رِواق',
      body:    'يمكنك الآن البدء بإضافة منتجاتك وإدارة متجرك.',
      link:    '/seller',
    })

    // ── 7. إرسال إيميل ───────────────────────────────────────────────────
    const sellerEmail = await getUserEmail(application.user_id, supabase)
    if (sellerEmail) {
      await sendBrevoEmail({
        to:         sellerEmail,
        templateId: BREVO_TEMPLATES.SELLER_APPROVED,
        params: {
          store_name:      application.store_name,
          dashboard_link:  `${Deno.env.get('APP_URL') ?? ''}/seller`,
        },
      })
    }

    // ── 8. audit log ──────────────────────────────────────────────────────
    await supabase.from('admin_audit_logs').insert({
      admin_id:    user.id,
      action:      'approve_seller',
      target_type: 'seller_application',
      target_id:   applicationId,
      notes:       adminNotes ?? null,
    })

    const response: ApproveSellerResponse = { success: true }
    return json(response)

  } catch (err) {
    return handleError(err)
  }
})

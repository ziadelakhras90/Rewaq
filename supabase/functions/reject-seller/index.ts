// ─────────────────────────────────────────────────────────────────────────────
// supabase/functions/reject-seller/index.ts
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
  ValidationError,
  NotFoundError,
} from '../_shared/helpers.ts'

import type { RejectSellerRequest, RejectSellerResponse } from '../../../types/api.types.ts'

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  const supabase = getAdminClient()

  try {
    // ── 1. تحقق من الأدمن ─────────────────────────────────────────────────
    const user = await requireUser(req, supabase)
    await requireRole(user.id, 'admin', supabase)

    // ── 2. body ───────────────────────────────────────────────────────────
    let body: RejectSellerRequest
    try {
      body = await req.json()
    } catch {
      throw new ValidationError('Request body غير صالح')
    }

    const { applicationId, adminNotes } = body
    if (!applicationId)       throw new ValidationError('applicationId مطلوب')
    if (!adminNotes?.trim())  throw new ValidationError('سبب الرفض مطلوب (adminNotes)')

    // ── 3. جلب الطلب ──────────────────────────────────────────────────────
    const { data: application, error: appError } = await supabase
      .from('seller_applications')
      .select('id, user_id, store_name, status')
      .eq('id', applicationId)
      .maybeSingle()

    if (appError) throw new Error('فشل جلب الطلب')
    if (!application) throw new NotFoundError('الطلب غير موجود')
    if (application.status !== 'pending') {
      throw new ValidationError(
        `الطلب في حالة "${application.status}" — لا يمكن رفضه`
      )
    }

    // ── 4. تحديث حالة الطلب ───────────────────────────────────────────────
    const { error: updateError } = await supabase
      .from('seller_applications')
      .update({
        status:      'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes.trim(),
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('reject seller update error:', updateError)
      throw new Error('فشل تحديث الطلب')
    }

    // ── 5. إشعار داخلي ────────────────────────────────────────────────────
    await supabase.from('notifications').insert({
      user_id: application.user_id,
      type:    'seller_rejected',
      title:   'بشأن طلب انضمامك إلى رِواق',
      body:    adminNotes.trim(),
      link:    '/seller/status',
    })

    // ── 6. إرسال إيميل ───────────────────────────────────────────────────
    const sellerEmail = await getUserEmail(application.user_id, supabase)
    if (sellerEmail) {
      await sendBrevoEmail({
        to:         sellerEmail,
        templateId: BREVO_TEMPLATES.SELLER_REJECTED,
        params: {
          store_name:   application.store_name,
          reason:       adminNotes.trim(),
          reapply_link: `${Deno.env.get('APP_URL') ?? ''}/become-seller`,
        },
      })
    }

    // ── 7. audit log ──────────────────────────────────────────────────────
    await supabase.from('admin_audit_logs').insert({
      admin_id:    user.id,
      action:      'reject_seller',
      target_type: 'seller_application',
      target_id:   applicationId,
      notes:       adminNotes.trim(),
    })

    const response: RejectSellerResponse = { success: true }
    return json(response)

  } catch (err) {
    return handleError(err)
  }
})

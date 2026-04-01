// ─────────────────────────────────────────────────────────────────────────────
// supabase/functions/_shared/helpers.ts
// مشترك بين كل Edge Functions — لا يُستورد في Next.js
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─────────────────────────────────────────────────────────────────────────────
// Supabase admin client (service_role) — يُنشأ مرة واحدة لكل invocation
// ─────────────────────────────────────────────────────────────────────────────

export function getAdminClient(): SupabaseClient {
  const url  = Deno.env.get('SUPABASE_URL')
  const key  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !key) {
    throw new Error('SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY غير موجود في البيئة')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, content-type',
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * يستخرج المستخدم الحالي من JWT في Authorization header.
 * يرمي خطأ إذا لم يكن موجودًا أو غير صالح.
 */
export async function requireUser(
  req: Request,
  supabase: SupabaseClient
): Promise<{ id: string; email: string }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Authorization header مفقود')
  }

  const token = authHeader.replace('Bearer ', '').trim()
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new AuthError('JWT غير صالح أو منتهي الصلاحية')
  }

  return { id: user.id, email: user.email ?? '' }
}

/**
 * يتحقق أن المستخدم لديه دور معين.
 * يرمي خطأ إذا لم يكن لديه الدور.
 */
export async function requireRole(
  userId:  string,
  role:    'customer' | 'seller' | 'admin',
  supabase: SupabaseClient
): Promise<void> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle()

  if (error || !data) {
    throw new ForbiddenError(`هذا الإجراء يتطلب دور: ${role}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Order Number
// ─────────────────────────────────────────────────────────────────────────────

/**
 * يولّد رقم طلب فريد بصيغة RWQ-YYYY-NNNNN
 * يحاول حتى MAX_RETRIES مرات لتجنب التكرار.
 */
export async function generateUniqueOrderNumber(
  supabase: SupabaseClient,
  maxRetries = 10
): Promise<string> {
  const year = new Date().getFullYear()

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // رقم عشوائي 5 خانات
    const seq    = Math.floor(10000 + Math.random() * 90000)
    const number = `RWQ-${year}-${seq}`

    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', number)
      .maybeSingle()

    if (!data) return number
  }

  throw new Error(`فشل توليد رقم طلب فريد بعد ${maxRetries} محاولات`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Slug
// ─────────────────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function generateUniqueStoreSlug(
  base:     string,
  supabase: SupabaseClient
): Promise<string> {
  let slug    = slugify(base)
  let attempt = 0

  while (true) {
    const { data } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!data) return slug
    attempt++
    slug = `${slugify(base)}-${attempt}`
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email (Brevo)
// ─────────────────────────────────────────────────────────────────────────────

export const BREVO_TEMPLATES = {
  SELLER_APPROVED:  1,
  SELLER_REJECTED:  2,
  ORDER_CONFIRMED:  3,
  ORDER_SHIPPED:    4,
} as const

export async function sendBrevoEmail({
  to,
  templateId,
  params,
}: {
  to:         string
  templateId: number
  params:     Record<string, string | number>
}): Promise<void> {
  const apiKey = Deno.env.get('BREVO_API_KEY')
  if (!apiKey) {
    console.warn('BREVO_API_KEY غير موجود — تخطي إرسال الإيميل')
    return
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key':      apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to:         [{ email: to }],
      templateId,
      params,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    // نسجّل الخطأ لكن لا نرمي — إرسال الإيميل لا يجب أن يوقف الطلب
    console.error(`Brevo error ${res.status}: ${body}`)
  }
}

/**
 * يجلب email المستخدم من auth.users عبر admin API
 */
export async function getUserEmail(
  userId:  string,
  supabase: SupabaseClient
): Promise<string> {
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  if (error || !data.user?.email) {
    console.warn(`لم يتم إيجاد email للمستخدم ${userId}`)
    return ''
  }
  return data.user.email
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Errors
// ─────────────────────────────────────────────────────────────────────────────

export class AuthError extends Error {
  readonly status = 401
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends Error {
  readonly status = 403
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class ValidationError extends Error {
  readonly status = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  readonly status = 404
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  readonly status = 409
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

/**
 * يحوّل أي خطأ إلى HTTP Response مناسب
 */
export function handleError(err: unknown): Response {
  if (
    err instanceof AuthError      ||
    err instanceof ForbiddenError ||
    err instanceof ValidationError ||
    err instanceof NotFoundError  ||
    err instanceof ConflictError
  ) {
    return json({ error: err.message }, err.status)
  }

  console.error('Unhandled error:', err)
  return json({ error: 'خطأ داخلي في الخادم' }, 500)
}

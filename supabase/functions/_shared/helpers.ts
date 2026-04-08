// ─────────────────────────────────────────────────────────────────────────────
// supabase/functions/_shared/helpers.ts
// مشترك بين كل Edge Functions — لا يُستورد في Next.js
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

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
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function getRequestAuthClient(req: Request): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || req.headers.get('apikey')
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || ''

  if (!url || !anonKey) {
    throw new Error('SUPABASE_URL أو SUPABASE_ANON_KEY غير موجود في البيئة')
  }

  return createClient(url, anonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

export function handleOptions(): Response {
  return new Response('ok', {
    status: 200,
    headers: corsHeaders,
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
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Authorization header مفقود')
  }

  const token = authHeader.replace('Bearer ', '').trim()

  const { data: serviceData, error: serviceError } = await supabase.auth.getUser(token)
  if (serviceData?.user && !serviceError) {
    return { id: serviceData.user.id, email: serviceData.user.email ?? '' }
  }

  console.error('requireUser service-role getUser failed:', serviceError)

  try {
    const requestClient = getRequestAuthClient(req)
    const { data: requestData, error: requestError } = await requestClient.auth.getUser()

    if (requestData?.user && !requestError) {
      return { id: requestData.user.id, email: requestData.user.email ?? '' }
    }

    console.error('requireUser request-auth getUser failed:', requestError)
  } catch (fallbackError) {
    console.error('requireUser fallback client failed:', fallbackError)
  }

  throw new AuthError('تعذر التحقق من جلسة المستخدم الحالية')
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

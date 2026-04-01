// app/(auth)/auth/callback/route.ts
//
// يُستخدم في:
//   1. إعادة تعيين كلمة المرور — Supabase يُرسل رابطًا يحتوي code
//   2. تأكيد البريد الإلكتروني — إذا كانت الـ confirmations مفعّلة في الـ production
//
// الـ PKCE flow:
//   المستخدم يضغط الرابط → يصل هنا مع ?code=xxx&next=/auth/reset-password
//   نستبدل الـ code بـ session → نُعيد التوجيه إلى next

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies }                                  from 'next/headers'
import { NextResponse, type NextRequest }           from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }) } catch { /* ignored */ }
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }) } catch { /* ignored */ }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // رابط منتهي الصلاحية أو غير صالح → صفحة تسجيل الدخول مع رسالة خطأ
  return NextResponse.redirect(`${origin}/auth/login?error=invalid_link`)
}

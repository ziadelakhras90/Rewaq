// ─────────────────────────────────────────────────────────────────────────────
// middleware.ts
// حماية المسارات بناءً على الدور
// يعمل على الـ Edge Runtime — لا imports من Node.js هنا
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest }          from 'next/server'

export async function middleware(req: NextRequest) {
  const res  = NextResponse.next()
  const path = req.nextUrl.pathname

  // ── إنشاء Supabase client للـ middleware ──────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options } as any)
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options } as any)
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── المسارات التي تتطلب تسجيل دخول فقط ──────────────────────────────────
  const authRequired = [
    '/account',
    '/checkout',
    '/cart',
    '/seller',
  ]

  const needsAuth = authRequired.some((p) => path.startsWith(p))
  if (!user && needsAuth) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  // ── المسارات التي تتطلب دور seller ───────────────────────────────────────
  const sellerDashboardPaths = [
    '/seller',
    '/seller/products',
    '/seller/orders',
    '/seller/settings',
  ]

  const isSellerProtected = sellerDashboardPaths.some((p) => path === p || path.startsWith(`${p}/`))
  const isSellerStatusPage = path === '/seller/status'

  if (user && isSellerProtected && !isSellerStatusPage) {
    const { data: sellerRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'seller')
      .maybeSingle()

    if (!sellerRole) {
      // مسجّل لكن ليس بائعًا → صفحة الحالة تقرر هل يقدّم أم ينتظر
      return NextResponse.redirect(new URL('/seller/status', req.url))
    }
  }

  // become-seller: يتطلب تسجيل دخول
  if (!user && path === '/become-seller') {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', '/become-seller')
    return NextResponse.redirect(loginUrl)
  }

  // ── المسارات التي تتطلب دور admin ─────────────────────────────────────────
  if (user && path.startsWith('/admin')) {
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!adminRole) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (!user && path.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // ── إعادة توجيه المسجّل من صفحات Auth ────────────────────────────────────
  const authPages = ['/auth/login', '/auth/signup']
  if (user && authPages.includes(path)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

// المسارات التي يعمل عليها الـ middleware
export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/cart',
    '/seller/:path*',
    '/become-seller',
    '/admin/:path*',
    '/auth/login',
    '/auth/signup',
  ],
}

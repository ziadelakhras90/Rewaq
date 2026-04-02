import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

function normalizeNext(next: string | null, fallback: string) {
  if (!next || !next.startsWith('/')) return fallback
  return next
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const { searchParams, origin } = url

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const defaultNext = type === 'recovery' ? '/auth/reset-password' : '/auth/login?confirmed=1'
  const next = normalizeNext(searchParams.get('next'), defaultNext)

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
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // ignored in route handler edge cases
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // ignored in route handler edge cases
          }
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  if (tokenHash && type) {
    const verifyType = type === 'signup' ? 'signup' : type === 'recovery' ? 'recovery' : null

    if (verifyType) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: verifyType,
      })

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  const invalidTarget = type === 'recovery'
    ? '/auth/login?error=invalid_reset_link'
    : '/auth/login?error=invalid_confirmation_link'

  return NextResponse.redirect(`${origin}${invalidTarget}`)
}

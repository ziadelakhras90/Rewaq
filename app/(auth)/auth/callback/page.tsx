'use client'
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type SupportedOtpType = 'signup' | 'recovery' | 'invite' | 'email' | 'email_change' | 'magiclink'

function normalizeNext(next: string | null, fallback: string) {
  if (!next || !next.startsWith('/')) return fallback
  return next
}

function getSupportedOtpType(type: string | null): SupportedOtpType | null {
  switch ((type ?? '').toLowerCase()) {
    case 'signup':
      return 'signup'
    case 'recovery':
      return 'recovery'
    case 'invite':
      return 'invite'
    case 'email':
      return 'email'
    case 'email_change':
      return 'email_change'
    case 'magiclink':
      return 'magiclink'
    default:
      return null
  }
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    async function consumeAuthLink() {
      const currentUrl = new URL(window.location.href)
      const searchParams = currentUrl.searchParams
      const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ''))

      const nextFromSearch = searchParams.get('next')
      const queryType = searchParams.get('type')
      const hashType = hashParams.get('type')
      const rawType = (queryType ?? hashType ?? '').toLowerCase()
      const looksLikeRecovery = rawType === 'recovery' || nextFromSearch === '/auth/reset-password'

      const defaultNext = looksLikeRecovery
        ? '/auth/reset-password'
        : '/auth/login?confirmed=1'
      const next = normalizeNext(nextFromSearch, defaultNext)

      let authError: Error | null = null

      const code = searchParams.get('code') ?? hashParams.get('code')
      const tokenHash = searchParams.get('token_hash') ?? hashParams.get('token_hash')
      const accessToken = hashParams.get('access_token') ?? searchParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token') ?? searchParams.get('refresh_token')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        authError = error
      } else if (tokenHash) {
        const otpType = getSupportedOtpType(rawType)

        if (!otpType) {
          authError = new Error('unsupported_auth_type')
        } else {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          })
          authError = error
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        authError = error
      } else {
        authError = new Error('missing_auth_params')
      }

      if (!isMounted) return

      if (authError) {
        const invalidTarget = looksLikeRecovery
          ? '/auth/login?error=invalid_reset_link'
          : '/auth/login?error=invalid_confirmation_link'

        router.replace(invalidTarget)
        return
      }

      if (looksLikeRecovery) {
        window.history.replaceState({}, document.title, next)
        router.replace(next)
        return
      }

      await supabase.auth.signOut()
      window.history.replaceState({}, document.title, next)
      router.replace(next)
    }

    void consumeAuthLink()

    return () => {
      isMounted = false
    }
  }, [router, supabase])

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white px-6 py-10 shadow-sm text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <svg className="h-7 w-7 animate-spin text-stone-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div>
          <h1 className="text-base font-bold text-stone-900">جاري التحقق من الرابط…</h1>
          <p className="mt-2 text-sm text-stone-500">
            انتظر لحظة بينما نكمل عملية التحقق وننقلك إلى الصفحة المناسبة.
          </p>
        </div>

        <Link href="/auth/login" className="text-sm font-medium text-amber-600 hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    </div>
  )
}

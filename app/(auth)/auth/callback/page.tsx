'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAppUrl } from '@/lib/utils/app-url'

type Mode = 'loading' | 'error'

function normalizeNext(next: string | null, fallback: string) {
  if (!next || !next.startsWith('/')) return fallback
  return next
}

function parseHashParams(hash: string) {
  const value = hash.startsWith('#') ? hash.slice(1) : hash
  return new URLSearchParams(value)
}

function getFriendlyErrorMessage(params: {
  next: string
  type: string | null
  errorMessage: string | null
}) {
  const isRecovery = params.type === 'recovery' || params.next === '/auth/reset-password'

  if (!isRecovery) {
    return 'رابط تأكيد البريد الإلكتروني غير صالح أو منتهي الصلاحية. يرجى إعادة إرسال رابط التأكيد.'
  }

  if (params.errorMessage?.toLowerCase().includes('code verifier')) {
    return 'تم فتح رابط إعادة التعيين في متصفح مختلف عن الذي طُلب منه الرابط. افتح الرابط من نفس الجهاز والمتصفح أو حدّث قالب Supabase ليستخدم token_hash بدلاً من code.'
  }

  return 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.'
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [mode, setMode] = useState<Mode>('loading')
  const [errorMessage, setErrorMessage] = useState('جاري إتمام العملية…')
  const [currentType, setCurrentType] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const url = new URL(window.location.href)
      const searchParams = url.searchParams
      const hashParams = parseHashParams(url.hash)

      const code = searchParams.get('code') ?? hashParams.get('code')
      const tokenHash = searchParams.get('token_hash') ?? hashParams.get('token_hash')
      const type = searchParams.get('type') ?? hashParams.get('type')
      const accessToken = searchParams.get('access_token') ?? hashParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token') ?? hashParams.get('refresh_token')

      const defaultNext = type === 'recovery' ? '/auth/reset-password' : '/auth/login?confirmed=1'
      const next = normalizeNext(searchParams.get('next') ?? hashParams.get('next'), defaultNext)
      setCurrentType(type)

      try {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error

          if (type !== 'recovery' && typeof window !== 'undefined') {
            window.localStorage.removeItem('rewq-pending-signup-email')
          }

          window.history.replaceState({}, '', next)
          router.replace(next)
          return
        }

        if (tokenHash && type) {
          const verifyType = type === 'email' ? 'email' : type === 'signup' ? 'signup' : type === 'recovery' ? 'recovery' : null
          if (!verifyType) throw new Error('UNSUPPORTED_OTP_TYPE')

          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: verifyType,
          })
          if (error) throw error

          if (verifyType !== 'recovery' && typeof window !== 'undefined') {
            window.localStorage.removeItem('rewq-pending-signup-email')
          }

          window.history.replaceState({}, '', next)
          router.replace(next)
          return
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error

          if (type !== 'recovery' && typeof window !== 'undefined') {
            window.localStorage.removeItem('rewq-pending-signup-email')
          }

          window.history.replaceState({}, '', next)
          router.replace(next)
          return
        }

        throw new Error('MISSING_AUTH_PARAMS')
      } catch (error) {
        if (cancelled) return

        const normalizedError = error instanceof Error ? error.message : null
        setErrorMessage(
          getFriendlyErrorMessage({
            next,
            type,
            errorMessage: normalizedError,
          })
        )
        setMode('error')
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [router, supabase])

  async function handleResendConfirmation() {
    const pendingEmail = typeof window !== 'undefined'
      ? window.localStorage.getItem('rewq-pending-signup-email')
      : null

    setResendMessage(null)

    if (!pendingEmail) {
      setResendMessage('تعذر تحديد البريد الإلكتروني لهذا الحساب. ارجع إلى صفحة إنشاء الحساب وحاول مرة أخرى.')
      return
    }

    setResending(true)
    try {
      const origin = getAppUrl()
      const callbackUrl = new URL('/auth/callback', origin)
      callbackUrl.searchParams.set('next', '/auth/login?confirmed=1')

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        setResendMessage(error.message)
        return
      }

      setResendMessage('أعدنا إرسال رابط التأكيد. تحقق من بريدك الإلكتروني.')
    } catch {
      setResendMessage('تعذر إعادة إرسال الرابط الآن. حاول مرة أخرى بعد قليل.')
    } finally {
      setResending(false)
    }
  }

  if (mode === 'loading') {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white px-6 py-10 shadow-sm text-center space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-500" />
          <h1 className="text-base font-bold text-stone-900">جاري إتمام العملية…</h1>
          <p className="text-sm text-stone-500">يرجى الانتظار لحظة واحدة.</p>
        </div>
      </div>
    )
  }

  const isRecovery = currentType === 'recovery'

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white px-6 py-10 shadow-sm text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <svg className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-stone-900">تعذر إتمام العملية</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">{errorMessage}</p>
          {isRecovery ? (
            <p className="mt-3 text-xs leading-6 text-stone-400">
              لحل دائم لمشكلة إعادة التعيين، استخدم في Supabase Reset Password Template رابطًا يعتمد على{' '}
              <span dir="ltr" className="font-medium text-stone-500">token_hash</span>{' '}
              بدلًا من{' '}
              <span dir="ltr" className="font-medium text-stone-500">code</span>.
            </p>
          ) : (
            <p className="mt-3 text-xs leading-6 text-stone-400">
              إذا عدّلت قالب تأكيد التسجيل في Supabase، فتأكد أن الرابط يستخدم{' '}
              <span dir="ltr" className="font-medium text-stone-500">token_hash</span>{' '}
              مع{' '}
              <span dir="ltr" className="font-medium text-stone-500">type=email</span>.
            </p>
          )}
        </div>

        {resendMessage && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            {resendMessage}
          </div>
        )}

        <div className="space-y-2">
          {isRecovery ? (
            <>
              <Link href="/auth/forgot-password" className="block text-sm font-medium text-amber-600 hover:underline">
                طلب رابط إعادة تعيين جديد
              </Link>
              <Link href="/auth/login" className="block text-sm font-medium text-stone-600 hover:underline">
                العودة إلى تسجيل الدخول
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="w-full rounded-xl border border-stone-200 bg-white py-3 text-sm font-bold text-stone-700 hover:bg-stone-50 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resending ? 'جاري إعادة الإرسال…' : 'إعادة إرسال رابط التأكيد'}
              </button>
              <Link href="/auth/signup" className="block text-sm font-medium text-amber-600 hover:underline">
                العودة إلى إنشاء الحساب
              </Link>
              <Link href="/auth/login" className="block text-sm font-medium text-stone-600 hover:underline">
                العودة إلى تسجيل الدخول
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

// app/(auth)/auth/forgot-password/page.tsx

import { useState }      from 'react'
import Link              from 'next/link'
import { createClient }  from '@/lib/supabase/client'
import { AuthInput }     from '@/components/auth/auth-input'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) { setError('البريد الإلكتروني مطلوب'); return }

    setLoading(true)
    try {
      // redirectTo: يُوجَّه إلى الـ callback الذي يستبدل الـ code بـ session
      // ثم يُعيد التوجيه إلى /auth/reset-password
      const redirectTo =
        (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? '')
        + '/auth/callback?next=/auth/reset-password'

      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      )

      if (authError) {
        setError(authError.message)
        return
      }

      // Supabase لا يُفصح عن وجود الحساب من عدمه — نُظهر نفس الرسالة دائمًا
      setSent(true)
    } catch {
      setError('تعذّر الاتصال. تحقق من اتصالك وحاول مجددًا.')
    } finally {
      setLoading(false)
    }
  }

  // ── حالة الإرسال الناجح ────────────────────────────────────────────────────
  if (sent) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 shadow-sm text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">تحقق من بريدك الإلكتروني</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                إذا كان البريد{' '}
                <span className="font-medium text-stone-700">{email}</span>{' '}
                مسجّلًا لدينا، ستصل إليك رسالة تحتوي رابط إعادة تعيين كلمة المرور.
              </p>
              <p className="mt-2 text-xs text-stone-400">
                لم يصلك شيء؟ تحقق من مجلد البريد غير المرغوب فيه.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-block text-sm font-medium text-amber-600 hover:underline"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── النموذج ────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">

        {/* ── Brand ──────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-stone-900 hover:text-amber-600 transition">
            رِواق
          </Link>
          <h1 className="mt-3 text-xl font-bold text-stone-900">نسيت كلمة المرور؟</h1>
          <p className="mt-1 text-sm text-stone-500">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </p>
        </div>

        {/* ── Card ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <AuthInput
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="example@email.com"
              required
              autoComplete="email"
              dir="ltr"
            />

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                flex w-full items-center justify-center gap-2 rounded-xl
                bg-amber-500 py-3.5 text-sm font-bold text-white shadow-sm
                hover:bg-amber-600 active:scale-95 transition
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {loading && <Spinner />}
              {loading ? 'جاري الإرسال…' : 'إرسال رابط إعادة التعيين'}
            </button>

            <p className="text-center text-sm text-stone-500">
              <Link href="/auth/login" className="font-medium text-amber-600 hover:underline">
                العودة إلى تسجيل الدخول
              </Link>
            </p>

          </form>
        </div>

      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

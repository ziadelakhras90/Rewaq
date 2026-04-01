'use client'

// app/(auth)/auth/reset-password/page.tsx
//
// يصل هنا المستخدم بعد أن يضغط رابط إعادة تعيين كلمة المرور في الإيميل.
// الـ callback route (/auth/callback) يستبدل الـ code بـ session أولًا،
// ثم يُعيد التوجيه إلى هذه الصفحة.
// المستخدم في هذه اللحظة لديه recovery session نشطة.

import { useState }      from 'react'
import Link              from 'next/link'
import { useRouter }     from 'next/navigation'
import { createClient }  from '@/lib/supabase/client'
import { AuthInput }     from '@/components/auth/auth-input'

export default function ResetPasswordPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [password,    setPassword]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [success,     setSuccess]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8)      { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    if (password !== confirmPass)  { setError('كلمتا المرور غير متطابقتين'); return }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        if (
          updateError.message.includes('session') ||
          updateError.message.includes('expired') ||
          updateError.message.includes('Auth session missing')
        ) {
          setError('انتهت صلاحية الرابط. يرجى طلب رابط إعادة تعيين جديد.')
        } else {
          setError(updateError.message)
        }
        return
      }

      setSuccess(true)
    } catch {
      setError('تعذّر الاتصال. تحقق من اتصالك وحاول مجددًا.')
    } finally {
      setLoading(false)
    }
  }

  // ── حالة النجاح ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 shadow-sm text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">تم تحديث كلمة المرور</h2>
              <p className="mt-2 text-sm text-stone-500">
                يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
              </p>
            </div>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 transition"
            >
              تسجيل الدخول
            </button>
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
          <h1 className="mt-3 text-xl font-bold text-stone-900">تعيين كلمة مرور جديدة</h1>
          <p className="mt-1 text-sm text-stone-500">اختر كلمة مرور قوية لحسابك</p>
        </div>

        {/* ── Card ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <AuthInput
              label="كلمة المرور الجديدة"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              placeholder="8 أحرف على الأقل"
              required
              autoComplete="new-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-stone-400 hover:text-stone-600 transition"
                  tabIndex={-1}
                  aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              }
            />

            <AuthInput
              label="تأكيد كلمة المرور"
              name="confirm_password"
              type={showPass ? 'text' : 'password'}
              value={confirmPass}
              onChange={(e) => { setConfirmPass(e.target.value); setError(null) }}
              placeholder="أعد كتابة كلمة المرور"
              required
              autoComplete="new-password"
            />

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm text-rose-700">{error}</p>
                {error.includes('انتهت صلاحية') && (
                  <Link
                    href="/auth/forgot-password"
                    className="mt-1 block text-xs font-medium text-rose-600 hover:underline"
                  >
                    طلب رابط جديد ←
                  </Link>
                )}
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
              {loading ? 'جاري الحفظ…' : 'حفظ كلمة المرور الجديدة'}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function Eye() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOff() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 4.352-5.411M9.88 9.88a3 3 0 1 0 4.243 4.243M3 3l18 18" />
    </svg>
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

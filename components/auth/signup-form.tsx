'use client'

// components/auth/signup-form.tsx

import { useState }      from 'react'
import Link              from 'next/link'
import { useRouter }     from 'next/navigation'
import { createClient }  from '@/lib/supabase/client'
import { AuthInput }     from './auth-input'

interface SignupFormProps {
  redirectTo?: string
}

export function SignupForm({ redirectTo = '/' }: SignupFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [fullName,     setFullName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPass,  setConfirmPass]  = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // ── Validation ────────────────────────────────────────────────────────
    if (!fullName.trim())             { setError('الاسم الكامل مطلوب'); return }
    if (!email.trim())                { setError('البريد الإلكتروني مطلوب'); return }
    if (password.length < 8)          { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    if (password !== confirmPass)     { setError('كلمتا المرور غير متطابقتين'); return }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email:    email.trim().toLowerCase(),
        password,
        options: {
          data: {
            // يُقرأ من handle_new_user() trigger في migration 002
            full_name: fullName.trim(),
          },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          setError('هذا البريد الإلكتروني مسجّل بالفعل. يمكنك تسجيل الدخول أو طلب إعادة تعيين كلمة المرور.')
        } else {
          setError(authError.message)
        }
        return
      }

      // إذا رجع session → مستخدم مسجّل مباشرة (confirmations disabled)
      if (data.session) {
        router.push(redirectTo)
        router.refresh()
      } else {
        // Confirmations مفعّلة → أظهر رسالة التأكيد
        setSuccess(true)
      }
    } catch {
      setError('تعذّر الاتصال. تحقق من اتصالك وحاول مجددًا.')
    } finally {
      setLoading(false)
    }
  }

  // ── حالة النجاح مع طلب تأكيد الإيميل ─────────────────────────────────────
  if (success) {
    return (
      <div dir="rtl" className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-stone-900">تحقق من بريدك الإلكتروني</h2>
          <p className="mt-2 text-sm text-stone-500">
            أرسلنا رابط تأكيد إلى{' '}
            <span className="font-medium text-stone-700">{email}</span>.
            افتح الرابط لتفعيل حسابك والبدء بالتسوق.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="block text-sm font-medium text-amber-600 hover:underline"
        >
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-4" noValidate>

      <AuthInput
        label="الاسم الكامل"
        name="full_name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="أحمد محمد"
        required
        autoComplete="name"
      />

      <AuthInput
        label="البريد الإلكتروني"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@email.com"
        required
        autoComplete="email"
        dir="ltr"
      />

      <AuthInput
        label="كلمة المرور"
        name="password"
        type={showPass ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
        onChange={(e) => setConfirmPass(e.target.value)}
        placeholder="أعد كتابة كلمة المرور"
        required
        autoComplete="new-password"
      />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {/* Submit */}
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
        {loading ? 'جاري إنشاء الحساب…' : 'إنشاء حساب'}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-stone-500">
        لديك حساب بالفعل؟{' '}
        <Link href="/auth/login" className="font-medium text-amber-600 hover:underline">
          تسجيل الدخول
        </Link>
      </p>

    </form>
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

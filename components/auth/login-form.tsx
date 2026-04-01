'use client'

// components/auth/login-form.tsx

import { useState }      from 'react'
import Link              from 'next/link'
import { useRouter }     from 'next/navigation'
import { createClient }  from '@/lib/supabase/client'
import { AuthInput }     from './auth-input'

interface LoginFormProps {
  redirectTo?: string
  errorParam?: string   // ?error=invalid_link من الـ callback route
}

export function LoginForm({ redirectTo = '/', errorParam }: LoginFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(
    errorParam === 'invalid_link' ? 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى المحاولة مجددًا.' : null
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim())    { setError('البريد الإلكتروني مطلوب'); return }
    if (!password.trim()) { setError('كلمة المرور مطلوبة'); return }

    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('يرجى تأكيد بريدك الإلكتروني أولًا. تحقق من صندوق الوارد.')
        } else {
          setError(authError.message)
        }
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('تعذّر الاتصال. تحقق من اتصالك وحاول مجددًا.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-5" noValidate>

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
        placeholder="••••••••"
        required
        autoComplete="current-password"
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

      {/* Forgot password link */}
      <div className="flex justify-start">
        <Link
          href="/auth/forgot-password"
          className="text-xs text-amber-600 hover:underline"
        >
          نسيت كلمة المرور؟
        </Link>
      </div>

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
        {loading ? <Spinner /> : null}
        {loading ? 'جاري تسجيل الدخول…' : 'تسجيل الدخول'}
      </button>

      {/* Sign up link */}
      <p className="text-center text-sm text-stone-500">
        ليس لديك حساب؟{' '}
        <Link href="/auth/signup" className="font-medium text-amber-600 hover:underline">
          إنشاء حساب
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
           -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOff() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7
           a9.97 9.97 0 0 1 4.352-5.411M9.88 9.88a3 3 0 1 0 4.243 4.243
           M3 3l18 18" />
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

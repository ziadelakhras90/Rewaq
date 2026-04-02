export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'تسجيل الدخول — رِواق',
}

interface PageProps {
  searchParams: Promise<{
    redirect?: string
    error?: string
    confirmed?: string
  }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { redirect, error, confirmed } = await searchParams

  const redirectTo = redirect?.startsWith('/') ? redirect : '/'

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-stone-900 hover:text-amber-600 transition">
            رِواق
          </Link>
          <h1 className="mt-3 text-xl font-bold text-stone-900">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-stone-500">أهلًا بك مجددًا</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-8 shadow-sm">
          <LoginForm
            redirectTo={redirectTo}
            errorParam={error}
            confirmedParam={confirmed}
          />
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          بتسجيل دخولك، أنت توافق على{' '}
          <Link href="/terms" className="underline hover:text-stone-600">شروط الاستخدام</Link>
          {' '}و{' '}
          <Link href="/privacy" className="underline hover:text-stone-600">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  )
}

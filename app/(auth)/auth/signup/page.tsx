// app/(auth)/auth/signup/page.tsx
// Server Component

import type { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'إنشاء حساب — رِواق',
}

interface PageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SignupPage({ searchParams }: PageProps) {
  const { redirect } = await searchParams
  const rawRedirect = redirect
  const redirectTo = rawRedirect?.startsWith('/') ? rawRedirect : '/'

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* ── Brand ────────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-stone-900 hover:text-amber-600 transition">
            رِواق
          </Link>
          <h1 className="mt-3 text-xl font-bold text-stone-900">إنشاء حساب جديد</h1>
          <p className="mt-1 text-sm text-stone-500">انضم إلى رِواق وابدأ التسوق</p>
        </div>

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-8 shadow-sm">
          <SignupForm redirectTo={redirectTo} />
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <p className="mt-6 text-center text-xs text-stone-400">
          بإنشاء حساب، أنت توافق على{' '}
          <Link href="/terms" className="underline hover:text-stone-600">شروط الاستخدام</Link>
          {' '}و{' '}
          <Link href="/privacy" className="underline hover:text-stone-600">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  )
}

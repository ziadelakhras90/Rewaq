'use client'

// components/layout/main-navigation.tsx
// روابط التنقل الرئيسية — Client Component للتحقق من حالة الـ auth

import Link      from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth }     from '@/hooks/useAuth'
import { useCart }     from '@/hooks/useCart'
import { createClient } from '@/lib/supabase/client'
import { useRouter }    from 'next/navigation'

// ─────────────────────────────────────────────────────────────────────────────
// Desktop nav — يُستخدم في SiteHeader
// ─────────────────────────────────────────────────────────────────────────────

export function DesktopNav() {
  const { user, isSeller, isAdmin, loading } = useAuth()
  const { itemCount } = useCart(user?.id ?? null)
  const supabase = createClient()
  const router   = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">

      {/* ── Nav links ───────────────────────────────────────────────── */}
      <NavLink href="/">الرئيسية</NavLink>
      <NavLink href="/marketplace">المتجر</NavLink>
      {!isSeller && <NavLink href="/become-seller">كن بائعًا</NavLink>}
      {isSeller  && <NavLink href="/seller">لوحة البائع</NavLink>}
      {isAdmin   && <NavLink href="/admin">الإدارة</NavLink>}

      <div className="mx-2 h-5 w-px bg-stone-200" />

      {/* ── Cart ────────────────────────────────────────────────────── */}
      <Link
        href="/cart"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 transition"
        aria-label="السلة"
      >
        <CartIcon />
        {itemCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </Link>

      {/* ── Auth ────────────────────────────────────────────────────── */}
      {!loading && (
        <>
          {user ? (
            <div className="flex items-center gap-1">
              <NavLink href="/account/orders">طلباتي</NavLink>
              <button
                onClick={handleSignOut}
                className="rounded-xl px-3 py-2 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                خروج
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 transition"
              >
                دخول
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile nav drawer — يُستخدم في SiteHeader
// ─────────────────────────────────────────────────────────────────────────────

export function MobileNav({ onClose }: { onClose: () => void }) {
  const { user, isSeller, isAdmin, loading } = useAuth()
  const { itemCount } = useCart(user?.id ?? null)
  const supabase = createClient()
  const router   = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    onClose()
    router.push('/')
    router.refresh()
  }

  return (
    <nav dir="rtl" className="flex flex-col divide-y divide-stone-100">

      <MobileNavLink href="/"             onClick={onClose}>الرئيسية</MobileNavLink>
      <MobileNavLink href="/marketplace"  onClick={onClose}>المتجر</MobileNavLink>
      {!isSeller && <MobileNavLink href="/become-seller" onClick={onClose}>كن بائعًا</MobileNavLink>}
      {isSeller  && <MobileNavLink href="/seller"        onClick={onClose}>لوحة البائع</MobileNavLink>}
      {isAdmin   && <MobileNavLink href="/admin"         onClick={onClose}>الإدارة</MobileNavLink>}

      <MobileNavLink href="/cart" onClick={onClose}>
        <span className="flex items-center gap-2">
          السلة
          {itemCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </span>
      </MobileNavLink>

      {!loading && (
        <>
          {user ? (
            <>
              <MobileNavLink href="/account/orders" onClick={onClose}>طلباتي</MobileNavLink>
              <button
                onClick={handleSignOut}
                className="px-5 py-4 text-start text-sm text-rose-500 hover:bg-rose-50 transition"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <MobileNavLink href="/auth/login"  onClick={onClose}>تسجيل الدخول</MobileNavLink>
              <MobileNavLink href="/auth/signup" onClick={onClose}>إنشاء حساب</MobileNavLink>
            </>
          )}
        </>
      )}
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path    = usePathname()
  const isActive = path === href || (href !== '/' && path.startsWith(href))

  return (
    <Link
      href={href}
      className={`
        rounded-xl px-3 py-2 text-sm font-medium transition
        ${isActive
          ? 'bg-amber-50 text-amber-700'
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
        }
      `}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({
  href, children, onClick,
}: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-5 py-4 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
    >
      {children}
    </Link>
  )
}

function CartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17
           m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
    </svg>
  )
}

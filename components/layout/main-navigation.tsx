'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useNotifications } from '@/hooks/useNotifications'
import { createClient } from '@/lib/supabase/client'

export function DesktopNav() {
  const { user, isSeller, isAdmin, loading } = useAuth()
  const { itemCount } = useCart(user?.id ?? null)
  const supabase = createClient()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition"
        aria-label="الرئيسية"
      >
        <HomeIcon />
      </Link>

      <NavLink href="/marketplace">المتجر</NavLink>
      <NavLink href="/stores">المتاجر</NavLink>
      {!loading && !isSeller && <NavLink href="/become-seller">كن بائعًا</NavLink>}
      {!loading && isSeller && <NavLink href="/seller/orders">لوحة الطلبات</NavLink>}
      {!loading && isAdmin && <NavLink href="/admin">الإدارة</NavLink>}

      <div className="mx-2 h-5 w-px bg-stone-200" />

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

      {!loading && user && <NotificationsMenu user={user} />}

      {!loading && (
        user ? (
          <UserMenu user={user} isSeller={isSeller} isAdmin={isAdmin} onSignOut={handleSignOut} />
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="rounded-xl px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 transition">دخول</Link>
            <Link href="/auth/signup" className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition">إنشاء حساب</Link>
          </div>
        )
      )}
    </div>
  )
}

function NotificationsMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { items, unreadCount, loading, markAllAsRead, markAsRead } = useNotifications(user.id, { loadItems: open })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 transition"
        aria-label="الإشعارات"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-11 z-50 w-80 rounded-2xl border border-stone-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-stone-800">الإشعارات</p>
              <p className="text-xs text-stone-400">غير المقروء: {unreadCount}</p>
            </div>
            <button onClick={markAllAsRead} className="text-xs font-medium text-amber-700 hover:text-amber-800">
              تعليم الكل كمقروء
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? (
              <p className="p-3 text-sm text-stone-400">جارٍ تحميل الإشعارات…</p>
            ) : items.length === 0 ? (
              <p className="p-3 text-sm text-stone-400">لا توجد إشعارات بعد.</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.link || '#'}
                  onClick={() => {
                    void markAsRead(item.id)
                    setOpen(false)
                  }}
                  className={`block rounded-xl px-3 py-3 transition hover:bg-stone-50 ${item.is_read ? 'opacity-75' : 'bg-amber-50/60'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{item.title}</p>
                      {item.body && <p className="mt-1 text-xs leading-6 text-stone-500">{item.body}</p>}
                    </div>
                    {!item.is_read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function UserMenu({ user, isSeller, isAdmin, onSignOut }: { user: User; isSeller: boolean; isAdmin: boolean; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayName = (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'المستخدم'
  const initials = displayName.slice(0, 2)
  const accountType = isAdmin ? 'مدير المنصة' : isSeller ? 'بائع' : 'مشتري'

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex h-9 items-center gap-2 rounded-xl border border-stone-200 bg-white px-2.5 hover:border-stone-300 hover:bg-stone-50 transition">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">{initials}</div>
        <span className="max-w-[80px] truncate text-xs font-medium text-stone-700">{displayName}</span>
        <svg className={`h-3.5 w-3.5 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 top-11 z-50 w-64 rounded-2xl border border-stone-200 bg-white shadow-xl">
          <div className="border-b border-stone-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">{initials}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-800">{displayName}</p>
                <p className="truncate text-xs text-stone-400">{user.email}</p>
                <span className="mt-0.5 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{accountType}</span>
              </div>
            </div>
          </div>

          <nav className="space-y-0.5 p-1.5">
            <DropdownLink href="/account/orders" icon={<OrdersIcon />} onClick={() => setOpen(false)}>مشترياتي</DropdownLink>
            <DropdownLink href="/account/addresses" icon={<AddressIcon />} onClick={() => setOpen(false)}>عناوين التوصيل</DropdownLink>
            {isSeller && <DropdownLink href="/seller/settings" icon={<StoreIcon />} onClick={() => setOpen(false)}>متجري</DropdownLink>}
            {isSeller && <DropdownLink href="/seller/orders" icon={<DashboardIcon />} onClick={() => setOpen(false)}>لوحة الطلبات</DropdownLink>}
            {isAdmin && <DropdownLink href="/admin" icon={<AdminIcon />} onClick={() => setOpen(false)}>لوحة الإدارة</DropdownLink>}
          </nav>

          <div className="border-t border-stone-100 p-1.5">
            <button onClick={() => { setOpen(false); onSignOut() }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition">
              <SignOutIcon />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DropdownLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition">
      <span className="text-stone-400">{icon}</span>
      {children}
    </Link>
  )
}

export function MobileNav({ onClose }: { onClose: () => void }) {
  const { user, isSeller, isAdmin, loading } = useAuth()
  const { itemCount } = useCart(user?.id ?? null)
  const { unreadCount } = useNotifications(user?.id ?? null)
  const supabase = createClient()
  const router = useRouter()

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split('@')[0] ?? 'المستخدم'
  const accountType = isAdmin ? 'مدير المنصة' : isSeller ? 'بائع' : 'مشتري'

  async function handleSignOut() {
    await supabase.auth.signOut()
    onClose()
    router.push('/')
    router.refresh()
  }

  return (
    <nav dir="rtl" className="flex flex-col">
      {!loading && user && (
        <div className="border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">{displayName.slice(0, 2)}</div>
            <div>
              <p className="text-sm font-semibold text-stone-800">{displayName}</p>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{accountType}</span>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-stone-100">
        <MobileNavLink href="/" onClick={onClose}>الرئيسية</MobileNavLink>
        <MobileNavLink href="/marketplace" onClick={onClose}>المتجر</MobileNavLink>
        <MobileNavLink href="/stores" onClick={onClose}>المتاجر</MobileNavLink>

        {!loading && !isSeller && !isAdmin && <MobileNavLink href="/become-seller" onClick={onClose}>كن بائعًا</MobileNavLink>}
        {!loading && isSeller && <MobileNavLink href="/seller/orders" onClick={onClose}>لوحة الطلبات</MobileNavLink>}
        {!loading && isAdmin && <MobileNavLink href="/admin" onClick={onClose}>الإدارة</MobileNavLink>}

        <MobileNavLink href="/cart" onClick={onClose}>
          <span className="flex items-center gap-2">السلة{itemCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{itemCount > 9 ? '9+' : itemCount}</span>}</span>
        </MobileNavLink>

        {!loading && user && (
          <>
            <MobileNavLink href="/account/orders" onClick={onClose}>مشترياتي</MobileNavLink>
            <MobileNavLink href="/account/addresses" onClick={onClose}>عناوين التوصيل</MobileNavLink>
            {isSeller && <MobileNavLink href="/seller/settings" onClick={onClose}>متجري</MobileNavLink>}
            {isSeller && <MobileNavLink href="/seller/orders" onClick={onClose}>لوحة الطلبات</MobileNavLink>}
            <MobileNavLink href={user ? '/account/orders' : '/auth/login'} onClick={onClose}>
              <span className="flex items-center gap-2">الإشعارات{unreadCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</span>
            </MobileNavLink>
          </>
        )}

        {!loading && !user && (
          <>
            <MobileNavLink href="/auth/login" onClick={onClose}>تسجيل الدخول</MobileNavLink>
            <MobileNavLink href="/auth/signup" onClick={onClose}>إنشاء حساب</MobileNavLink>
          </>
        )}

        {!loading && user && (
          <button onClick={handleSignOut} className="block w-full px-5 py-4 text-start text-sm text-rose-500 hover:bg-rose-50 transition">تسجيل الخروج</button>
        )}
      </div>
    </nav>
  )
}

export function BackButton({ href, label = 'رجوع' }: { href?: string; label?: string }) {
  const router = useRouter()

  function handleBack() {
    if (typeof window === 'undefined') {
      if (href) router.push(href)
      return
    }

    const fallbackHref = href ?? '/'
    const hasHistory = window.history.length > 1
    const referrer = document.referrer

    if (hasHistory && (!referrer || new URL(referrer).origin === window.location.origin)) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <button type="button" onClick={handleBack} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      {label}
    </button>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname()
  const isActive = path === href || (href !== '/' && path.startsWith(href))
  return <Link href={href} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}>{children}</Link>
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return <Link href={href} onClick={onClick} className="block px-5 py-4 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">{children}</Link>
}

function HomeIcon() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> }
function CartIcon() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg> }
function BellIcon() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> }
function OrdersIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> }
function AddressIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
function StoreIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16l-1 12H5L4 7zm2-3h12l1 3H5l1-3z" /></svg> }
function DashboardIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z" /></svg> }
function AdminIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> }
function SignOutIcon() { return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> }

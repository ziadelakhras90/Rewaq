// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase/server.ts
//
// Server client — يُستخدم في:
//   - Server Components
//   - Route Handlers (app/api/*)
//   - Server Actions
//   - Middleware
//
// يستخدم cookies لنقل الـ session بين الـ server و client.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // يحدث عند استدعاء set من Server Component (read-only context)
            // آمن للتجاهل — الـ middleware يتولى تحديث الـ cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // نفس سبب set أعلاه
          }
        },
      },
    }
  )
}

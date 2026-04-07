// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase/client.ts
//
// Browser client — يُستخدم داخل 'use client' components فقط.
// أثناء prerender / build على السيرفر نرجّع stub آمن بدل ما نكسر الـ build.
// ─────────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

function createServerBuildStub() {
  return new Proxy(
    {},
    {
      get() {
        return createServerBuildStub()
      },
      apply() {
        throw new Error(
          'Supabase browser client was used during server build/prerender. Use it only in the browser.'
        )
      },
    }
  ) as ReturnType<typeof createBrowserClient<Database>>
}

export function createClient() {
  if (typeof window === 'undefined') {
    return createServerBuildStub()
  }

  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in the browser environment.'
    )
  }

  client = createBrowserClient<Database>(url, anonKey)

  return client
}

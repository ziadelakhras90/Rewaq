// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase/service.ts
// Service Role client — يتجاوز RLS بالكامل.
//
// ⚠️  يُستخدم حصرًا في Server Components + Server Actions
// ⚠️  لا تستخدمه في 'use client' components أو Edge Functions
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY غير موجود في البيئة.'
    )
  }

  // نُنشئ client جديد في كل استدعاء لتفادي Singleton stale state في Serverless
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}

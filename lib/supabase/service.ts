// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase/service.ts
//
// Service Role client — يتجاوز RLS بالكامل.
//
// ⚠️  يُستخدم حصرًا في:
//     - Server Actions التي تحتاج عمليات admin
//     - Route Handlers الداخلية (webhooks مثلًا)
//
// ⚠️  لا تستخدمه أبدًا في:
//     - 'use client' components
//     - أي كود يصل إليه المستخدم مباشرة
//
// ملاحظة: Edge Functions تستخدم helpers.ts الخاص بها — لا هذا الملف.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Singleton — لا نُنشئ client جديد مع كل استدعاء
let serviceClient: ReturnType<typeof createClient<Database>> | null = null

export function createServiceClient() {
  if (serviceClient) return serviceClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY غير موجود. ' +
      'تأكد من وجودهما في .env.local'
    )
  }

  serviceClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })

  return serviceClient
}

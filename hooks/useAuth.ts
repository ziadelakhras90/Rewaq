// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAuth.ts
// Auth hook مع دعم multi-role (customer + seller معًا)
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import type { User }           from '@supabase/supabase-js'
import { createClient }        from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthState {
  user:       User | null
  roles:      string[]
  isAdmin:    boolean
  isSeller:   boolean
  isCustomer: boolean
  loading:    boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthState {
  const supabase = createClient() as any

  const [state, setState] = useState<AuthState>({
    user:       null,
    roles:      [],
    isAdmin:    false,
    isSeller:   false,
    isCustomer: false,
    loading:    true,
  })

  async function loadUserAndRoles(user: User | null) {
    if (!user) {
      setState({
        user:       null,
        roles:      [],
        isAdmin:    false,
        isSeller:   false,
        isCustomer: false,
        loading:    false,
      })
      return
    }

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const safeRolesData = Array.isArray(rolesData) ? (rolesData as any[]) : []
    const roles = safeRolesData.map((r) => r.role)

    setState({
      user,
      roles,
      isAdmin:    roles.includes('admin'),
      isSeller:   roles.includes('seller'),
      isCustomer: roles.includes('customer'),
      loading:    false,
    })
  }

  useEffect(() => {
    // الحالة الأولية
    supabase.auth.getUser().then((result: any) => {
      const user = result?.data?.user ?? null
      loadUserAndRoles(user)
    })

    // الاستماع لتغييرات الـ session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        loadUserAndRoles(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return state
}

'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface AuthState {
  user: User | null
  roles: string[]
  isAdmin: boolean
  isSeller: boolean
  isCustomer: boolean
  loading: boolean
}

const supabase = createClient() as any

const initialState: AuthState = {
  user: null,
  roles: [],
  isAdmin: false,
  isSeller: false,
  isCustomer: false,
  loading: true,
}

let authState: AuthState = initialState
let initialized = false
let authSubscription: { unsubscribe: () => void } | null = null
const listeners = new Set<(state: AuthState) => void>()

function emitAuthState() {
  listeners.forEach((listener) => listener(authState))
}

function setAuthState(next: AuthState) {
  authState = next
  emitAuthState()
}

async function loadUserRoles(user: User | null) {
  if (!user) {
    setAuthState({ ...initialState, loading: false })
    return
  }

  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const safeRolesData = Array.isArray(rolesData) ? (rolesData as Array<{ role: string }>) : []
  const roles = safeRolesData.map((item) => item.role)

  setAuthState({
    user,
    roles,
    isAdmin: roles.includes('admin'),
    isSeller: roles.includes('seller'),
    isCustomer: roles.includes('customer'),
    loading: false,
  })
}

async function bootstrapAuth() {
  if (initialized) return
  initialized = true

  try {
    const { data } = await supabase.auth.getSession()
    await loadUserRoles(data.session?.user ?? null)
  } catch {
    setAuthState({ ...initialState, loading: false })
  }

  const { data } = supabase.auth.onAuthStateChange((_event: string, session: { user?: User | null } | null) => {
    void loadUserRoles(session?.user ?? null)
  })

  authSubscription = data.subscription
}

function subscribe(listener: (state: AuthState) => void) {
  listeners.add(listener)
  listener(authState)

  if (!initialized) {
    void bootstrapAuth()
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && authSubscription) {
      authSubscription.unsubscribe()
      authSubscription = null
      initialized = false
    }
  }
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(authState)

  useEffect(() => subscribe(setState), [])

  return state
}

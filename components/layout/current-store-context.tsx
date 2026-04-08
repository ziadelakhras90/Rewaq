'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

export interface HeaderStoreLink {
  id?: string
  name: string
  slug?: string | null
}

interface CurrentStoreEntry {
  pathname: string
  store: HeaderStoreLink | null
}

interface CurrentStoreContextValue {
  entry: CurrentStoreEntry
  setCurrentStoreForPath: (pathname: string, store: HeaderStoreLink | null) => void
  clearCurrentStoreForPath: (pathname: string) => void
}

const CurrentStoreContext = createContext<CurrentStoreContextValue | null>(null)

export function CurrentStoreProvider({ children }: { children: React.ReactNode }) {
  const [entry, setEntry] = useState<CurrentStoreEntry>({ pathname: '', store: null })

  const setCurrentStoreForPath = useCallback((pathname: string, store: HeaderStoreLink | null) => {
    setEntry({ pathname, store })
  }, [])

  const clearCurrentStoreForPath = useCallback((pathname: string) => {
    setEntry((current) => (current.pathname === pathname ? { pathname: '', store: null } : current))
  }, [])

  const value = useMemo(() => ({ entry, setCurrentStoreForPath, clearCurrentStoreForPath }), [entry, setCurrentStoreForPath, clearCurrentStoreForPath])

  return <CurrentStoreContext.Provider value={value}>{children}</CurrentStoreContext.Provider>
}

export function useCurrentStore() {
  const ctx = useContext(CurrentStoreContext)
  const pathname = usePathname()

  if (!ctx) {
    throw new Error('useCurrentStore must be used within CurrentStoreProvider')
  }

  const currentStore = ctx.entry.pathname === pathname ? ctx.entry.store : null

  return {
    currentStore,
    pathname,
    setCurrentStoreForPath: ctx.setCurrentStoreForPath,
    clearCurrentStoreForPath: ctx.clearCurrentStoreForPath,
  }
}

'use client'

import { useEffect } from 'react'
import type { HeaderStoreLink } from './current-store-context'
import { useCurrentStore } from './current-store-context'

export function CurrentStoreBridge({ store }: { store: HeaderStoreLink | null }) {
  const { pathname, setCurrentStoreForPath, clearCurrentStoreForPath } = useCurrentStore()

  useEffect(() => {
    setCurrentStoreForPath(pathname, store)
    return () => clearCurrentStoreForPath(pathname)
  }, [pathname, store?.id, store?.name, store?.slug, setCurrentStoreForPath, clearCurrentStoreForPath])

  return null
}

export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getActiveStores } from '@/services/catalog.service'
import { StoresDirectory } from '@/components/stores/stores-directory'

export const metadata: Metadata = {
  title: 'تصفح المتاجر — Rewq',
  description: 'ابحث عن متجرك المفضل داخل Rewq وتسوّق من منتجاته مباشرة.',
}

export default async function StoresPage() {
  const supabase = await createClient()
  const stores = await getActiveStores(supabase)

  return <StoresDirectory stores={stores} />
}

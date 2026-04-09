import { Suspense } from 'react'
import CartPageClient from './cart-page-client'

export const dynamic = 'force-dynamic'

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartPageClient />
    </Suspense>
  )
}

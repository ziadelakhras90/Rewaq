import nextDynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const CartPageClient = nextDynamic(() => import('./cart-page-client'), {
  ssr: false,
})

export default function CartPage() {
  return <CartPageClient />
}

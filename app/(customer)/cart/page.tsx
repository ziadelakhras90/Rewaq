import dynamic from 'next/dynamic'

export const dynamic = 'force-dynamic'

const CartPageClient = dynamic(() => import('./cart-page-client'), {
  ssr: false,
})

export default function CartPage() {
  return <CartPageClient />
}

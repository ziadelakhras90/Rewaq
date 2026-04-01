import type { OrderStatus } from '@/types/api.types'
import { getOrderStatusLabel } from '@/lib/utils/arabic'

interface OrderStatusBadgeProps {
  status: OrderStatus | string
}

const STATUS_TONES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
  refunded: 'bg-stone-100 text-stone-600',
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const classes = STATUS_TONES[status] ?? 'bg-stone-100 text-stone-600'
  const label = getOrderStatusLabel(status)

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}

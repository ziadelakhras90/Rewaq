// ─────────────────────────────────────────────────────────────────────────────
// types/api.types.ts
// Request / Response shapes للـ Edge Functions
// ─────────────────────────────────────────────────────────────────────────────

// ── create-order ─────────────────────────────────────────────────────────────

export interface CreateOrderRequest {
  cartId:        string
  addressId:     string
  paymentMethod: PaymentMethod
  notes?:        string
}

export interface CreateOrderResponse {
  orderId:     string
  orderNumber: string
}

// ── approve-seller ────────────────────────────────────────────────────────────

export interface ApproveSellerRequest {
  applicationId: string
  adminNotes?:   string
}

export interface ApproveSellerResponse {
  success: boolean
}

// ── reject-seller ─────────────────────────────────────────────────────────────

export interface RejectSellerRequest {
  applicationId: string
  adminNotes:    string   // مطلوب دائمًا عند الرفض
}

export interface RejectSellerResponse {
  success: boolean
}

// ── update-order-status ───────────────────────────────────────────────────────

export interface UpdateOrderStatusRequest {
  orderId:   string
  newStatus: OrderStatus
  notes?:    string
}

export interface UpdateOrderStatusResponse {
  success:   boolean
  newStatus: OrderStatus
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Enums
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'bank_transfer'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'refunded'

export type SellerApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'

export type StoreStatus =
  | 'active'
  | 'suspended'
  | 'closed'

export type ProductStatus =
  | 'draft'
  | 'active'
  | 'archived'

export type CartStatus =
  | 'active'
  | 'checked_out'
  | 'abandoned'

export type UserRole =
  | 'customer'
  | 'seller'
  | 'admin'

export type NotificationType =
  | 'seller_approved'
  | 'seller_rejected'
  | 'order_pending'
  | 'order_confirmed'
  | 'order_processing'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_refunded'

// ─────────────────────────────────────────────────────────────────────────────
// Internal types used inside Edge Functions
// ─────────────────────────────────────────────────────────────────────────────

export interface CartItemWithProduct {
  id:         string
  cart_id:    string
  product_id: string
  quantity:   number
  unit_price: number    // السعر المحفوظ في السلة
  products: {
    id:             string
    name:           string
    sku:            string | null
    price:          number    // السعر الحالي من DB
    stock_quantity: number
    track_inventory: boolean
    status:         ProductStatus
    store_id:       string
    stores: {
      id:     string
      status: StoreStatus
    }
  }
}

export interface CartWithItems {
  id:          string
  customer_id: string
  store_id:    string | null
  status:      CartStatus
  cart_items:  CartItemWithProduct[]
}

export interface CustomerAddress {
  id:          string
  customer_id: string
  full_name:   string
  phone:       string
  city:        string
  district:    string | null
  street:      string | null
  building:    string | null
  notes:       string | null
  is_default:  boolean
}

// Generic API error response
export interface ApiError {
  error: string
  code?: string
}

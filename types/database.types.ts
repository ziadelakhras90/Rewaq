// ─────────────────────────────────────────────────────────────────────────────
// types/database.types.ts
//
// هذا الملف يُولَّد تلقائيًا من Supabase CLI عبر:
//   npx supabase gen types typescript --local > types/database.types.ts
//
// لا تعدّله يدويًا — أي تعديل سيُمحى عند إعادة التوليد.
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:         string
          full_name:  string
          phone:      string | null
          avatar_url: string | null
          is_active:  boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id:         string
          full_name?: string
          phone?:     string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?:  string
          phone?:      string | null
          avatar_url?: string | null
          is_active?:  boolean
          updated_at?: string
        }
      }

      user_roles: {
        Row: {
          id:         string
          user_id:    string
          role:       'customer' | 'seller' | 'admin'
          granted_at: string
          granted_by: string | null
        }
        Insert: {
          id?:        string
          user_id:    string
          role:       'customer' | 'seller' | 'admin'
          granted_at?: string
          granted_by?: string | null
        }
        Update: {
          role?:       'customer' | 'seller' | 'admin'
          granted_by?: string | null
        }
      }

      stores: {
        Row: {
          id:             string
          seller_id:      string
          application_id: string | null
          name:           string
          slug:           string
          description:    string | null
          logo_url:       string | null
          cover_url:      string | null
          phone:          string | null
          email:          string | null
          city:           string | null
          district:       string | null
          address_line:   string | null
          status:         'active' | 'suspended' | 'closed'
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:            string
          seller_id:      string
          application_id?: string | null
          name:           string
          slug:           string
          description?:   string | null
          logo_url?:      string | null
          cover_url?:     string | null
          phone?:         string | null
          email?:         string | null
          city?:          string | null
          district?:      string | null
          address_line?:  string | null
          status?:        'active' | 'suspended' | 'closed'
        }
        Update: {
          name?:         string
          description?:  string | null
          logo_url?:     string | null
          cover_url?:    string | null
          phone?:        string | null
          email?:        string | null
          city?:         string | null
          district?:     string | null
          address_line?: string | null
          status?:       'active' | 'suspended' | 'closed'
          updated_at?:   string
        }
      }

      seller_applications: {
        Row: {
          id:                string
          user_id:           string
          store_name:        string
          store_description: string | null
          business_type:     string | null
          phone:             string
          city:              string
          status:            'pending' | 'approved' | 'rejected'
          admin_notes:       string | null
          reviewed_by:       string | null
          reviewed_at:       string | null
          created_at:        string
        }
        Insert: {
          id?:               string
          user_id:           string
          store_name:        string
          store_description?: string | null
          business_type?:    string | null
          phone:             string
          city:              string
          status?:           'pending' | 'approved' | 'rejected'
          admin_notes?:      string | null
        }
        Update: {
          status?:       'pending' | 'approved' | 'rejected'
          admin_notes?:  string | null
          reviewed_by?:  string | null
          reviewed_at?:  string | null
        }
      }

      categories: {
        Row: {
          id:          string
          name:        string
          slug:        string
          description: string | null
          image_url:   string | null
          parent_id:   string | null
          sort_order:  number
          is_active:   boolean
          created_at:  string
        }
        Insert: {
          id?:          string
          name:         string
          slug:         string
          description?: string | null
          image_url?:   string | null
          parent_id?:   string | null
          sort_order?:  number
          is_active?:   boolean
        }
        Update: {
          name?:        string
          slug?:        string
          description?: string | null
          image_url?:   string | null
          parent_id?:   string | null
          sort_order?:  number
          is_active?:   boolean
        }
      }

      products: {
        Row: {
          id:              string
          store_id:        string
          category_id:     string | null
          name:            string
          slug:            string
          description:     string | null
          price:           number
          compare_price:   number | null
          sku:             string | null
          stock_quantity:  number
          track_inventory: boolean
          status:          'draft' | 'active' | 'archived'
          is_featured:     boolean
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          store_id:         string
          category_id?:     string | null
          name:             string
          slug:             string
          description?:     string | null
          price:            number
          compare_price?:   number | null
          sku?:             string | null
          stock_quantity?:  number
          track_inventory?: boolean
          status?:          'draft' | 'active' | 'archived'
          is_featured?:     boolean
        }
        Update: {
          category_id?:     string | null
          name?:            string
          slug?:            string
          description?:     string | null
          price?:           number
          compare_price?:   number | null
          sku?:             string | null
          stock_quantity?:  number
          track_inventory?: boolean
          status?:          'draft' | 'active' | 'archived'
          is_featured?:     boolean
          updated_at?:      string
        }
      }

      product_images: {
        Row: {
          id:         string
          product_id: string
          url:        string
          alt_text:   string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?:         string
          product_id:  string
          url:         string
          alt_text?:   string | null
          sort_order?: number
          is_primary?: boolean
        }
        Update: {
          url?:        string
          alt_text?:   string | null
          sort_order?: number
          is_primary?: boolean
        }
      }

      customer_addresses: {
        Row: {
          id:          string
          customer_id: string
          label:       string | null
          full_name:   string
          phone:       string
          city:        string
          district:    string | null
          street:      string | null
          building:    string | null
          notes:       string | null
          is_default:  boolean
          created_at:  string
        }
        Insert: {
          id?:          string
          customer_id:  string
          label?:       string | null
          full_name:    string
          phone:        string
          city:         string
          district?:    string | null
          street?:      string | null
          building?:    string | null
          notes?:       string | null
          is_default?:  boolean
        }
        Update: {
          label?:      string | null
          full_name?:  string
          phone?:      string
          city?:       string
          district?:   string | null
          street?:     string | null
          building?:   string | null
          notes?:      string | null
          is_default?: boolean
        }
      }

      carts: {
        Row: {
          id:          string
          customer_id: string
          store_id:    string | null
          status:      'active' | 'checked_out' | 'abandoned'
          created_at:  string
          updated_at:  string
        }
        Insert: {
          id?:          string
          customer_id:  string
          store_id?:    string | null
          status?:      'active' | 'checked_out' | 'abandoned'
        }
        Update: {
          store_id?:  string | null
          status?:    'active' | 'checked_out' | 'abandoned'
          updated_at?: string
        }
      }

      cart_items: {
        Row: {
          id:         string
          cart_id:    string
          product_id: string
          quantity:   number
          unit_price: number
          added_at:   string
        }
        Insert: {
          id?:         string
          cart_id:     string
          product_id:  string
          quantity?:   number
          unit_price:  number
        }
        Update: {
          quantity?:   number
          unit_price?: number
        }
      }

      orders: {
        Row: {
          id:                string
          order_number:      string
          customer_id:       string
          store_id:          string
          status:            'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          delivery_name:     string
          delivery_phone:    string
          delivery_city:     string
          delivery_district: string | null
          delivery_street:   string | null
          delivery_notes:    string | null
          subtotal:          number
          delivery_fee:      number
          discount_amount:   number
          total_amount:      number
          payment_method:    string
          payment_status:    'pending' | 'paid' | 'refunded'
          notes:             string | null
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id?:               string
          order_number:      string
          customer_id:       string
          store_id:          string
          status?:           'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          delivery_name:     string
          delivery_phone:    string
          delivery_city:     string
          delivery_district?: string | null
          delivery_street?:  string | null
          delivery_notes?:   string | null
          subtotal:          number
          delivery_fee?:     number
          discount_amount?:  number
          total_amount:      number
          payment_method?:   string
          payment_status?:   'pending' | 'paid' | 'refunded'
          notes?:            string | null
        }
        Update: {
          status?:         'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'refunded'
          updated_at?:     string
        }
      }

      order_items: {
        Row: {
          id:           string
          order_id:     string
          product_id:   string
          product_name: string
          product_sku:  string | null
          unit_price:   number
          quantity:     number
          total_price:  number
          created_at:   string
        }
        Insert: {
          id?:           string
          order_id:      string
          product_id:    string
          product_name:  string
          product_sku?:  string | null
          unit_price:    number
          quantity:      number
          total_price:   number
        }
        Update: never
      }

      order_status_history: {
        Row: {
          id:         string
          order_id:   string
          old_status: string | null
          new_status: string
          changed_by: string | null
          notes:      string | null
          created_at: string
        }
        Insert: {
          id?:         string
          order_id:    string
          old_status?: string | null
          new_status:  string
          changed_by?: string | null
          notes?:      string | null
        }
        Update: never
      }

      notifications: {
        Row: {
          id:         string
          user_id:    string
          type:       string
          title:      string
          body:       string | null
          is_read:    boolean
          link:       string | null
          created_at: string
        }
        Insert: {
          id?:       string
          user_id:   string
          type:      string
          title:     string
          body?:     string | null
          is_read?:  boolean
          link?:     string | null
        }
        Update: {
          is_read?: boolean
        }
      }

      admin_audit_logs: {
        Row: {
          id:          string
          admin_id:    string
          action:      string
          target_type: string
          target_id:   string
          notes:       string | null
          created_at:  string
        }
        Insert: {
          id?:          string
          admin_id:     string
          action:       string
          target_type:  string
          target_id:    string
          notes?:       string | null
        }
        Update: never
      }
    }

    Views:    { [_ in never]: never }
    Functions: {
      create_order_transaction: {
        Args: {
          p_order_number:    string
          p_customer_id:     string
          p_store_id:        string
          p_cart_id:         string
          p_delivery_name:   string
          p_delivery_phone:  string
          p_delivery_city:   string
          p_delivery_district: string | null
          p_delivery_street: string | null
          p_delivery_notes:  string | null
          p_subtotal:        number
          p_delivery_fee:    number
          p_discount_amount: number
          p_total_amount:    number
          p_payment_method:  string
          p_notes:           string | null
          p_items:           Json
        }
        Returns: string
      }
      generate_order_number: {
        Args:    Record<never, never>
        Returns: string
      }
      is_admin: {
        Args:    Record<never, never>
        Returns: boolean
      }
      owns_store: {
        Args:    { p_store_id: string }
        Returns: boolean
      }
      is_store_active: {
        Args:    { p_store_id: string }
        Returns: boolean
      }
    }
    Enums: { [_ in never]: never }
  }
}

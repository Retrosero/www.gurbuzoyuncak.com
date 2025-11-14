// Uygulama genelinde kullanılan tip tanımlamaları

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  sale_price?: number
  category_id: number
  brand_id?: number
  image_url?: string
  stock_quantity: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  slug?: string
  
  // Pil gereksinimleri
  battery_required?: boolean
  battery_type?: string
  battery_count?: number
  
  // İlişkisel veriler
  category?: {
    id: number
    name: string
    slug: string
  }
  brand?: {
    id: number
    name: string
  }
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  gift_wrap?: boolean
  gift_wrap_fee?: number
  battery_selection?: {
    battery_type: string
    battery_count: number
    battery_product_id?: number
  }
}

export interface BatteryRecommendation {
  product_id: number
  product_name: string
  battery_type: string
  battery_count: number
  recommended_battery_product?: Product
}

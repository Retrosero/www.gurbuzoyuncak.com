export interface Product {
  id: number
  product_code: string
  barcode: string | null
  name: string
  slug: string
  description: string | null
  brand_id: number | null
  brand_name: string | null
  category_id: number | null
  base_price: number
  tax_rate: number
  stock: number
  is_active: boolean
  is_featured: boolean
  view_count: number
  video_type: 'youtube' | 'file' | null
  video_url: string | null
  has_video: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  order_index: number
  is_primary: boolean
}

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  level: number
  order_index: number
  is_active: boolean
  children?: Category[]
}

export interface Brand {
  id: number
  name: string
  slug: string
  logo_url: string | null
  description: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  variant_id?: number | null
}

export interface User {
  id: string
  email: string
  full_name: string | null
  customer_type: 'B2C' | 'B2B' | 'Toptan' | 'Kurumsal'
  vip_level: number
  loyalty_points: number
  balance: number
}

export interface HomeSection {
  id: number
  section_type: 'best_sellers' | 'new_arrivals' | 'editor_picks' | 'featured_categories'
  title: string
  product_ids: number[]
  is_active: boolean
  order_index: number
}

export interface StockAlert {
  id: number
  product_id: number
  alert_type: 'low_stock' | 'out_of_stock' | 'critical_stock'
  current_stock: number
  threshold_value: number
  message: string
  status: 'active' | 'resolved' | 'ignored'
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
  email_sent: boolean
  email_sent_at: string | null
  email_recipients: string[]
  product?: Product
}

export interface AdminSetting {
  id: number
  setting_key: string
  setting_value: string
  setting_type: 'text' | 'number' | 'boolean' | 'json'
  description: string
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface StockAlertSettings {
  stock_low_threshold: number
  stock_critical_threshold: number
  stock_out_threshold: number
  stock_alert_email_enabled: boolean
  stock_alert_email_recipients: string[]
  stock_check_frequency: number
  stock_auto_resolve: boolean
  stock_alert_webhook: string
}

// Gelişmiş Ürün Detay Sayfası Type'ları
export interface ProductReview {
  id: number
  product_id: number
  user_id: string
  rating: number
  title: string
  comment: string
  is_verified_purchase: boolean
  helpful_count: number
  not_helpful_count: number
  images: string[]
  created_at: string
  updated_at: string
  is_approved: boolean
  status: 'pending' | 'approved' | 'rejected'
  user?: {
    full_name: string
    avatar_url?: string
  }
}

export interface ProductSpecification {
  id: number
  product_id: number
  spec_name: string
  spec_value: string
  spec_group: string
  sort_order: number
  is_highlighted: boolean
  created_at: string
}

export interface RelatedProduct {
  id: number
  product_id: number
  related_product_id: number
  relation_type: 'similar' | 'alternative' | 'complementary' | 'bought_together' | 'viewed_together'
  relevance_score: number
  created_at: string
  product?: Product
}

export interface ProductPriceHistory {
  id: number
  product_id: number
  old_price: number
  new_price: number
  change_type: 'manual' | 'discount' | 'promotion' | 'bulk_price' | 'dynamic_pricing'
  discount_percentage?: number
  valid_from: string
  valid_until?: string
  created_by?: string
  created_at: string
}

export interface ProductStockMovement {
  id: number
  product_id: number
  movement_type: 'in' | 'out' | 'adjustment' | 'return' | 'damage'
  quantity: number
  previous_stock: number
  new_stock: number
  reference_type?: string
  reference_id?: string
  notes?: string
  created_by?: string
  created_at: string
}

export interface ProductAnalytics {
  id: number
  product_id: number
  date: string
  views: number
  unique_views: number
  cart_additions: number
  purchases: number
  conversion_rate: number
  average_time_on_page?: number
  bounce_rate: number
  created_at: string
}

export interface ReviewVote {
  id: number
  review_id: number
  user_id: string
  vote_type: 'helpful' | 'not_helpful'
  created_at: string
}

export interface ReviewFilter {
  rating?: number
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'
  hasImages?: boolean
  verifiedOnly?: boolean
}

export interface ProductDetailData {
  product: Product
  images: ProductImage[]
  specifications: ProductSpecification[]
  reviews: ProductReview[]
  relatedProducts: RelatedProduct[]
  priceHistory: ProductPriceHistory[]
  analytics: ProductAnalytics
  averageRating: number
  reviewCount: number
  recentViews: number
}

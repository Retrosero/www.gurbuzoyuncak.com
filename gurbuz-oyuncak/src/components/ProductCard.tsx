import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, PlayCircle, Battery, Sparkles, ImageIcon } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import CountdownTimer from './CountdownTimer'

interface SearchProduct {
  id: number
  name: string
  slug?: string
  code?: string
  basePrice: number
  salePrice?: number
  brandName?: string
  categoryName?: string
  stock: number
  isFeatured?: boolean
  snippet?: string
}

interface ProductCardProps {
  product: Product | SearchProduct
  viewMode?: 'grid' | 'list'
}

interface PriceData {
  base_price: number
  final_price: number
  total_discount_amount: number
  total_discount_percentage: number
  discounts: Array<{
    type: string
    name: string
    percentage: number
  }>
}

interface TimeLimitedDiscount {
  id: number
  discount_percentage: number
  end_date: string
  campaign_title: string
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(true)
  const [productImages, setProductImages] = useState<string[]>([])
  const [timeLimitedDiscount, setTimeLimitedDiscount] = useState<TimeLimitedDiscount | null>(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  // Ürün görsellerini yükle
  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', product.id)
        .order('order_index')

      if (data && data.length > 0) {
        setProductImages(data.map(img => img.image_url))
      }
    }

    fetchImages()
  }, [product.id])

  // Süreli indirimi kontrol et
  useEffect(() => {
    const fetchTimeLimitedDiscount = async () => {
      const { data } = await supabase
        .from('time_limited_discounts')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .lte('start_date', new Date().toISOString())
        .single()

      if (data) {
        setTimeLimitedDiscount(data)
      }
    }

    fetchTimeLimitedDiscount()
  }, [product.id])

  // Video durumunu ürün verisinden al
  const hasVideo = 'has_video' in product ? product.has_video : 
    ('video_url' in product && product.video_url) ? true : false

  const normalizedProduct = {
    id: product.id,
    name: product.name || 'Ürün',
    slug: (() => {
      // Önce mevcut slug'ı kontrol et
      if ('slug' in product && product.slug && product.slug.trim()) {
        return product.slug
      }
      
      // SearchProduct için code varsa onu kullan
      if ('code' in product && product.code) {
        return product.code.toLowerCase().replace(/[^a-z0-9]/g, '-')
      }
      
      // Son çare olarak product ID'yi kullan
      return `urun-${product.id}`
    })(),
    code: 'code' in product ? product.code : undefined,
    base_price: product.basePrice || ('base_price' in product ? product.base_price : 0),
    stock: product.stock || 0,
    is_featured: product.isFeatured || ('is_featured' in product ? product.is_featured : false),
    has_video: hasVideo
  }

  // Gelişmiş resim URL sistemi
  const getImageUrl = () => {
    if (productImages.length > 0) {
      return productImages[0]
    }
    
    // Fallback sequence - premium quality images
    const fallbackImages = [
      'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&q=75', // Premium toy
      'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&q=75', // Generic toy  
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75', // Colorful toy
      'https://images.unsplash.com/photo-1607473069295-d3ed71ea56c8?w=400&q=75'  // Toy collection
    ]
    
    // Use hash of product ID to consistently choose same fallback
    const fallbackIndex = product.id % fallbackImages.length
    return fallbackImages[fallbackIndex]
  }

  const imageUrl = getImageUrl()

  // Search product için basit fiyat hesaplama
  useEffect(() => {
    if ('basePrice' in product) {
      setPriceData({
        base_price: product.basePrice,
        final_price: product.salePrice || product.basePrice,
        total_discount_amount: product.salePrice ? product.basePrice - product.salePrice : 0,
        total_discount_percentage: product.salePrice && product.salePrice < product.basePrice 
          ? ((product.basePrice - product.salePrice) / product.basePrice) * 100 
          : 0,
        discounts: []
      })
      setLoadingPrice(false)
    } else {
      // Original logic for Product type
      const fetchPrice = async () => {
        try {
          const customerType = 'B2C' // Default type
          
          const { data, error } = await supabase.functions.invoke('calculate-price', {
            body: {
              product_id: product.id,
              customer_type: customerType,
              quantity: 1
            }
          })

          if (error) throw error

          if (data?.data) {
            setPriceData(data.data)
          }
        } catch (error) {
          console.error('Fiyat hesaplama hatası:', error)
        } finally {
          setLoadingPrice(false)
        }
      }

      fetchPrice()
    }
  }, [product])

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Favori eklemek için giriş yapmalısınız')
      return
    }

    try {
      setIsTogglingFavorite(true)
      await toggleFavorite(product.id)
    } catch (error) {
      console.error('Favori işlemi hatası:', error)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const hasDiscount = priceData && priceData.total_discount_percentage > 0
  
  // Yeni ürün kontrolü (son 7 günde eklenmiş)
  const isNewProduct = () => {
    if (!('created_at' in product)) return false
    const createdDate = new Date(product.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 relative border border-gray-100 hover:border-gray-200">
      {/* Badge Container - Tüm badge'ler */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {/* İndirim Badge */}
        {hasDiscount && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 md:px-3 py-1 rounded-xl mobile-text-xs md:text-sm font-bold shadow-lg backdrop-blur-sm">
            %{Math.round(priceData?.total_discount_percentage || 0)} İNDİRİM
          </div>
        )}
        
        {/* Yeni Ürün Badge */}
        {isNewProduct() && (
          <div className="bg-gradient-to-r from-[#ffde59] to-[#ffd700] text-black px-2 md:px-3 py-1 rounded-xl mobile-text-xs md:text-sm font-bold shadow-lg flex items-center gap-1">
            <Sparkles size={14} />
            YENİ
          </div>
        )}
      </div>
      
      {/* Video Badge */}
      {hasVideo && (
        <div className="absolute top-2 right-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-1 rounded-xl mobile-text-xs md:text-xs font-bold z-10 shadow-lg backdrop-blur-sm flex items-center gap-1">
          <PlayCircle size={14} />
          VİDEO
        </div>
      )}

      {/* Favori Butonu */}
      <button
        onClick={handleToggleFavorite}
        disabled={isTogglingFavorite}
        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 ease-in-out z-10 disabled:opacity-50 border border-gray-100 hover:border-gray-200 hover:scale-105 active:scale-95"
        aria-label={isFavorite(product.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
      >
        <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
      </button>

      {/* Ürün Görseli - Modern Loading & Error States */}
      <Link to={`/urun/${normalizedProduct.slug}`} className="block overflow-hidden">
        <div className="relative aspect-square bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500">Yükleniyor...</span>
              </div>
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => {
              setImageLoading(false)
              setImageError(false)
            }}
            onError={(e) => {
              setImageLoading(false)
              setImageError(true)
              
              // Advanced fallback cascade
              const currentSrc = e.currentTarget.src
              if (currentSrc.includes('unsplash')) {
                // If unsplash fails, try simpler placeholder
                e.currentTarget.src = `https://via.placeholder.com/400x400/f8f9fa/6c757d?text=${encodeURIComponent(product.name.substring(0, 10))}`
              } else if (currentSrc.includes('placeholder')) {
                // Last resort: solid color with icon
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent && !parent.querySelector('.fallback-icon')) {
                  const fallbackDiv = document.createElement('div')
                  fallbackDiv.className = 'fallback-icon absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E0F7FA] to-gray-100'
                  fallbackDiv.innerHTML = `
                    <div class="text-center">
                      <div class="w-12 h-12 mx-auto mb-2 bg-[#0cc0E1] rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-[#008B8B]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                        </svg>
                      </div>
                      <span class="text-xs text-gray-600">Ürün Görseli</span>
                    </div>
                  `
                  parent.appendChild(fallbackDiv)
                }
              }
            }}
          />
          
          {imageError && imageLoading === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">Resim yüklenemedi</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Ürün Bilgileri */}
      <div className="p-3 md:p-4">
        {/* Marka Bilgisi */}
        {(product.brand_name || ('brandName' in product && product.brandName)) && (
          <div className="mb-1">
            <span className="text-xs text-[#008B8B] font-medium">
              {product.brand_name || ('brandName' in product ? product.brandName : '')}
            </span>
          </div>
        )}
        
        <Link to={`/urun/${product.slug}`}>
          <h3 className="mobile-text-sm md:text-base font-semibold text-[#008B8B] mb-2 line-clamp-2 hover:text-[#40E0D0] transition min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        {/* Fiyat Gösterimi */}
        <div className="mb-3">
          {loadingPrice ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-1">
              {hasDiscount ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="mobile-text-xl md:text-2xl font-bold text-red-600">
                      ₺{(priceData?.final_price || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mobile-text-xs md:text-sm text-gray-500 line-through">
                      ₺{(priceData?.base_price || 0).toFixed(2)}
                    </span>
                    <span className="mobile-text-xs md:text-xs text-green-600 font-semibold">
                      ₺{(priceData?.total_discount_amount || 0).toFixed(2)} tasarruf
                    </span>
                  </div>
                  {/* Süreli İndirim Timer */}
                  {timeLimitedDiscount && (
                    <div className="mt-2 bg-[#E0F7FA] border border-[#0cc0df] rounded-lg p-2">
                      <CountdownTimer
                        endDate={timeLimitedDiscount.end_date}
                        compact={true}
                        className="text-[#008B8B]"
                        onExpire={() => setTimeLimitedDiscount(null)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  ₺{(product.base_price || 0).toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stok Durumu */}
        <div className="text-sm mb-3 space-y-1">
          {product.stock > 0 ? (
            <span className="text-green-600 font-medium block">✓ Stokta var</span>
          ) : (
            <span className="text-red-600 font-medium block">✗ Stokta yok</span>
          )}
          
          {/* Pil Gereksinimleri */}
          {product.battery_required && product.battery_type && product.battery_count && (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <Battery className="w-4 h-4" />
              <span className="text-xs">{product.battery_count}x {product.battery_type} pil gerekir</span>
            </span>
          )}
        </div>

        {/* Sepete Ekle Butonu */}
        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.stock === 0}
          className="w-full text-white py-3 md:py-2.5 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center gap-2 min-h-[48px] md:min-h-[40px] bg-gradient-to-r from-[#0cc0df] to-[#009ab3] hover:from-[#009ab3] hover:to-[#008b9f] hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
          <span className="text-sm md:text-xs lg:text-sm">Sepete Ekle</span>
        </button>
      </div>
    </div>
  )
}

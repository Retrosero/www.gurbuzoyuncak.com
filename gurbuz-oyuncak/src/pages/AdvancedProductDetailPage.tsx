import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Product, ProductImage, ProductSpecification, ProductReview, RelatedProduct } from '@/types'
import { 
  ShoppingCart, 
  Star, 
  Truck, 
  Shield, 
  PlayCircle, 
  Heart, 
  Share2,
  Plus,
  Minus,
  Eye,
  Clock,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Yeni Component'ler
import ProductImageGallery from '@/components/ProductImageGallery'
import ProductReviews from '@/components/ProductReviews'
import ProductSpecifications from '@/components/ProductSpecifications'
import RelatedProducts from '@/components/RelatedProducts'
import SocialShare from '@/components/SocialShare'
import RealTimeStock from '@/components/RealTimeStock'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  
  // Ana State'ler
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([])
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  
  // Gelişmiş State'ler
  const [activeTab, setActiveTab] = useState('description')
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [viewStartTime, setViewStartTime] = useState<number>(0)
  const [recentViews, setRecentViews] = useState(0)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    if (slug) {
      loadProductData()
      trackProductView()
      setViewStartTime(Date.now())
    }
    
    return () => {
      // Sayfa terk edildiğinde viewing time'ı kaydet
      if (viewStartTime > 0) {
        const timeSpent = Math.round((Date.now() - viewStartTime) / 1000)
        saveViewingTime(timeSpent)
      }
    }
  }, [slug])

  const loadProductData = async () => {
    try {
      setLoading(true)
      
      // Ana ürün bilgilerini yükle
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (productError) throw productError
      if (!productData) {
        navigate('/404')
        return
      }

      setProduct(productData)

      // Ürün görsellerini yükle
      const { data: imageData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productData.id)
        .order('order_index')

      const formattedImages = (imageData || []).map(img => ({
        id: img.id,
        product_id: img.product_id,
        image_url: img.image_url,
        order_index: img.order_index,
        is_primary: img.is_primary
      }))
      
      setImages(formattedImages)
      if (formattedImages.length > 0) {
        setSelectedImage(formattedImages[0].image_url)
      }

      // Ürün spesifikasyonlarını yükle
      const { data: specData } = await supabase
        .from('product_specifications')
        .select('*')
        .eq('product_id', productData.id)
        .order('sort_order')

      setSpecifications(specData || [])

      // Ürün yorumlarını yükle
      const { data: reviewData } = await supabase
        .from('product_reviews')
        .select(`
          *,
          user:profiles!product_reviews_user_id_fkey(full_name, avatar_url)
        `)
        .eq('product_id', productData.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      setReviews(reviewData || [])
      calculateReviewStats(reviewData || [])

      // Benzer ürünleri yükle
      const { data: relatedData } = await supabase
        .from('related_products')
        .select(`
          *,
          product:products!related_products_related_product_id_fkey(*)
        `)
        .eq('product_id', productData.id)
        .order('relevance_score', { ascending: false })
        .limit(12)

      setRelatedProducts(relatedData || [])

      // Fiyat geçmişini yükle (opsiyonel)
      const { data: priceData } = await supabase
        .from('product_price_history')
        .select('*')
        .eq('product_id', productData.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setPriceHistory(priceData || [])

    } catch (error) {
      console.error('Ürün verileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackProductView = async () => {
    if (!slug || !product) return

    try {
      // User view tracking (anonim de olsa)
      await supabase
        .from('user_product_views')
        .insert({
          product_id: product.id,
          session_id: sessionStorage.getItem('session_id') || Math.random().toString(36),
          user_agent: navigator.userAgent,
          referrer: document.referrer
        })

      // View count güncelle
      await supabase
        .from('products')
        .update({ view_count: (product.view_count || 0) + 1 })
        .eq('id', product.id)

    } catch (error) {
      console.error('View tracking hatası:', error)
    }
  }

  const saveViewingTime = async (timeSpent: number) => {
    if (!product || timeSpent < 5) return // 5 saniyeden az ise kaydetme

    try {
      // Analytics için viewing time kaydet
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('product_analytics')
        .upsert({
          product_id: product.id,
          date: today,
          average_time_on_page: timeSpent
        })

      // Product view count'u güncelle
      await supabase
        .from('products')
        .update({ 
          view_count: (product.view_count || 0) + 1 
        })
        .eq('id', product.id)
    } catch (error) {
      console.error('Viewing time kaydetme hatası:', error)
    }
  }

  const calculateReviewStats = (reviews: ProductReview[]) => {
    if (reviews.length === 0) {
      setAverageRating(0)
      setReviewCount(0)
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    setAverageRating(totalRating / reviews.length)
    setReviewCount(reviews.length)
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Favorilere eklemek için giriş yapmalısınız')
      navigate('/giris')
      return
    }

    if (!product) return

    try {
      setIsTogglingFavorite(true)
      await toggleFavorite(product.id)
    } catch (error) {
      console.error('Favori işlemi hatası:', error)
      alert('Favori işlemi başarısız oldu')
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      addToCart(product, quantity, selectedVariant)
      // Başarı mesajı
      alert(`${product.name} sepete eklendi!`)
    } catch (error) {
      console.error('Sepete ekleme hatası:', error)
      alert('Ürün sepete eklenemedi')
    }
  }

  const renderStars = (rating: number, size = 'sm') => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderVideo = () => {
    if (!product?.has_video || !product.video_url) return null

    if (product.video_type === 'youtube') {
      let videoId = product.video_url
      if (product.video_url.includes('youtube.com/watch?v=')) {
        videoId = product.video_url.split('v=')[1]?.split('&')[0] || ''
      } else if (product.video_url.includes('youtu.be/')) {
        videoId = product.video_url.split('youtu.be/')[1]?.split('?')[0] || ''
      }

      return (
        <div className="mt-4 aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Ürün Videosu"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
      )
    } else if (product.video_type === 'file') {
      return (
        <div className="mt-4 aspect-video">
          <video
            controls
            className="w-full h-full rounded-lg bg-black"
            src={product.video_url}
          >
            Tarayıcınız video oynatmayı desteklemiyor.
          </video>
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol taraf - Skeleton */}
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-100 rounded aspect-square animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Sağ taraf - Skeleton */}
          <div className="space-y-6">
            <div className="h-8 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-2">Ürün Bulunamadı</h1>
        <p className="text-gray-600 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Button onClick={() => navigate('/')}>
          Ana Sayfaya Dön
        </Button>
      </div>
    )
  }

  const finalPrice = product.base_price * (1 + product.tax_rate / 100)
  const originalPrice = priceHistory.length > 0 ? priceHistory[0].old_price : finalPrice
  const discountPercentage = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li><Button variant="link" onClick={() => navigate('/')}>Ana Sayfa</Button></li>
          <li>/</li>
          <li><Button variant="link" onClick={() => navigate(`/kategori/${product.category_id}`)}>Kategori</Button></li>
          <li>/</li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Sol Taraf - Görseller */}
        <div>
          <ProductImageGallery 
            images={images} 
            productName={product.name}
            className="mb-6"
          />

          {/* Video Section */}
          {product.has_video && product.video_url && (
            <div>
              <Button
                onClick={() => setShowVideo(!showVideo)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold mb-2"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                {showVideo ? 'Videoyu Gizle' : 'Ürün Videosunu İzle'}
              </Button>
              {showVideo && renderVideo()}
            </div>
          )}
        </div>

        {/* Sağ Taraf - Ürün Bilgileri */}
        <div className="space-y-6">
          {/* Marka ve Kategori */}
          <div className="flex items-center gap-2">
            {product.brand_name && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {product.brand_name}
              </Badge>
            )}
            <Badge variant="outline">
              <Package className="w-3 h-3 mr-1" />
              Kategori
            </Badge>
          </div>

          {/* Başlık ve Favori */}
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
            <Button
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 ml-4"
            >
              <Heart 
                className={`w-5 h-5 ${
                  isFavorite(product.id) 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-600'
                }`} 
              />
              <span className="hidden sm:inline">
                {isFavorite(product.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              </span>
            </Button>
          </div>

          {/* Değerlendirme ve Görüntüleme */}
          <div className="flex items-center gap-4">
            {renderStars(Math.round(averageRating))}
            <span className="text-sm text-gray-600">
              ({reviewCount} değerlendirme)
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{product.view_count || 0} görüntülenme</span>
            </div>
          </div>

          {/* Fiyat */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-blue-700">
                {finalPrice.toFixed(2)} TL
              </span>
              {discountPercentage > 0 && (
                <span className="text-xl text-gray-500 line-through">
                  {originalPrice.toFixed(2)} TL
                </span>
              )}
              {discountPercentage > 0 && (
                <Badge className="bg-red-500 text-white">
                  %{discountPercentage} indirim
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">KDV Dahil</p>
            
            {/* Taksit Bilgisi */}
            <div className="mt-3 text-sm text-blue-600">
              💳 12 aya varan taksit seçenekleri
            </div>
          </div>

          {/* Varyant Seçimi (Gelecek implementasyon için) */}
          <div className="space-y-4">
            {/* Bu kısım product_variants tablosu ile gelecek */}
            <div className="text-sm text-gray-500">
              * Varyant seçenekleri yakında eklenecek
            </div>
          </div>

          {/* Miktar ve Sepete Ekle */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-semibold">Miktar:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition"
              size="lg"
            >
              <ShoppingCart className="w-6 h-6" />
              {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
            </Button>
          </div>

          {/* Real-time Stok */}
          <RealTimeStock product={product} />

          {/* Avantajlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Truck className="text-green-600" size={32} />
              <div>
                <p className="font-semibold text-green-800">Hızlı Kargo</p>
                <p className="text-sm text-green-600">1-3 gün teslimat</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="text-blue-600" size={32} />
              <div>
                <p className="font-semibold text-blue-800">Güvenli Alışveriş</p>
                <p className="text-sm text-blue-600">256-bit SSL</p>
              </div>
            </div>
          </div>

          {/* Sosyal Medya Paylaşım */}
          <SocialShare
            productName={product.name}
            productUrl={window.location.href}
            productImage={images[0]?.image_url}
            productDescription={product.description || undefined}
          />
        </div>
      </div>

      {/* Detay Sekmeleri */}
      <div className="mb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Açıklama</TabsTrigger>
            <TabsTrigger value="specifications">Özellikler</TabsTrigger>
            <TabsTrigger value="reviews">Yorumlar ({reviewCount})</TabsTrigger>
            <TabsTrigger value="shipping">Kargo & İade</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Ürün Açıklaması</h3>
              {product.description ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Ürün açıklaması bulunmamaktadır.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <ProductSpecifications 
              specifications={specifications}
              productName={product.name}
              warranty="2 yıl üretici garantisi"
              deliveryInfo="1-3 iş günü içinde kargo"
            />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ProductReviews 
              productId={product.id}
              averageRating={averageRating}
              reviewCount={reviewCount}
              onReviewAdded={() => loadProductData()}
            />
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">🚚 Kargo Bilgileri</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Teslimat Süreleri</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• İstanbul: 1 iş günü</li>
                      <li>• Anadolu: 2-3 iş günü</li>
                      <li>• Uzak bölgeler: 3-5 iş günü</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Kargo Ücretleri</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 200 TL üzeri: Ücretsiz</li>
                      <li>• 200 TL altı: 19.90 TL</li>
                      <li>• Aynı gün teslimat: 29.90 TL</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">↩️ İade & Değişim</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">İade Koşulları</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 14 gün içinde koşulsuz iade</li>
                      <li>• Ürün ambalajı açılmamış olmalı</li>
                      <li>• Orijinal fatura gerekli</li>
                      <li>• Kargo ücreti alıcıya aittir</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Değişim Süreci</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Müşteri hizmetlerimizle iletişime geçin</li>
                      <li>• Değişim talebi oluşturun</li>
                      <li>• Ürünü kargo ile gönderin</li>
                      <li>• Yeni ürün 3-5 iş günü içinde</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* İlgili Ürünler */}
      <RelatedProducts
        productId={product.id}
        categoryId={product.category_id || undefined}
        brandId={product.brand_id || undefined}
      />
    </div>
  )
}
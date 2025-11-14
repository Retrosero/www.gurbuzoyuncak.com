import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useSEO } from '@/contexts/SEOContext'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import { LazyImage } from '@/components/ui/LazyImage'
import SocialShare from '@/components/SocialShare'
import BatterySelector from '@/components/BatterySelector'
import { Product } from '@/types'
import { ShoppingCart, Star, Truck, Shield, PlayCircle, Heart, Battery, X, ZoomIn, Package, MessageCircle, RefreshCw, Clock } from 'lucide-react'

// HTML Entity Decoder Utility
const decodeHtmlEntities = (html: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.documentElement.textContent || ''
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { loadSEOData, generateStructuredData } = useSEO()
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    loadProduct()
  }, [slug])

  async function loadProduct() {
    try {
      // Önce slug ile ara
      let { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      // Eğer slug ile bulunamadıysa product_code ile ara
      if (!productData) {
        const { data: productByCode } = await supabase
          .from('products')
          .select('*')
          .eq('product_code', slug)
          .maybeSingle()
        
        productData = productByCode
      }

      // Eğer code ile de bulunamadıysa id ile ara
      if (!productData && !isNaN(Number(slug))) {
        const { data: productById } = await supabase
          .from('products')
          .select('*')
          .eq('id', parseInt(slug))
          .maybeSingle()
        
        productData = productById
      }

      if (productData) {
        setProduct(productData)
        
        const { data: imageData } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', productData.id)
          .order('order_index')

        if (imageData && imageData.length > 0) {
          const urls = imageData.map(img => img.image_url)
          setImages(urls)
          setSelectedImage(urls[0])
        }

        // Load SEO data for this product
        await loadSEOData('product', productData.id)
        
        // Generate structured data for the product
        await generateStructuredData('product', productData.id, {
          name: productData.name,
          description: productData.description,
          price: productData.base_price,
          images: images,
          brand: { name: productData.brand_name },
          stock: productData.stock,
          rating: 0,
          review_count: 0
        })
      }
    } catch (error) {
      console.error('Ürün yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Yükleniyor...</div>
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ürün Bulunamadı</h2>
          <p className="text-gray-600 mb-6">
            Aradığınız ürün mevcut değil veya kaldırılmış olabilir.
          </p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
            >
              Ana Sayfaya Dön
            </Link>
            <div>
              <Link 
                to="/urunler" 
                className="inline-block text-blue-600 hover:text-blue-800 underline ml-4"
              >
                Tüm Ürünleri Görüntüle
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const finalPrice = product.base_price * (1 + product.tax_rate / 100)

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Favorilere eklemek için giriş yapmalısınız')
      return
    }

    if (!product) return

    try {
      setIsTogglingFavorite(true)
      await toggleFavorite(product.id)
    } catch (error) {
      console.error('Favori işlemi hatası:', error)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const renderVideo = () => {
    if (!product.has_video || !product.video_url) return null

    if (product.video_type === 'youtube') {
      // YouTube video ID'sini çıkar
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Performance Monitor */}
      <PerformanceMonitor showInsights={true} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Taraf - Görseller ve Video */}
        <div>
          {/* Ana Görsel */}
          <div className="bg-gray-100 rounded-lg aspect-square mb-4 overflow-hidden relative">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain rounded-lg p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Resim Yok
              </div>
            )}
          </div>
          
          {/* Thumbnail Görseller */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`border-2 rounded overflow-hidden transition-all duration-200 hover:border-blue-500 ${selectedImage === img ? 'border-blue-700 ring-2 ring-blue-200' : 'border-gray-300'}`}
                >
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full aspect-square object-cover rounded cursor-pointer" 
                  />
                </button>
              ))}
            </div>
          )}

          {/* Video Butonu ve Video Player */}
          {product.has_video && product.video_url && (
            <div>
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold mb-2"
              >
                <PlayCircle size={20} />
                {showVideo ? 'Videoyu Gizle' : 'Ürün Videosunu İzle'}
              </button>
              {showVideo && renderVideo()}
            </div>
          )}
        </div>

        {/* Sağ Taraf - Ürün Bilgileri */}
        <div>
          {/* Marka */}
          {product.brand_name && (
            <div className="mb-2">
              <Link 
                to={`/urunler?marka=${encodeURIComponent(product.brand_name)}`}
                className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {product.brand_name}
              </Link>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {/* Favori Butonu */}
            {product && (
              <button
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className="p-3 bg-gray-100 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              >
                <Heart className={`w-6 h-6 ${product && isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-gray-600">(15 değerlendirme)</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-4xl font-bold text-blue-700 mb-2">{finalPrice.toFixed(2)} TL</p>
            <p className="text-sm text-gray-600">KDV Dahil</p>
            {product.stock > 0 ? (
              <p className="text-green-600 font-semibold mt-2">Stokta {product.stock} adet</p>
            ) : (
              <p className="text-red-600 font-semibold mt-2">Stokta Yok</p>
            )}
          </div>

          {/* Ürün Sekmeleri */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Açıklama
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ürün Detayları
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ürün Yorumları
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'shipping'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Kargo
                </button>
                <button
                  onClick={() => setActiveTab('returns')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'returns'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  İptal & İade
                </button>
              </nav>
            </div>

            <div className="py-4">
              {/* Açıklama Sekmesi */}
              {activeTab === 'description' && (
                <div>
                  {product.description ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {decodeHtmlEntities(product.description)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Bu ürün için açıklama bulunmamaktadır.</p>
                  )}
                </div>
              )}

              {/* Ürün Detayları Sekmesi */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {product.brand_name && (
                    <div className="flex py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 w-1/3">Marka:</span>
                      <Link 
                        to={`/urunler?marka=${encodeURIComponent(product.brand_name)}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {product.brand_name}
                      </Link>
                    </div>
                  )}
                  {product.product_code && (
                    <div className="flex py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 w-1/3">Ürün Kodu:</span>
                      <span className="text-gray-600 w-2/3">{product.product_code}</span>
                    </div>
                  )}
                  {product.barcode && (
                    <div className="flex py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 w-1/3">Barkod:</span>
                      <span className="text-gray-600 w-2/3">{product.barcode}</span>
                    </div>
                  )}
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 w-1/3">Stok Durumu:</span>
                    <span className={`w-2/3 font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `Stokta ${product.stock} adet` : 'Stokta Yok'}
                    </span>
                  </div>
                  {product.weight && (
                    <div className="flex py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 w-1/3">Ağırlık:</span>
                      <span className="text-gray-600 w-2/3">{product.weight} kg</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 w-1/3">Boyutlar:</span>
                      <span className="text-gray-600 w-2/3">{product.dimensions}</span>
                    </div>
                  )}
                  {product.age_range && (
                    <div className="flex py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 w-1/3">Yaş Aralığı:</span>
                      <span className="text-gray-600 w-2/3">{product.age_range}</span>
                    </div>
                  )}
                  {product.battery_required && (
                    <div className="flex py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700 w-1/3">Pil Gereksinimi:</span>
                      <span className="text-gray-600 w-2/3">
                        {product.battery_count} adet {product.battery_type} pil gerektirir
                      </span>
                    </div>
                  )}
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 w-1/3">KDV Oranı:</span>
                    <span className="text-gray-600 w-2/3">%{product.tax_rate}</span>
                  </div>
                </div>
              )}

              {/* Ürün Yorumları Sekmesi */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-gray-600">(15 değerlendirme)</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Örnek Yorumlar */}
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-semibold">Ahmet Y.</span>
                      </div>
                      <p className="text-gray-700">Çok kaliteli bir ürün. Çocuğum çok beğendi.</p>
                      <span className="text-sm text-gray-500">2 hafta önce</span>
                    </div>
                    
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-semibold">Zeynep K.</span>
                      </div>
                      <p className="text-gray-700">Fiyat performans açısından başarılı.</p>
                      <span className="text-sm text-gray-500">1 ay önce</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Kargo Sekmesi */}
              {activeTab === 'shipping' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck className="text-blue-700 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Hızlı Kargo</h4>
                      <p className="text-gray-600 text-sm">1-3 iş günü içinde teslimat</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Package className="text-blue-700 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Ücretsiz Kargo</h4>
                      <p className="text-gray-600 text-sm">200 TL ve üzeri alışverişlerde ücretsiz kargo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="text-blue-700 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Kargo Takibi</h4>
                      <p className="text-gray-600 text-sm">Siparişiniz kargoya verildiğinde SMS ile bilgilendirilirsiniz</p>
                    </div>
                  </div>
                </div>
              )}

              {/* İptal & İade Sekmesi */}
              {activeTab === 'returns' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="text-blue-700 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">14 Gün İade Hakkı</h4>
                      <p className="text-gray-600 text-sm">Ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="text-blue-700 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Kolay İade</h4>
                      <p className="text-gray-600 text-sm">Ürünü kullanılmamış ve ambalajı açılmamış halde iade edebilirsiniz</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MessageCircle className="text-blue-700 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Müşteri Hizmetleri</h4>
                      <p className="text-gray-600 text-sm">İade sürecinde destek almak için bizimle iletişime geçin</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pil Gereksinimleri */}
          {product.battery_required && product.battery_type && product.battery_count && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Battery className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-lg">Pil Bilgisi</h3>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Bu ürün çalışması için <span className="font-semibold text-amber-700">{product.battery_count} adet {product.battery_type}</span> pil gerektirir.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Piller ürün içeriğinde bulunmamaktadır.
                </p>
              </div>
            </div>
          )}

          {/* Miktar Seçimi */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Miktar</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded hover:bg-gray-100 font-bold"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 border rounded hover:bg-gray-100 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Sepete Ekle */}
          <div className="space-y-3">
            <button
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product, quantity)
                navigate('/sepet')
              }}
              className="w-full bg-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition shadow-lg"
            >
              <ShoppingCart size={24} />
              {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </button>
            
            {product.stock > 0 && (
              <button
                onClick={() => {
                  addToCart(product, quantity)
                  alert('Ürün sepete eklendi!')
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <Heart size={18} />
                Sepete Ekle (Kargo Dahil)
              </button>
            )}
          </div>

          {/* Avantajlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Truck className="text-blue-700" size={32} />
              <div className="text-sm">
                <p className="font-semibold">Hızlı Kargo</p>
                <p className="text-gray-600">1-3 gün teslimat</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="text-blue-700" size={32} />
              <div className="text-sm">
                <p className="font-semibold">Güvenli Alışveriş</p>
                <p className="text-gray-600">256-bit SSL</p>
              </div>
            </div>
          </div>

          {/* Sosyal Medya Paylaşım */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <SocialShare
              productName={product.name}
              productUrl={`${window.location.origin}/urun/${product.slug}`}
              productImage={selectedImage || (images[0] || '')}
              productDescription={`${product.name} - ${product.price} TL`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useSEO } from '@/contexts/SEOContext'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import { LazyImage } from '@/components/ui/LazyImage'
import { Product } from '@/types'
import { ShoppingCart, Star, Truck, Shield, PlayCircle, Heart } from 'lucide-react'

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

  useEffect(() => {
    loadProduct()
  }, [slug])

  async function loadProduct() {
    try {
      const { data: productData } = await supabase
        .from('products')
        .select('*, brands(name), categories(name, slug)')
        .eq('slug', slug)
        .maybeSingle()

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
          brand: productData.brands,
          category: productData.categories,
          stock: productData.stock_quantity,
          rating: productData.rating || 0,
          review_count: productData.review_count || 0
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
    return <div className="container mx-auto px-4 py-12 text-center">Ürün bulunamadı</div>
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
          <div className="bg-gray-100 rounded-lg aspect-square mb-4 overflow-hidden">
            {selectedImage ? (
              <LazyImage 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-contain rounded-lg p-4" 
                priority={true}
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
                  className={`border-2 rounded overflow-hidden ${selectedImage === img ? 'border-blue-700' : 'border-gray-300'}`}
                >
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full aspect-square object-cover rounded" 
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
              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                {product.brand_name}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {/* Favori Butonu */}
            {product && (
              <button
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              >
                <Heart className={`w-5 h-5 ${product && isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">
                  {product && isFavorite(product.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </span>
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

          {/* Ürün Açıklaması */}
          {product.description && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3">Ürün Açıklaması</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
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
          <button
            disabled={product.stock === 0}
            onClick={() => {
              addToCart(product, quantity)
              navigate('/sepet')
            }}
            className="w-full bg-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition"
          >
            <ShoppingCart size={24} />
            Sepete Ekle
          </button>

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
        </div>
      </div>
    </div>
  )
}

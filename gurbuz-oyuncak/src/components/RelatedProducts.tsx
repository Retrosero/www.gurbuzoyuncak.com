import { useState, useEffect } from 'react'
import { RelatedProduct, Product } from '@/types'
import { ArrowLeft, ArrowRight, Star, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

interface RelatedProductsProps {
  productId: number
  categoryId?: number
  brandId?: number
  className?: string
}

export default function RelatedProducts({
  productId,
  categoryId,
  brandId,
  className = ""
}: RelatedProductsProps) {
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'similar' | 'alternatives' | 'complementary' | 'bought_together'>('similar')

  useEffect(() => {
    loadRelatedProducts()
  }, [productId, categoryId, brandId])

  const loadRelatedProducts = async () => {
    try {
      setLoading(true)
      
      // Önce veritabanındaki related products'ları yükle
      const { data: dbRelated, error: dbError } = await supabase
        .from('related_products')
        .select(`
          *,
          product:products!related_products_related_product_id_fkey(*)
        `)
        .eq('product_id', productId)
        .order('relevance_score', { ascending: false })
        .limit(20)

      let products = dbRelated || []

      // Yeterli ürün yoksa, kategori ve marka bazlı otomatik öneriler ekle
      if (products.length < 8) {
        const autoRelated = await generateAutoRelatedProducts()
        products = [...products, ...autoRelated]
      }

      setRelatedProducts(products.slice(0, 12)) // En fazla 12 ürün
    } catch (error) {
      console.error('İlgili ürünler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAutoRelatedProducts = async (): Promise<RelatedProduct[]> => {
    if (!categoryId && !brandId) return []

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('id', productId)
      .limit(6)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    } else if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    const { data: autoProducts } = await query

    return (autoProducts || []).map(product => ({
      id: 0, // Database'den gelmeyen ürünler için temporary ID
      product_id: productId,
      related_product_id: product.id,
      relation_type: 'similar' as const,
      relevance_score: 0.5,
      created_at: new Date().toISOString(),
      product
    }))
  }

  const getFilteredProducts = (relationType: string) => {
    return relatedProducts.filter(item => item.relation_type === relationType)
  }

  const handleProductClick = (product: Product) => {
    navigate(`/urun/${product.slug}`)
  }

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleToggleFavorite = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      alert('Favorilere eklemek için giriş yapmalısınız')
      return
    }
    await toggleFavorite(product.id)
  }

  const renderProductCard = (relatedItem: RelatedProduct) => {
    const product = relatedItem.product
    if (!product) return null

    const finalPrice = product.base_price * (1 + product.tax_rate / 100)

    return (
      <div
        key={`${relatedItem.relation_type}-${relatedItem.related_product_id}`}
        className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-[#0cc0df]/30"
        onClick={() => handleProductClick(product)}
      >
        <div className="relative aspect-square bg-gray-100">
          <img
            src={product.image_url || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* İndirim Etiketi */}
          {product.stock === 0 && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
              Tükendi
            </Badge>
          )}
          
          {/* İlgili Ürün Türü Etiketi */}
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] rounded-xl shadow-lg">
            {getRelationTypeLabel(relatedItem.relation_type)}
          </Badge>

          {/* Hover Butonları */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => handleAddToCart(product, e)}
              disabled={product.stock === 0}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => handleToggleFavorite(product, e)}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <Heart 
                className={`w-4 h-4 ${
                  isFavorite(product.id) 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-600'
                }`} 
              />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[#0cc0df] transition-colors duration-200 text-[#0cc0df]">
            {product.name}
          </h3>
          
          {product.brand_name && (
            <p className="text-xs text-gray-500 mb-2">{product.brand_name}</p>
          )}

          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                className="w-3 h-3 fill-yellow-400 text-yellow-400" 
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">(12)</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] bg-clip-text text-transparent">
                {finalPrice.toFixed(2)} TL
              </div>
              <div className="text-xs text-gray-500">KDV Dahil</div>
            </div>
            
            <div className="text-right">
              <div className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} adet` : 'Stokta yok'}
              </div>
            </div>
          </div>

          {/* İlgili Ürün Skoru */}
          {relatedItem.relevance_score > 0.7 && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-[#ffde59]/10 to-yellow-100 text-[#0cc0df] rounded-xl border-[#ffde59]/20">
                ⭐ Yüksek Benzerlik
              </Badge>
            </div>
          )}
        </div>
      </div>
    )
  }

  const getRelationTypeLabel = (type: string) => {
    switch (type) {
      case 'similar': return 'Benzer'
      case 'alternative': return 'Alternatif'
      case 'complementary': return 'Tamamlayıcı'
      case 'bought_together': return 'Birlikte Alınan'
      case 'viewed_together': return 'Birlikte Görüntülenen'
      default: return 'İlgili'
    }
  }

  const sections = [
    { key: 'similar', label: 'Benzer Ürünler', icon: '🔍' },
    { key: 'alternative', label: 'Alternatifler', icon: '🔄' },
    { key: 'complementary', label: 'Tamamlayıcı', icon: '➕' },
    { key: 'bought_together', label: 'Birlikte Alınan', icon: '🛒' }
  ]

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 h-80 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (relatedProducts.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold mb-6">İlgili Ürünler</h2>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🛍️</div>
          <p>İlgili ürün bulunamadı</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">İlgili Ürünler</h2>
      
      {/* Sekme Navigasyonu */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map(section => {
          const filteredProducts = getFilteredProducts(section.key)
          if (filteredProducts.length === 0) return null
          
          return (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeSection === section.key
                  ? 'bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
              <Badge className="ml-2 bg-white/80 text-[#0cc0df] rounded-xl border border-gray-200 backdrop-blur-sm">
                {filteredProducts.length}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Ürün Listesi */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {getFilteredProducts(activeSection).map(renderProductCard)}
      </div>

      {/* Daha Fazla Ürün Göster */}
      {getFilteredProducts(activeSection).length > 8 && (
        <div className="text-center mt-8">
          <Button variant="outline">
            Daha Fazla {sections.find(s => s.key === activeSection)?.label} Göster
          </Button>
        </div>
      )}

      {/* Otomatik Öneri Algoritması Bilgisi */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🤖 Akıllı Ürün Önerileri</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Benzer Ürünler:</strong> Aynı kategori ve markadaki ürünler</p>
          <p>• <strong>Alternatifler:</strong> Benzer özelliklere sahip farklı markalar</p>
          <p>• <strong>Tamamlayıcı:</strong> Bu ürünle birlikte kullanılabilecek aksesuarlar</p>
          <p>• <strong>Birlikte Alınan:</strong> Müşterilerimizin sıkça birlikte satın aldığı ürünler</p>
        </div>
      </div>
    </div>
  )
}
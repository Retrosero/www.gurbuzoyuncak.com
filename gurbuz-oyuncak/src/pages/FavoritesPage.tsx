import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, Filter, Grid, List, TrendingDown, TrendingUp, Package } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface FavoriteProduct extends Product {
  favorite_id: number
  added_at: string
  price_change?: {
    type: 'increase' | 'decrease'
    percentage: number
    amount: number
  }
  stock_status?: {
    current: number
    previous: number
    type: 'increased' | 'decreased' | 'restocked' | 'out_of_stock'
  }
}

interface PriceHistory {
  old_price: number
  new_price: number
  change_type: 'increase' | 'decrease'
  change_percentage: number
  created_at: string
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { removeFromFavorites } = useFavorites()
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'price_low' | 'price_high' | 'name'>('date')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [productImages, setProductImages] = useState<{[key: number]: string}>({})

  useEffect(() => {
    if (user) {
      fetchFavorites()
      fetchCategories()
    }
  }, [user, sortBy, filterCategory])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      console.log('Favoriler sayfası: Veriler yükleniyor...', { userId: user!.id })
      
      // Kullanıcının favorilerini çek
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('user_favorites')
        .select(`
          id,
          product_id,
          added_at,
          products!inner(
            id,
            product_code,
            name,
            slug,
            description,
            brand_id,
            category_id,
            base_price,
            tax_rate,
            stock,
            is_active,
            is_featured,
            view_count,
            video_type,
            video_url,
            has_video,
            created_at,
            updated_at,
            categories(name)
          )
        `)
        .eq('user_id', user!.id)
        .order('added_at', { ascending: false })

      if (favoriteError) {
        console.error('Favoriler sorgu hatası:', favoriteError)
        throw favoriteError
      }

      console.log('Favori ürünler bulundu:', favoriteData?.length || 0, 'ürün')

      // Marka bilgilerini ayrıca çek
      const favoritesWithDetails: FavoriteProduct[] = favoriteData?.map(fav => {
        const product = fav.products
        
        // Marka bilgisini ayrıca çek
        let brand_name = 'Bilinmeyen Marka'
        if (product.brand_id) {
          // Marka bilgisini ayrı bir sorgu ile çek
          supabase
            .from('brands')
            .select('name')
            .eq('id', product.brand_id)
            .single()
            .then(({ data: brandData }) => {
              if (brandData?.name) {
                brand_name = brandData.name
              }
            })
            .catch(() => {
              // Hata durumunda varsayılan değeri kullan
              console.warn('Marka bilgisi alınamadı:', product.brand_id)
            })
        }
        
        return {
          ...product,
          favorite_id: fav.id,
          added_at: fav.added_at,
          brand_name
        }
      }) || []

      // Marka bilgilerini batch olarak çek
      const brandIds = [...new Set(favoritesWithDetails.map(p => p.brand_id).filter(Boolean))]
      const brandMap: Record<number, string> = {}
      
      if (brandIds.length > 0) {
        try {
          const { data: brandsData } = await supabase
            .from('brands')
            .select('id, name')
            .in('id', brandIds)
          
          brandsData?.forEach(brand => {
            brandMap[brand.id] = brand.name
          })
        } catch (brandError) {
          console.warn('Marka bilgileri alınamadı:', brandError)
        }
      }

      const favoritesWithDetailsAndBrands = favoritesWithDetails.map(product => ({
        ...product,
        brand_name: product.brand_id ? brandMap[product.brand_id] || 'Bilinmeyen Marka' : 'Bilinmeyen Marka'
      }))

      // Fiyat değişikliklerini kontrol et
      const favoritesWithPriceChanges = await Promise.all(
        favoritesWithDetailsAndBrands.map(async (product) => {
          try {
            const { data: priceHistory } = await supabase
              .from('favorite_price_tracking')
              .select('*')
              .eq('product_id', product.id)
              .eq('notified', false)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            // Stok değişikliklerini kontrol et
            const { data: stockAlert } = await supabase
              .from('favorite_stock_tracking')
              .select('*')
              .eq('product_id', product.id)
              .eq('notified', false)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            return {
              ...product,
              price_change: priceHistory ? {
                type: priceHistory.change_type,
                percentage: priceHistory.change_percentage,
                amount: Math.abs(priceHistory.new_price - priceHistory.old_price)
              } : undefined,
              stock_status: stockAlert ? {
                current: stockAlert.current_stock,
                previous: stockAlert.previous_stock,
                type: stockAlert.alert_type
              } : undefined
            }
          } catch (trackingError) {
            console.warn('Fiyat/stok tracking hatası:', product.id, trackingError)
            return product
          }
        })
      )

      // Sıralama
      let sortedFavorites = favoritesWithPriceChanges

      // Kategori filtresi
      if (filterCategory !== 'all') {
        sortedFavorites = sortedFavorites.filter(fav => 
          fav.category_id?.toString() === filterCategory
        )
      }

      console.log('Favoriler işlendi:', sortedFavorites.length, 'ürün')
      setFavorites(sortedFavorites)

      // Ürün görsellerini yükle
      const imageMap: {[key: number]: string} = {}
      for (const favorite of sortedFavorites) {
        try {
          const { data } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('product_id', favorite.id)
            .order('order_index')
            .limit(1)

          if (data && data.length > 0 && data[0].image_url) {
            imageMap[favorite.id] = data[0].image_url
          } else {
            imageMap[favorite.id] = 'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&h=400&fit=crop&q=80'
          }
        } catch (imageError) {
          console.warn('Görsel yükleme hatası:', favorite.id, imageError)
          imageMap[favorite.id] = 'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&h=400&fit=crop&q=80'
        }
      }
      setProductImages(imageMap)
    } catch (error: any) {
      console.error('Favori ürünler yüklenirken hata:', error)
      console.error('Hata detayı:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      toast.error('Favori ürünler yüklenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    
    if (data) {
      setCategories(data)
    }
  }

  const handleRemoveFromFavorites = async (productId: number) => {
    try {
      await removeFromFavorites(productId)
      setFavorites(prev => prev.filter(fav => fav.id !== productId))
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    } catch (error) {
      console.error('Favori çıkarma hatası:', error)
      toast.error('Favorilerden çıkarılırken hata oluştu')
    }
  }

  const addSelectedToCart = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Sepete eklemek için ürün seçin')
      return
    }

    const selectedFavorites = favorites.filter(fav => selectedProducts.includes(fav.id))
    
    for (const favorite of selectedFavorites) {
      if (favorite.stock > 0) {
        addToCart(favorite, 1)
      }
    }

    toast.success(`${selectedFavorites.length} ürün sepete eklendi`)
    setSelectedProducts([])
  }

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAll = () => {
    setSelectedProducts(favorites.map(fav => fav.id))
  }

  const deselectAll = () => {
    setSelectedProducts([])
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Giriş Yapın</h2>
        <p className="text-gray-600 mb-8">Favorilerinizi görmek için giriş yapmalısınız.</p>
        <Link to="/giris">
          <Button>Giriş Yap</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            Favorilerim
            <Badge variant="secondary">{favorites.length}</Badge>
          </h1>
          <p className="text-gray-600 mt-2">Beğendiğiniz ürünler burada</p>
        </div>

        {/* Görünüm Modu */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filtreler ve Sıralama */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Sırala:</span>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Eklenme Tarihi</SelectItem>
              <SelectItem value="price_low">Fiyat (Düşük)</SelectItem>
              <SelectItem value="price_high">Fiyat (Yüksek)</SelectItem>
              <SelectItem value="name">İsim</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Kategori:</span>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {favorites.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedProducts.length === favorites.length}
                onCheckedChange={(checked) => {
                  if (checked) selectAll()
                  else deselectAll()
                }}
              />
              <span className="text-sm text-gray-700">
                Tümünü Seç ({selectedProducts.length})
              </span>
            </div>

            <Button
              onClick={addSelectedToCart}
              disabled={selectedProducts.length === 0}
              className="ml-auto"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Seçili Ürünleri Sepete Ekle
            </Button>
          </>
        )}
      </div>

      {/* Favori Ürünler */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Henüz favori ürününüz yok</h2>
          <p className="text-gray-600 mb-8">
            Beğendiğiniz ürünleri favorilere ekleyerek burada görebilirsiniz.
          </p>
          <Link to="/">
            <Button>Alışverişe Başla</Button>
          </Link>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Seçim Checkbox'u */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedProducts.includes(favorite.id)}
                  onCheckedChange={() => toggleProductSelection(favorite.id)}
                />
              </div>

              {/* Favori Butonu */}
              <button
                onClick={() => handleRemoveFromFavorites(favorite.id)}
                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition z-10"
                aria-label="Favorilerden Çıkar"
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </button>

              {/* Fiyat/Stok Bildirimleri */}
              {(favorite.price_change || favorite.stock_status) && (
                <div className="absolute bottom-2 left-2 right-2 z-10">
                  {favorite.price_change && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mb-1 ${
                      favorite.price_change.type === 'decrease' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {favorite.price_change.type === 'decrease' ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      %{favorite.price_change.percentage.toFixed(1)} {favorite.price_change.type === 'decrease' ? 'düştü' : 'arttı'}
                    </div>
                  )}
                  
                  {favorite.stock_status && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      favorite.stock_status.type === 'restocked' 
                        ? 'bg-green-100 text-green-800'
                        : favorite.stock_status.type === 'out_of_stock'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <Package className="w-3 h-3" />
                      {favorite.stock_status.type === 'restocked' && 'Stok geldi!'}
                      {favorite.stock_status.type === 'out_of_stock' && 'Stok bitti!'}
                      {favorite.stock_status.type === 'low_stock' && 'Az kaldı!'}
                    </div>
                  )}
                </div>
              )}

              {/* Ürün Görseli */}
              <Link 
                to={`/urun/${favorite.slug}`} 
                className={`block overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}
              >
                <div className={`relative bg-gray-100 ${viewMode === 'list' ? 'aspect-square' : 'aspect-square'} overflow-hidden`}>
                  <img
                    src={productImages[favorite.id] || 'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&h=400&fit=crop&q=80'}
                    alt={favorite.name}
                    className="w-full h-full object-contain p-4 transition-opacity duration-200 opacity-0"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&h=400&fit=crop&q=80'
                    }}
                    onLoad={(e) => {
                      e.currentTarget.classList.remove('opacity-0')
                      e.currentTarget.classList.add('opacity-100')
                    }}
                  />
                  <img
                    src={productImages[favorite.id] || 'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&h=400&fit=crop&q=80'}
                    alt={favorite.name}
                    className="w-full h-full object-contain p-4 transition-opacity duration-200 opacity-0"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&h=400&fit=crop&q=80'
                    }}
                    onLoad={(e) => {
                      e.currentTarget.classList.remove('opacity-0')
                      e.currentTarget.classList.add('opacity-100')
                    }}
                  />
                </div>
              </Link>

              {/* Ürün Bilgileri */}
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Link to={`/urun/${favorite.slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-blue-700 transition line-clamp-2">
                        {favorite.name}
                      </h3>
                    </Link>
                    {favorite.brand_name && (
                      <p className="text-sm text-gray-600 mt-1">{favorite.brand_name}</p>
                    )}
                  </div>
                </div>

                {/* Fiyat */}
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-900">
                    ₺{typeof favorite.base_price === 'number' && !isNaN(favorite.base_price) ? favorite.base_price.toFixed(2) : '0.00'}
                  </div>
                </div>

                {/* Stok Durumu */}
                <div className="text-sm mb-4">
                  {favorite.stock > 0 ? (
                    <span className="text-green-600 font-medium">✓ Stokta var ({favorite.stock} adet)</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗ Stokta yok</span>
                  )}
                </div>

                {/* Sepete Ekle Butonu */}
                <button
                  onClick={() => addToCart(favorite, 1)}
                  disabled={favorite.stock === 0}
                  className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Sepete Ekle</span>
                </button>

                {/* Eklenme Tarihi */}
                <p className="text-xs text-gray-500 mt-2">
                  Eklenme: {new Date(favorite.added_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Plus, 
  Minus,
  Check,
  X,
  TrendingUp,
  Package,
  Eye,
  Heart,
  Star,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import PDFUploadComponent from '../../components/PDFUploadComponent'

interface Product {
  id: number
  name: string
  description: string
  base_price: number
  calculated_bayi_price: number
  category_name: string
  brand_name: string
  stock: number
  image_urls: string[]
  slug: string
  discount_percentage: number
  savings_amount: number
  original_price: number
}

interface CartItem {
  product_id: number
  quantity: number
  product: Product
  savings_amount: number
}

interface FilterState {
  category: string
  brand: string
  priceRange: [number, number]
  inStock: boolean
  searchQuery: string
}

export default function BayiUrunler() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cartLoading, setCartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [showCart, setShowCart] = useState(false)
  const [bayiInfo, setBayiInfo] = useState<any>(null)
  const [showPDFUpload, setShowPDFUpload] = useState(false)
  const [pdfData, setPdfData] = useState<{ url: string; name: string } | null>(null)
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    brand: '',
    priceRange: [0, 10000],
    inStock: false,
    searchQuery: ''
  })

  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchBayiInfo()
      fetchCategoriesAndBrands()
    }
  }, [user])

  // Search handler for Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchProducts()
    }
  }

  const fetchBayiInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setBayiInfo(data)
    } catch (error) {
      console.error('Bayi bilgileri alınamadı:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Edge function'dan bayi ürünlerini çek
      const { data, error } = await supabase.functions.invoke('bayi-products', {
        body: { 
          user_id: user?.id,
          filters: filters
        }
      })

      if (error) {
        console.error('Edge function error:', error)
        throw error
      }

      if (data && data.success && data.data) {
        setProducts(data.data.products || [])
      } else if (data && data.error) {
        throw new Error(data.error.message)
      } else {
        console.warn('Unexpected response format:', data)
        setProducts([])
      }
    } catch (error: any) {
      console.error('Ürünler yüklenemedi:', error)
      setError(error.message || 'Ürünler yüklenirken hata oluştu')
      toast.error('Ürünler yüklenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'))
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoriesAndBrands = async () => {
    try {
      const [categoriesResult, brandsResult] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true),
        supabase.from('brands').select('*').eq('is_active', true)
      ])

      if (categoriesResult.data) setCategories(categoriesResult.data)
      if (brandsResult.data) setBrands(brandsResult.data)
    } catch (error) {
      console.error('Kategoriler/markalar yüklenemedi:', error)
    }
  }

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) return

    try {
      setCartLoading(true)

      const existingItem = cart.find(item => item.product_id === product.id)
      
      if (existingItem) {
        // Mevcut ürünü güncelle
        setCart(cart.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ))
      } else {
        // Yeni ürün ekle
        setCart([...cart, { 
          product_id: product.id, 
          quantity, 
          product,
          savings_amount: product.savings_amount
        }])
      }

      toast.success(`${product.name} sepete eklendi`)
    } catch (error) {
      console.error('Sepete eklenemedi:', error)
      toast.error('Ürün sepete eklenirken hata oluştu')
    } finally {
      setCartLoading(false)
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId))
    toast.success('Ürün sepetten çıkarıldı')
  }

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item => 
      item.product_id === productId 
        ? { ...item, quantity }
        : item
    ))
  }

  const toggleProductSelection = (productId: number) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const addSelectedToCart = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Lütfen en az bir ürün seçin')
      return
    }

    try {
      setCartLoading(true)

      const selectedItems = products.filter(p => selectedProducts.has(p.id))
      
      for (const product of selectedItems) {
        addToCart(product, 1)
      }

      setSelectedProducts(new Set())
      setShowCart(true)
      toast.success(`${selectedItems.length} ürün sepete eklendi`)
    } catch (error) {
      console.error('Toplu ekleme hatası:', error)
      toast.error('Ürünler sepete eklenirken hata oluştu')
    } finally {
      setCartLoading(false)
    }
  }

  const clearCart = async () => {
    setCart([])
    toast.success('Sepet temizlendi')
  }

  const createBulkOrder = async () => {
    if (cart.length === 0) {
      toast.error('Sepetiniz boş')
      return
    }

    // E-ticaret müşterileri için PDF kontrolü
    if (bayiInfo?.customer_type === 'eticaret' && !pdfData) {
      toast.error('E-ticaret müşterileri için PDF yüklemesi zorunludur')
      setShowPDFUpload(true)
      return
    }

    try {
      setCartLoading(true)

      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.calculated_bayi_price
        })),
        bayi_id: user?.id,
        total_amount: cart.reduce((sum, item) => 
          sum + (item.quantity * item.product.calculated_bayi_price), 0
        ),
        pdf_url: pdfData?.url || null,
        pdf_name: pdfData?.name || null
      }

      const { data, error } = await supabase.functions.invoke('create-bayi-order', {
        body: orderData
      })

      if (error) throw error

      toast.success('Siparişiniz oluşturuldu!')
      setCart([])
      setPdfData(null)
      setShowCart(false)
    } catch (error) {
      console.error('Sipariş oluşturulamadı:', error)
      toast.error('Sipariş oluşturulurken hata oluştu')
    } finally {
      setCartLoading(false)
    }
  }

  const getTotalSavings = () => {
    return cart.reduce((sum, item) => sum + (item.product.savings_amount * item.quantity), 0)
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => 
      sum + (item.quantity * item.product.calculated_bayi_price), 0
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600 text-center">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchProducts}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bayi Ürün Kataloğu</h1>
            <p className="text-blue-100 mb-4">
              Özel fiyatlarla toplu sipariş verin ve tasarruf edin
            </p>
            {bayiInfo && (
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-blue-500 px-3 py-1 rounded-full">
                  İndirim: %{bayiInfo.bayi_discount_percentage}
                </div>
                <div className="bg-green-500 px-3 py-1 rounded-full">
                  Seviye {bayiInfo.vip_level}
                </div>
              </div>
            )}
          </div>
          
          {/* Sepet Özeti */}
          <div className="text-right">
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Sepet ({cart.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Ürün ara (Enter ile ara)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              onKeyPress={handleSearchKeyPress}
            />
          </div>

          {/* Kategori */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          {/* Marka */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            value={filters.brand}
            onChange={(e) => setFilters({...filters, brand: e.target.value})}
          >
            <option value="">Tüm Markalar</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.name}>{brand.name}</option>
            ))}
          </select>

          {/* Stok Durumu */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-accent"
              checked={filters.inStock}
              onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
            />
            <span className="text-sm text-gray-700">Sadece Stokta Olanlar</span>
          </label>

          {/* Filtreleri Uygula */}
          <button
            onClick={fetchProducts}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center"
          >
            <Filter size={16} />
            Filtrele
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="text-yellow-600" size={20} />
              <span className="font-medium text-yellow-800">
                {selectedProducts.size} ürün seçildi
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addSelectedToCart}
                disabled={cartLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Sepete Ekle
              </button>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Seçimi Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {error ? 'Ürünler Yüklenemedi' : 'Ürün Bulunamadı'}
          </h3>
          <p className="text-gray-500 mb-6">
            {error 
              ? 'Lütfen daha sonra tekrar deneyin.' 
              : 'Seçilen kriterlere uygun ürün bulunamadı. Filtrelerinizi değiştirmeyi deneyin.'}
          </p>
          {!error && (
            <button
              onClick={() => setFilters({
                category: '',
                brand: '',
                priceRange: [0, 10000],
                inStock: false,
                searchQuery: ''
              })}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                {/* Selection Checkbox */}
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-accent"
                  />
                </div>

                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={product.image_urls[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Stock Warning */}
                  {product.stock < 10 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {product.stock}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {product.category_name} • {product.brand_name}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500 line-through">
                        ₺{product.original_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                        %{product.discount_percentage}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ₺{product.calculated_bayi_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/adet</span>
                      </div>
                      <div className="text-green-600 font-semibold text-sm">
                        Tasarruf: ₺{product.savings_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Stock & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package size={16} />
                      <span>{product.stock} adet</span>
                    </div>
                    
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => window.open(`/urun/${product.slug}`, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button
                        onClick={() => addToCart(product)}
                        disabled={cartLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Ekle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Sepetim</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Sepetiniz boş</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.product.image_urls[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          ₺{item.product.calculated_bayi_price.toLocaleString('tr-TR')} / adet
                        </p>
                        <p className="text-sm text-green-600">
                          Tasarruf: ₺{(item.product.savings_amount * item.quantity).toLocaleString('tr-TR')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold">
                          ₺{(item.quantity * item.product.calculated_bayi_price).toLocaleString('tr-TR')}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-gray-50">
                {/* PDF Yükleme Bilgisi */}
                {bayiInfo?.customer_type === 'eticaret' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                      <div className="flex-1">
                        <p className="text-sm text-yellow-800 font-medium">
                          E-ticaret müşterisi olarak pazaryeri fişi yüklemeniz gerekmektedir.
                        </p>
                        {pdfData ? (
                          <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                            <span className="text-sm text-green-800">PDF yüklendi: {pdfData.name}</span>
                            <button
                              onClick={() => setPdfData(null)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              Kaldır
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowPDFUpload(true)}
                            className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900"
                          >
                            PDF Yükle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span className="text-green-600">
                      ₺{getCartTotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Toplam Tasarruf:</span>
                    <span>
                      ₺{getTotalSavings().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={clearCart}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition"
                  >
                    Sepeti Temizle
                  </button>
                  <button
                    onClick={createBulkOrder}
                    disabled={cartLoading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={20} />
                    Toplu Sipariş Ver
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {showPDFUpload && (
        <PDFUploadComponent
          onUploadComplete={(url, name) => {
            setPdfData({ url, name })
            setShowPDFUpload(false)
            toast.success('PDF başarıyla yüklendi')
          }}
          onCancel={() => setShowPDFUpload(false)}
          required={bayiInfo?.customer_type === 'eticaret'}
        />
      )}
    </div>
  )
}
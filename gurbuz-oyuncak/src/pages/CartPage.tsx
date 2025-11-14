import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, Tag, X, Check, Gift } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import BatteryRecommendationCard from '@/components/BatteryRecommendationCard'

interface AppliedCoupon {
  id: number
  code: string
  discount_type: string
  discount_value: number
  discount_amount: number
  description: string | null
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, toggleGiftWrap, totalPrice, giftWrapFee, clearCart } = useCart()
  const { user } = useAuth()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [productImages, setProductImages] = useState<{[key: number]: string}>({})

  // Ürün görsellerini yükle
  useEffect(() => {
    const fetchImages = async () => {
      const imageMap: {[key: number]: string} = {}
      
      for (const item of items) {
        const { data } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', item.product.id)
          .order('order_index')
          .limit(1)

        if (data && data.length > 0) {
          imageMap[item.product.id] = data[0].image_url
        } else {
          imageMap[item.product.id] = 'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&h=400&fit=crop&q=80'
        }
      }
      
      setProductImages(imageMap)
    }

    if (items.length > 0) {
      fetchImages()
    }
  }, [items])

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Lütfen bir kupon kodu girin')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      // Kullanıcı tipini al
      let customerType = 'B2C'
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('customer_type')
          .eq('user_id', user.id)
          .single()
        
        if (profile) {
          customerType = profile.customer_type || 'B2C'
        }
      }

      // Sepetteki kategori ID'lerini topla
      const categoryIds = [...new Set(items
        .map(item => item.product.category_id)
        .filter(id => id !== null)
      )]

      // Kupon validasyonu
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: {
          coupon_code: couponCode,
          cart_total: totalPrice,
          user_id: user?.id || null,
          customer_type: customerType,
          category_ids: categoryIds
        }
      })

      if (error) {
        setCouponError('Kupon doğrulanamadı')
        return
      }

      if (data?.valid) {
        setAppliedCoupon(data.coupon)
        setCouponCode('')
        setCouponError('')
      } else {
        setCouponError(data?.error || 'Geçersiz kupon kodu')
        setAppliedCoupon(null)
      }
    } catch (error) {
      console.error('Kupon uygulama hatası:', error)
      setCouponError('Kupon uygulanırken bir hata oluştu')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const discountAmount = appliedCoupon?.discount_amount || 0
  const finalTotal = Math.max(0, totalPrice - discountAmount)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 text-center">
        <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Sepetiniz Boş</h2>
        <p className="text-gray-600 mb-6 text-sm md:text-base">Alışverişe başlamak için ürünleri sepete ekleyin</p>
        <Link to="/" className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 inline-block touch-manipulation text-sm md:text-base transition-all duration-200 ease-in-out hover:shadow-lg active:scale-95">
          Alışverişe Başla
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Alışveriş Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const price = item.product.base_price * (1 + item.product.tax_rate / 100)
            const itemTotal = price * item.quantity

            return (
              <div key={item.product.id} className="bg-white p-3 md:p-4 rounded-lg shadow-lg">
                <div className="flex gap-3 md:gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    <img
                      src={productImages[item.product.id] || 'https://images.unsplash.com/photo-1581954043710-0ba6d6f1deb0?w=400&h=400&fit=crop&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/96x96?text=Ürün'
                      }}
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <Link to={`/urun/${item.product.slug}`} className="font-semibold hover:text-blue-700 block mb-2 text-sm md:text-base leading-tight">
                      {item.product.name}
                    </Link>
                    <p className="text-xs md:text-sm text-gray-600 mb-3">Birim Fiyat: {price.toFixed(2)} TL</p>
                    
                    {/* Hediye Paketi Seçeneği */}
                    <div className="mb-3">
                      <button
                        onClick={() => toggleGiftWrap(item.product.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          item.giftWrap 
                            ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        <Gift size={16} />
                        <span>Hediye Paketi (+15 TL)</span>
                        {item.giftWrap && <Check size={16} className="ml-auto" />}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-9 h-9 md:w-8 md:h-8 border rounded hover:bg-gray-100 flex items-center justify-center touch-manipulation transition-all duration-200 ease-in-out hover:shadow-md active:scale-95"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold w-12 text-center min-w-[48px]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-9 h-9 md:w-8 md:h-8 border rounded hover:bg-gray-100 flex items-center justify-center touch-manipulation transition-all duration-200 ease-in-out hover:shadow-md active:scale-95"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={16} />
                      </button>
                      <p className="text-xs text-gray-500 ml-1 md:ml-2">
                        Stok: {item.product.stock}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between items-end min-w-[80px]">
                    <p className="text-lg md:text-xl font-bold text-blue-700 mb-2">{itemTotal.toFixed(2)} TL</p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm md:text-base touch-manipulation transition-all duration-200 ease-in-out hover:shadow-md active:scale-95"
                    >
                      <Trash2 size={16} />
                      <span className="hidden md:inline">Sil</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Pil Önerileri */}
          <BatteryRecommendationCard />

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 flex items-center gap-2 py-2 touch-manipulation"
          >
            <Trash2 size={16} />
            Sepeti Temizle
          </button>
        </div>

        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg sticky top-20 lg:top-24 space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-bold">Sipariş Özeti</h3>
            
            {/* Kupon Bölümü */}
            <div className="border-t border-b py-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="text-blue-700 flex-shrink-0" size={18} />
                <h4 className="font-semibold text-sm md:text-base">İndirim Kuponu</h4>
              </div>

              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Check className="text-green-600 flex-shrink-0" size={16} />
                      <span className="font-semibold text-green-800 text-sm md:text-base truncate">{appliedCoupon.code}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
                      title="Kuponu kaldır"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {appliedCoupon.description && (
                    <p className="text-xs text-green-700">{appliedCoupon.description}</p>
                  )}
                  <p className="text-sm font-semibold text-green-800">
                    -{appliedCoupon.discount_amount.toFixed(2)} TL
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Kupon kodunu girin"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-accent focus:border-accent uppercase touch-manipulation transition-all duration-200 ease-in-out hover:shadow-md focus:shadow-lg"
                      disabled={couponLoading}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-blue-700 text-white px-4 py-3 rounded-lg hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold whitespace-nowrap touch-manipulation transition-all duration-200 ease-in-out hover:shadow-lg active:scale-95"
                    >
                      {couponLoading ? 'Kontrol...' : 'Uygula'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600">{couponError}</p>
                  )}
                  <div className="text-xs text-gray-500 space-y-2">
                    <p className="font-semibold">Popüler kuponlar:</p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      <button
                        onClick={() => setCouponCode('WELCOME10')}
                        className="bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 touch-manipulation"
                      >
                        WELCOME10
                      </button>
                      <button
                        onClick={() => setCouponCode('YENI2025')}
                        className="bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 touch-manipulation"
                      >
                        YENI2025
                      </button>
                      <button
                        onClick={() => setCouponCode('KASIM25')}
                        className="bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 touch-manipulation"
                      >
                        KASIM25
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fiyat Özeti */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span>{(totalPrice - giftWrapFee).toFixed(2)} TL</span>
              </div>
              {giftWrapFee > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span className="flex items-center gap-1">
                    <Gift size={14} />
                    Hediye Paketi:
                  </span>
                  <span>+{giftWrapFee.toFixed(2)} TL</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>İndirim ({appliedCoupon.code}):</span>
                  <span>-{discountAmount.toFixed(2)} TL</span>
                </div>
              )}
              <div className="flex justify-between text-green-600">
                <span>Kargo:</span>
                <span>Ücretsiz</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Toplam:</span>
                <span className="text-blue-700">{finalTotal.toFixed(2)} TL</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">KDV Dahil</p>
              {appliedCoupon && (
                <p className="text-xs text-green-600 mt-1">
                  {discountAmount.toFixed(2)} TL tasarruf ettiniz!
                </p>
              )}
            </div>

            <Link
              to="/odeme"
              state={{ appliedCoupon }}
              className="w-full bg-blue-700 text-white py-3.5 md:py-3 rounded-lg font-bold hover:bg-blue-800 block text-center text-sm md:text-base touch-manipulation transition-all duration-200 ease-in-out hover:shadow-lg active:scale-95"
            >
              Ödemeye Geç
            </Link>

            <Link
              to="/"
              className="w-full border border-blue-700 text-blue-700 py-3 md:py-2.5 rounded-lg font-bold hover:bg-blue-50 block text-center text-sm md:text-base touch-manipulation transition-all duration-200 ease-in-out hover:shadow-md active:scale-95"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

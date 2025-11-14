import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, Tag, AlertCircle, X } from 'lucide-react'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('paytr')
  const [showPayTRModal, setShowPayTRModal] = useState(false)
  const [iframeToken, setIframeToken] = useState('')
  
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postal_code: ''
  })

  // PayTR callback listener
  useEffect(() => {
    const handlePayTRCallback = (event: MessageEvent) => {
      // PayTR'den gelen mesajları dinle
      if (event.data && typeof event.data === 'string') {
        if (event.data.includes('success')) {
          // Ödeme başarılı
          setShowPayTRModal(false)
          clearCart()
          alert('🎉 TEST MODE - Ödeme Simülasyonu Başarılı!\n\nSiparişiniz oluşturuldu.')
          navigate('/')
        } else if (event.data.includes('failed')) {
          // Ödeme başarısız
          setShowPayTRModal(false)
          alert('❌ Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.')
        }
      }
    }

    window.addEventListener('message', handlePayTRCallback)
    return () => window.removeEventListener('message', handlePayTRCallback)
  }, [clearCart, navigate])

  async function applyCoupon() {
    if (!couponCode) return
    
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .maybeSingle()

    if (data) {
      if (data.discount_type === 'percentage') {
        setDiscount((totalPrice * data.discount_value) / 100)
      } else {
        setDiscount(data.discount_value)
      }
      alert('Kupon uygulandı!')
    } else {
      alert('Geçersiz kupon kodu')
    }
  }

  async function handleCheckout() {
    if (!user) {
      alert('Lütfen önce giriş yapın')
      navigate('/giris')
      return
    }

    if (!shippingAddress.full_name || !shippingAddress.phone || !shippingAddress.address) {
      alert('Lütfen teslimat bilgilerini eksiksiz doldurun')
      return
    }

    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        variant_id: item.variant_id || null
      }))

      // Önce sipariş oluştur
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          items: orderItems,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          coupon_code: couponCode || null
        }
      })

      if (error) throw error

      const orderData = data.data

      // PayTR ile ödeme başlat (Test mode)
      if (paymentMethod === 'paytr') {
        const paytrItems = items.map(item => ({
          product_name: item.product.name,
          unit_price: item.product.base_price,
          quantity: item.quantity
        }))

        const { data: paytrData, error: paytrError } = await supabase.functions.invoke('paytr-payment', {
          body: {
            order_id: orderData.order_id,
            user_email: user.email,
            user_name: shippingAddress.full_name,
            user_phone: shippingAddress.phone,
            user_address: shippingAddress.address,
            items: paytrItems,
            total_amount: finalTotal
          }
        })

        if (paytrError) {
          console.error('PayTR API hatası:', paytrError)
          throw new Error(`Ödeme ağ geçidiyle iletişim kurulamadı: ${paytrError.message || 'Bilinmeyen hata'}`)
        }

        const paytrResponse = paytrData.data

        // PayTR iframe token'ı al ve modal'ı aç
        if (paytrResponse && paytrResponse.status === 'success' && paytrResponse.token) {
          setIframeToken(paytrResponse.token)
          setShowPayTRModal(true)
          setLoading(false)
          
          // Sipariş oluşturuldu, modal'da ödeme yapılacak
          // clearCart işlemini ödeme başarılı olunca yapacağız
        } else {
          console.error('PayTR yanıt hatası:', paytrResponse)
          throw new Error(paytrResponse?.message || 'Ödeme başlatılamadı. Lütfen daha sonra tekrar deneyin.')
        }
      } else {
        // Banka havalesi
        clearCart()
        alert(`Sipariş başarıyla oluşturuldu! Sipariş No: ${orderData.order_number}\nKazanılan Puan: ${orderData.loyalty_points_earned}`)
        navigate('/')
      }
    } catch (error: any) {
      console.error('Sipariş hatası:', error)
      alert('Sipariş oluşturulurken bir hata oluştu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const finalTotal = totalPrice - discount

  if (items.length === 0) {
    navigate('/sepet')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* PayTR Test Mode Uyarısı */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>🧪 PayTR Test Modu:</strong> Ödeme sistemi test modunda çalışmaktadır. Gerçek ödeme alınmayacak, sipariş simüle edilecektir.
            </p>
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Ödeme</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">{/* Grid devamı... */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="text-blue-700" />
              Teslimat Bilgileri
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Ad Soyad"
                value={shippingAddress.full_name}
                onChange={(e) => setShippingAddress({...shippingAddress, full_name: e.target.value})}
                className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ease-in-out hover:shadow-md hover:border-accent/50 focus:shadow-lg"
                required
              />
              <input
                type="tel"
                placeholder="Telefon"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ease-in-out hover:shadow-md hover:border-accent/50 focus:shadow-lg"
                required
              />
              <textarea
                placeholder="Adres"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:shadow-sm focus:shadow-md h-24 resize-none"
                required
              />
              <input
                type="text"
                placeholder="İl"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ease-in-out hover:shadow-md hover:border-accent/50 focus:shadow-lg"
              />
              <input
                type="text"
                placeholder="İlçe"
                value={shippingAddress.district}
                onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ease-in-out hover:shadow-md hover:border-accent/50 focus:shadow-lg"
              />
              <input
                type="text"
                placeholder="Posta Kodu"
                value={shippingAddress.postal_code}
                onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ease-in-out hover:shadow-md hover:border-accent/50 focus:shadow-lg"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="text-blue-700" />
              İndirim Kuponu
            </h2>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Kupon Kodu"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out hover:shadow-sm focus:shadow-md"
              />
              <button
                onClick={applyCoupon}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
              >
                Uygula
              </button>
            </div>
            {discount > 0 && (
              <p className="text-green-600 mt-2">İndirim: -{discount.toFixed(2)} TL</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="text-blue-700" />
              Ödeme Yöntemi
              <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">TEST MODE</span>
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="payment" 
                  value="paytr" 
                  checked={paymentMethod === 'paytr'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3" 
                />
                <div className="flex-1">
                  <p className="font-semibold">PayTR Online Ödeme (Test)</p>
                  <p className="text-sm text-gray-600">Kredi kartı ile güvenli ödeme - Test Modu</p>
                </div>
              </label>
              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="payment" 
                  value="bank" 
                  checked={paymentMethod === 'bank'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3" 
                />
                <div>
                  <p className="font-semibold">Banka Havalesi</p>
                  <p className="text-sm text-gray-600">Hesap bilgileri siparişten sonra gönderilir</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-24">
            <h3 className="text-xl font-bold mb-4">Sipariş Özeti</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Ürünler ({items.length}):</span>
                <span>{totalPrice.toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Kargo:</span>
                <span>Ücretsiz</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>İndirim:</span>
                  <span>-{discount.toFixed(2)} TL</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-2xl font-bold">
                <span>Toplam:</span>
                <span className="text-blue-700">{finalTotal.toFixed(2)} TL</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">KDV Dahil</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-all duration-300 ease-in-out hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'İşleniyor...' : 'Siparişi Tamamla'}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Sipariş vererek kullanım koşullarını kabul etmiş olursunuz
            </p>
          </div>
        </div>
      </div>

      {/* PayTR Payment Modal */}
      {showPayTRModal && iframeToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <CreditCard className="text-blue-700" />
                <h2 className="text-xl font-bold">PayTR Güvenli Ödeme</h2>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">
                  TEST MODE
                </span>
              </div>
              <button
                onClick={() => {
                  setShowPayTRModal(false)
                  setIframeToken('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - PayTR Gerçek Iframe */}
            <div className="flex-1 overflow-hidden relative">
              <iframe
                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                className="w-full h-full min-h-[600px]"
                frameBorder="0"
                scrolling="yes"
                title="PayTR Ödeme"
                allow="payment"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
              <p>🔒 PayTR güvenli ödeme sistemi ile işleminiz güvence altındadır.</p>
              <p className="text-xs mt-1 text-yellow-600">⚠️ Test Modu: Gerçek ödeme yapılmayacaktır.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, Home } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    // Sepeti temizle (ödeme başarılı olduğu için)
    clearCart()
    
    // İşlem tamamlandı
    setProcessing(false)

    // URL'den parametreleri al
    const merchantOid = searchParams.get('merchant_oid')
    const status = searchParams.get('status')
    const testMode = searchParams.get('test_mode')

    console.log('Ödeme başarılı:', { merchantOid, status, testMode })
  }, [clearCart, searchParams])

  if (processing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Ödeme işleminiz kontrol ediliyor...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Başarı Kartı */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-24 h-24 text-green-600 mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ödeme Başarılı!
          </h1>
          
          <p className="text-gray-600 mb-2">
            {searchParams.get('test_mode') === 'true' ? '🧪 TEST MODE: ' : ''}
            Siparişiniz başarıyla oluşturuldu.
          </p>
          
          {searchParams.get('merchant_oid') && (
            <p className="text-sm text-gray-500 mb-8">
              Sipariş No: <span className="font-mono font-semibold">{searchParams.get('merchant_oid')}</span>
            </p>
          )}

          {/* Bilgilendirme */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 text-left">
            <div className="flex">
              <Package className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Siparişiniz hazırlanmaya başlandı. E-posta adresinize sipariş detayları gönderildi.
                </p>
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/siparislerim')}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Siparişlerim
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Ana Sayfa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

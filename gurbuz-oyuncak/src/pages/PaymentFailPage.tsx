import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { XCircle, Home, ShoppingCart } from 'lucide-react'

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // URL'den parametreleri al
    const merchantOid = searchParams.get('merchant_oid')
    const status = searchParams.get('status')
    const testMode = searchParams.get('test_mode')

    console.log('Ödeme başarısız:', { merchantOid, status, testMode })
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Hata Kartı */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <XCircle className="w-24 h-24 text-red-600 mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ödeme Başarısız
          </h1>
          
          <p className="text-gray-600 mb-2">
            {searchParams.get('test_mode') === 'true' ? '🧪 TEST MODE: ' : ''}
            Ödeme işleminiz tamamlanamadı.
          </p>
          
          {searchParams.get('merchant_oid') && (
            <p className="text-sm text-gray-500 mb-8">
              İşlem Ref: <span className="font-mono font-semibold">{searchParams.get('merchant_oid')}</span>
            </p>
          )}

          {/* Bilgilendirme */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 text-left">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Ödeme işlemi sırasında bir sorun oluştu. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Sorun devam ederse, lütfen farklı bir ödeme yöntemi deneyin veya bizimle iletişime geçin.
                </p>
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/sepet')}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Sepete Dön
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

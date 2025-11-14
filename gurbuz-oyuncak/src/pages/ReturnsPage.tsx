import { Package, RefreshCw, Clock, CheckCircle, AlertCircle, TruckIcon } from 'lucide-react'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">İade ve Değişim</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Memnuniyetiniz bizim önceliğimiz. İade ve değişim süreçlerinizi kolayca yönetin.
          </p>
        </div>

        {/* İade Koşulları */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="text-blue-600" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">İade Koşulları</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span>Ürün teslim tarihinden itibaren 14 gün içinde iade edilebilir</span>
            </p>
            <p className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span>Ürün kullanılmamış, ambalajı açılmamış ve etiketleri sökülmemiş olmalıdır</span>
            </p>
            <p className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span>Elektronik ürünlerde test için açılan ambalajlar kabul edilir</span>
            </p>
            <p className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span>İndirimli ve kampanyalı ürünler de iade edilebilir</span>
            </p>
            <p className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span>Fatura ve sevk irsaliyesi ürünle birlikte gönderilmelidir</span>
            </p>
          </div>
        </div>

        {/* İade Edilemeyen Ürünler */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="text-red-600" size={32} />
            <h2 className="text-2xl font-bold text-red-800">İade Edilemeyen Ürünler</h2>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Hijyen ve sağlık nedeniyle ambalajı açılmış oyuncaklar (peluş oyuncaklar, bebek emzikleri vb.)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Kişiye özel üretilmiş veya özelleştirilmiş ürünler</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>DVD, CD, kitap gibi nitelikteki ürünler (ambalaj açılmışsa)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>Hasarlı veya eksik parçalı ürünler</span>
            </li>
          </ul>
        </div>

        {/* İade Süreci */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            İade Süreci Nasıl İşler?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Başvuru</h3>
              <p className="text-sm text-gray-600">
                Profil sayfanızdan veya müşteri hizmetlerimizden iade talebi oluşturun
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Onay</h3>
              <p className="text-sm text-gray-600">
                İade talebiniz 24 saat içinde değerlendirilir ve onaylanır
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Kargo</h3>
              <p className="text-sm text-gray-600">
                Ürünü kargo firmasına teslim edin (kargo ücreti tarafımızdan karşılanır)
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">İade</h3>
              <p className="text-sm text-gray-600">
                Ürün kontrolünden sonra 3-5 iş günü içinde ödeme iadeniz yapılır
              </p>
            </div>
          </div>
        </div>

        {/* Değişim */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-purple-600" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Ürün Değişimi</h2>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              Aldığınız üründe herhangi bir sorun varsa veya farklı bir model ile değiştirmek istiyorsanız, 
              14 gün içinde ücretsiz değişim hakkınız bulunmaktadır.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <span>Hasarlı veya hatalı ürünler hemen değiştirilir</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <span>Beden veya renk değişimi ücretsizdir</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <span>Model değişikliğinde fiyat farkı varsa ek ödeme veya iade yapılır</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Kargo ve Süre */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <TruckIcon className="text-blue-600" size={28} />
              <h3 className="text-2xl font-bold text-gray-800">Kargo Bilgileri</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                <span>İade kargo ücreti tarafımızdan karşılanır</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                <span>Anlaşmalı kargo firmaları: Aras Kargo, MNG Kargo, Yurtiçi Kargo</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                <span>Kargo takip numarası SMS ve e-posta ile gönderilir</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-purple-600" size={28} />
              <h3 className="text-2xl font-bold text-gray-800">İade Süreleri</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                <span>İade talebi onayı: 24 saat içinde</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                <span>Ürün kontrolü: Depoya ulaştıktan sonra 1-2 iş günü</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={18} />
                <span>Ödeme iadesi: Kontrol sonrası 3-5 iş günü</span>
              </li>
            </ul>
          </div>
        </div>

        {/* İletişim */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            İade ve Değişim için Destek
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            İade ve değişim süreçlerinizde size yardımcı olmaktan mutluluk duyarız. 
            Müşteri hizmetlerimiz hafta içi 09:00-18:00 saatleri arasında hizmetinizdedir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:08501234567" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              0850 123 45 67
            </a>
            <a 
              href="mailto:iade@gurbuzoyuncak.com" 
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              iade@gurbuzoyuncak.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

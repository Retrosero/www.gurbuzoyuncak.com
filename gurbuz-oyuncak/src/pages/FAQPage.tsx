import { HelpCircle, ChevronDown, ChevronUp, Package, CreditCard, TruckIcon, Shield, RefreshCw, Users } from 'lucide-react'
import { useState } from 'react'

interface FAQ {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü')

  const categories = [
    { name: 'Tümü', icon: HelpCircle, color: 'gray' },
    { name: 'Sipariş', icon: Package, color: 'blue' },
    { name: 'Ödeme', icon: CreditCard, color: 'green' },
    { name: 'Kargo', icon: TruckIcon, color: 'purple' },
    { name: 'İade', icon: RefreshCw, color: 'orange' },
    { name: 'Üyelik', icon: Users, color: 'pink' }
  ]

  const faqs: FAQ[] = [
    {
      category: 'Sipariş',
      question: 'Siparişimi nasıl takip edebilirim?',
      answer: 'Siparişinizi takip etmek için profilinize giriş yapıp "Siparişlerim" bölümüne gitebilirsiniz. Kargo takip numaranız SMS ve e-posta ile de tarafınıza iletilir.'
    },
    {
      category: 'Sipariş',
      question: 'Siparişimi iptal edebilir miyim?',
      answer: 'Siparişiniz kargoya verilmeden önce iptal edebilirsiniz. Profilinizden sipariş detaylarına girerek iptal talebi oluşturabilirsiniz. Kargoya verildikten sonra iade sürecini başlatmanız gerekir.'
    },
    {
      category: 'Sipariş',
      question: 'Minimum sipariş tutarı var mı?',
      answer: 'Hayır, minimum sipariş tutarı bulunmamaktadır. İstediğiniz tutarda alışveriş yapabilirsiniz. 500 TL ve üzeri alışverişlerde kargo ücretsizdir.'
    },
    {
      category: 'Sipariş',
      question: 'Yanlış adres yazdım, değiştirebilir miyim?',
      answer: 'Siparişiniz kargoya verilmeden önce müşteri hizmetlerimizle iletişime geçerek adresinizi değiştirebilirsiniz. Kargoya verildikten sonra adres değişikliği mümkün değildir.'
    },
    {
      category: 'Ödeme',
      question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      answer: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini kabul ediyoruz. Taksit imkanları için kredi kartı ile ödeme yapabilirsiniz.'
    },
    {
      category: 'Ödeme',
      question: 'Taksit yapabilir miyim?',
      answer: 'Evet, tüm kredi kartlarına 3, 6, 9 ve 12 taksit imkanı sunuyoruz. Bazı bankalarla özel kampanyalarda daha fazla taksit seçeneği bulunabilir.'
    },
    {
      category: 'Ödeme',
      question: 'Havale ile ödeme yaparsam ne zaman kargoya verilir?',
      answer: 'Havale/EFT ödemelerinizin banka hesabımıza geçmesi sonrasında siparişiniz kargoya verilir. Bu süreç genellikle 1-2 iş günü sürmektedir.'
    },
    {
      category: 'Ödeme',
      question: 'Ödeme güvenli mi?',
      answer: 'Tüm ödemeleriniz SSL sertifikası ile şifrelenmiş güvenli bağlantıdan yapılır. Kredi kartı bilgileriniz bizde saklanmaz, 3D Secure ile güvenli ödeme yaparsınız.'
    },
    {
      category: 'Kargo',
      question: 'Kargo ücreti ne kadar?',
      answer: '500 TL altı siparişlerde kargo ücreti 29.90 TL\'dir. 500 TL ve üzeri alışverişlerinizde kargo tamamen ücretsizdir.'
    },
    {
      category: 'Kargo',
      question: 'Siparişim ne zaman kargoya verilir?',
      answer: 'Stokta bulunan ürünler için aynı gün veya en geç 1 iş günü içinde kargoya verilir. Özel sipariş ürünler için süre değişkenlik gösterebilir.'
    },
    {
      category: 'Kargo',
      question: 'Hangi kargo firması ile çalışıyorsunuz?',
      answer: 'Aras Kargo, MNG Kargo ve Yurtiçi Kargo ile anlaşmalıyız. Bölgenize göre en uygun kargo firması otomatik seçilir.'
    },
    {
      category: 'Kargo',
      question: 'Yurtdışına gönderi yapıyor musunuz?',
      answer: 'Şu anda sadece Türkiye içi teslimat yapıyoruz. Yurtdışı gönderiler için lütfen müşteri hizmetlerimizle iletişime geçin.'
    },
    {
      category: 'İade',
      question: 'İade süresi ne kadar?',
      answer: 'Ürün teslim tarihinden itibaren 14 gün içinde koşulsuz iade hakkınız bulunmaktadır. Ürün kullanılmamış ve ambalajı açılmamış olmalıdır.'
    },
    {
      category: 'İade',
      question: 'İade kargo ücreti kim tarafından ödeniyor?',
      answer: 'İade kargo ücreti tarafımızdan karşılanmaktadır. Size kargo kodu gönderilir, anlaşmalı kargoya ücretsiz teslim edebilirsiniz.'
    },
    {
      category: 'İade',
      question: 'İade param ne zaman hesabıma geçer?',
      answer: 'İade ettiğiniz ürün depomuzda kontrol edildikten sonra 3-5 iş günü içinde ödeme iadeniz yapılır. Banka süreçlerine bağlı olarak hesabınıza yansıma süresi değişebilir.'
    },
    {
      category: 'İade',
      question: 'Açılmış ürünü iade edebilir miyim?',
      answer: 'Elektronik ürünlerde test için açılan ambalajlar kabul edilir. Ancak hijyen ve sağlık nedeniyle ambalajı açılmış oyuncaklar (peluş, emzik vb.) iade edilemez.'
    },
    {
      category: 'Üyelik',
      question: 'Üye olmadan alışveriş yapabilir miyim?',
      answer: 'Hayır, güvenliğiniz ve sipariş takibi için üye olmadan alışveriş yapılamamaktadır. Üyelik işlemi çok hızlı ve kolaydır.'
    },
    {
      category: 'Üyelik',
      question: 'Şifremi unuttum, ne yapmalıyım?',
      answer: 'Giriş sayfasında "Şifremi Unuttum" bağlantısına tıklayarak e-posta adresinize şifre sıfırlama linki gönderebilirsiniz.'
    },
    {
      category: 'Üyelik',
      question: 'Üyelik ücretli mi?',
      answer: 'Hayır, üyelik tamamen ücretsizdir. Üye olarak kampanyalardan haberdar olabilir, sipariş geçmişinizi görebilir ve hızlı alışveriş yapabilirsiniz.'
    },
    {
      category: 'Üyelik',
      question: 'Sadakat puanları nasıl kazanılır?',
      answer: 'Her alışverişinizde toplam tutarın %2\'si kadar puan kazanırsınız. 100 puan = 1 TL değerindedir. Puanlarınızı bir sonraki alışverişinizde kullanabilirsiniz.'
    }
  ]

  const filteredFAQs = selectedCategory === 'Tümü' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white mb-12">
          <div className="flex items-center gap-4 mb-4">
            <HelpCircle size={48} />
            <h1 className="text-4xl md:text-5xl font-bold">Sık Sorulan Sorular</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl">
            Merak ettiklerinizin cevaplarını bulun. Aradığınızı bulamadıysanız müşteri hizmetlerimizle iletişime geçin.
          </p>
        </div>

        {/* Kategori Filtreleri */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = selectedCategory === cat.name
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? `bg-${cat.color}-600 text-white shadow-md`
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* FAQ Listesi */}
        <div className="space-y-3 mb-12">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      faq.category === 'Sipariş' ? 'bg-blue-100 text-blue-700' :
                      faq.category === 'Ödeme' ? 'bg-green-100 text-green-700' :
                      faq.category === 'Kargo' ? 'bg-purple-100 text-purple-700' :
                      faq.category === 'İade' ? 'bg-orange-100 text-orange-700' :
                      'bg-pink-100 text-pink-700'
                    }`}>
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {faq.question}
                  </h3>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="text-gray-400 flex-shrink-0 ml-4" size={24} />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0 ml-4" size={24} />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* İletişim Kutusu */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <Shield className="mx-auto mb-4 text-blue-600" size={48} />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Sorunuz Yanıtlanmadı mı?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Müşteri hizmetlerimiz her zaman size yardımcı olmak için hazır. 
            Hafta içi 09:00-18:00 saatleri arasında bize ulaşabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/iletisim" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              İletişim Formu
            </a>
            <a 
              href="tel:08501234567" 
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 rounded-lg font-medium transition-colors border border-gray-300"
            >
              0850 123 45 67
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

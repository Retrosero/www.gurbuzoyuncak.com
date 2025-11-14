import { Briefcase, Users, Heart, TrendingUp, Mail, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CareersPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simülasyon - gerçek uygulamada API'ye gönderilecek
    toast.success('Başvurunuz alındı! En kısa sürede size dönüş yapacağız.')
    setFormData({ name: '', email: '', phone: '', position: '', message: '' })
  }

  const openPositions = [
    {
      title: 'E-Ticaret Uzmanı',
      department: 'Dijital Pazarlama',
      location: 'İstanbul - Hibrit',
      type: 'Tam Zamanlı',
      description: 'E-ticaret operasyonlarını yönetecek, dijital kampanyalar geliştirecek deneyimli ekip arkadaşı arıyoruz.'
    },
    {
      title: 'Müşteri Hizmetleri Temsilcisi',
      department: 'Müşteri İlişkileri',
      location: 'İstanbul - Ofis',
      type: 'Tam Zamanlı',
      description: 'Müşterilerimize en iyi hizmeti sunacak, sorun çözme becerileri yüksek ekip üyeleri arıyoruz.'
    },
    {
      title: 'Depo ve Lojistik Görevlisi',
      department: 'Lojistik',
      location: 'İstanbul - Ofis',
      type: 'Tam Zamanlı',
      description: 'Depo operasyonlarını yönetecek, sevkiyat süreçlerini koordine edecek personel alımı yapıyoruz.'
    },
    {
      title: 'Satış Danışmanı',
      department: 'Satış',
      location: 'İstanbul - Ofis',
      type: 'Tam Zamanlı',
      description: 'B2B ve B2C müşterilerimize satış desteği sağlayacak, yeni müşteri kazanımında rol alacak ekip arkadaşı arıyoruz.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kariyer Fırsatları</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Gürbüz Oyuncak ailesine katılın! Dinamik ekibimizle birlikte çocukların hayallerine dokunun.
          </p>
        </div>

        {/* Neden Biz */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Neden Gürbüz Oyuncak?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="text-blue-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Kariyer Gelişimi</h3>
              <p className="text-gray-600 text-sm">
                Eğitim programları ve terfi fırsatları ile kariyerinizi geliştirin
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Users className="text-green-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Güçlü Ekip</h3>
              <p className="text-gray-600 text-sm">
                Deneyimli ve destekleyici ekip arkadaşları ile çalışın
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Heart className="text-purple-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Yan Haklar</h3>
              <p className="text-gray-600 text-sm">
                Sağlık sigortası, performans primleri ve daha fazlası
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="text-orange-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Büyüyen Şirket</h3>
              <p className="text-gray-600 text-sm">
                30 yıllık tecrübe ile sürekli büyüyen bir şirkette çalışın
              </p>
            </div>
          </div>
        </div>

        {/* Açık Pozisyonlar */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Açık Pozisyonlar</h2>
          <div className="space-y-4">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {position.department}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {position.location}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {position.type}
                      </span>
                    </div>
                    <p className="text-gray-600">{position.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, position: position.title }))
                      document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    Başvur
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Başvuru Formu */}
        <div id="application-form" className="bg-white rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Send className="text-blue-600" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Başvuru Formu</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-blue-500"
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-blue-500"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-blue-500"
                  placeholder="0555 123 45 67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başvurulan Pozisyon *
                </label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-blue-500"
                >
                  <option value="">Pozisyon Seçiniz</option>
                  {openPositions.map((pos, idx) => (
                    <option key={idx} value={pos.title}>{pos.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesajınız
              </label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-blue-500"
                placeholder="Kendinizden bahsedin, deneyimlerinizi paylaşın..."
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Başvuruyu Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

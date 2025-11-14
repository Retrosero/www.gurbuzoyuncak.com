import { Building2, Users, Award, Heart, Target, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hakkımızda</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            1995'ten beri çocukların hayal dünyasına renk katıyor, ailelerin güvenle tercih ettiği kaliteli oyuncaklar sunuyoruz.
          </p>
        </div>

        {/* Hikayemiz */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Building2 className="text-blue-600" size={32} />
            Hikayemiz
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              Gürbüz Oyuncak, 1995 yılında İstanbul'da küçük bir aile işletmesi olarak kuruldu. 
              Kurucumuz Mehmet Gürbüz'ün "Her çocuk kaliteli oyuncağa ulaşabilmeli" vizyonu ile 
              yola çıktık ve bugün Türkiye'nin en güvenilir oyuncak markalarından biri haline geldik.
            </p>
            <p className="text-gray-700 mb-4">
              30 yıllık tecrübemizle, 10.000'den fazla ürün çeşidimiz ve 500.000'i aşkın mutlu müşterimizle 
              sektörde öncü konumdayız. Sadece oyuncak satmıyor, çocukların gelişimine katkı sağlayan, 
              hayal gücünü destekleyen ürünler sunuyoruz.
            </p>
          </div>
        </div>

        {/* Değerlerimiz */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-blue-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Kalite Odaklılık</h3>
            <p className="text-gray-600">
              Tüm ürünlerimiz CE ve TSE sertifikalıdır. Çocukların sağlığı ve güvenliği bizim için önceliklidir.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Users className="text-green-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Müşteri Memnuniyeti</h3>
            <p className="text-gray-600">
              Müşterilerimizin %98'i tekrar alışveriş yapıyor. Memnuniyetiniz bizim başarımızdır.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Award className="text-purple-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Güvenilirlik</h3>
            <p className="text-gray-600">
              30 yıllık tecrübemiz ve sektördeki itibarımızla ailelerin güvenini kazandık.
            </p>
          </div>
        </div>

        {/* Rakamlarla Biz */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Rakamlarla Gürbüz Oyuncak
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">30+</div>
              <div className="text-gray-600">Yıllık Tecrübe</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">10.000+</div>
              <div className="text-gray-600">Ürün Çeşidi</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">500.000+</div>
              <div className="text-gray-600">Mutlu Müşteri</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Memnuniyet Oranı</div>
            </div>
          </div>
        </div>

        {/* Misyon & Vizyon */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-blue-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Misyonumuz</h2>
            </div>
            <p className="text-gray-700">
              Türkiye'deki tüm çocukların kaliteli, güvenli ve eğitici oyuncaklara uygun fiyatlarla 
              ulaşabilmesini sağlamak. Çocukların gelişimine katkı sağlayan, hayal gücünü destekleyen 
              ürünler sunarak mutlu bir çocukluk dönemi geçirmelerine yardımcı olmak.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-purple-600" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Vizyonumuz</h2>
            </div>
            <p className="text-gray-700">
              Türkiye'nin en büyük ve en güvenilir oyuncak markası olmak. Sürdürülebilir büyüme ile 
              bölgede lider konuma gelmek. Teknolojik gelişmeleri takip ederek, yenilikçi ve çevre dostu 
              ürünlerle sektöre öncülük etmek.
            </p>
          </div>
        </div>

        {/* Belgelerimiz */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Belgeler ve Sertifikalar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold text-gray-800">ISO 9001</div>
              <div className="text-sm text-gray-600">Kalite Yönetim Sistemi</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-gray-800">CE Sertifikası</div>
              <div className="text-sm text-gray-600">Avrupa Standartları</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">🛡️</div>
              <div className="font-semibold text-gray-800">TSE Belgesi</div>
              <div className="text-sm text-gray-600">Türk Standartları</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

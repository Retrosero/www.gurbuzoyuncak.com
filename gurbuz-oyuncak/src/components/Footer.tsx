import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, MessageCircle, Share2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#0cc0df] via-[#00a8cb] to-[#008baa] text-white mt-8 md:mt-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0cc0df]/10 to-[#ff66c4]/10 backdrop-blur-0"></div>
      <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h3 className="text-white font-bold mobile-text-lg md:text-lg mb-3 md:mb-4 drop-shadow-lg">Gürbüz Oyuncak</h3>
            <p className="text-xs md:text-sm mb-3 md:mb-4 text-white/90">
              1995'ten beri Türkiye'nin güvenilir oyuncak markası. Kaliteli ürünler, uygun fiyatlar.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com/gurbuzoyuncak" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white hover:text-[#0cc0df] hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/20 p-2 rounded-lg"
                  title="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://instagram.com/gurbuzoyuncak" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white hover:text-[#ff66c4] hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/20 p-2 rounded-lg"
                  title="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://twitter.com/gurbuzoyuncak" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white hover:text-[#00a8cb] hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/20 p-2 rounded-lg"
                  title="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="https://wa.me/905551234567" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white hover:text-[#ffde59] hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/20 p-2 rounded-lg"
                  title="WhatsApp"
                >
                  <MessageCircle size={20} />
                </a>
              </div>
              
              {/* Site Paylaşım Butonları */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href
                    const title = document.title
                    const text = 'Gürbüz Oyuncak - Türkiye\'nin güvenilir oyuncak merkezi'
                    
                    if (navigator.share) {
                      navigator.share({ title, text, url })
                    } else {
                      // Fallback: Facebook'ta paylaş
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                    }
                  }}
                  className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
                >
                  <Share2 size={12} />
                  Paylaş
                </button>
                <a
                  href="https://www.facebook.com/sharer/sharer.php?u=https://gurbuzoyuncak.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
                >
                  <Facebook size={12} />
                  Facebook
                </a>
                <a
                  href="https://twitter.com/intent/tweet?url=https://gurbuzoyuncak.com&text=Gürbüz Oyuncak - Türkiye'nin güvenilir oyuncak merkezi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs bg-sky-500 hover:bg-sky-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
                >
                  <Twitter size={12} />
                  Twitter
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mobile-text-lg md:text-lg mb-3 md:mb-4 drop-shadow-lg">Kurumsal</h3>
            <ul className="space-y-2 mobile-text-sm md:text-sm">
              <li><Link to="/hakkimizda" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">Hakkımızda</Link></li>
              <li><Link to="/bayi-ol" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">Bayi Olun</Link></li>
              <li><Link to="/kariyer" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">Kariyer</Link></li>
              <li><Link to="/sozlesme" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">Kullanım Koşulları</Link></li>
              <li><Link to="/gizlilik" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">Gizlilik Politikası</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mobile-text-lg md:text-lg mb-3 md:mb-4 drop-shadow-lg">Müşteri Hizmetleri</h3>
            <ul className="space-y-2 mobile-text-sm md:text-sm">
              <li><Link to="/siparis-takip" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">Sipariş Takibi</Link></li>
              <li><Link to="/iade" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">İade ve Değişim</Link></li>
              <li><Link to="/teslimat" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">Teslimat Bilgileri</Link></li>
              <li><Link to="/sss" className="text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 hover:drop-shadow-lg">Sıkça Sorulan Sorular</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mobile-text-lg md:text-lg mb-3 md:mb-4 drop-shadow-lg">İletişim</h3>
            <ul className="space-y-3 mobile-text-sm md:text-sm">
              <li className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200">
                <Phone size={16} className="text-white" />
                <span>0850 123 45 67</span>
              </li>
              <li className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200">
                <Mail size={16} className="text-white" />
                <span>info@gurbuzoyuncak.com</span>
              </li>
              <li className="flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200">
                <MapPin size={16} className="text-white" />
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 md:mt-8 pt-4 md:pt-6 text-center mobile-text-sm md:text-sm">
          <p className="text-white/80">© 2025 Gürbüz Oyuncak. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}

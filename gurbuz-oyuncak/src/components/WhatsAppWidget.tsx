import { useState, useEffect } from 'react'
import { MessageCircle, X, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // WhatsApp Widget Script'ini yükle
    if (!isLoaded) {
      const script = document.createElement('script')
      script.src = 'https://widget.tochat.be/bundle.js?key=your-whatsapp-widget-key'
      script.async = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    }
  }, [isLoaded])

  const handleWhatsAppClick = () => {
    // WhatsApp Business URL'si - kendi numaranızı ekleyin
    const phoneNumber = '905551234567' // Türkiye formatında
    const message = 'Merhaba, ürünleriniz hakkında bilgi almak istiyorum.'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    
    // Event tracking için Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        event_category: 'WhatsApp',
        event_label: 'Widget Click'
      })
    }
    
    window.open(whatsappUrl, '_blank')
  }

  const quickMessages = [
    {
      text: 'Ürün bilgisi istiyorum',
      icon: '📦'
    },
    {
      text: 'Fiyat listesi',
      icon: '💰'
    },
    {
      text: 'Kargo bilgisi',
      icon: '🚚'
    },
    {
      text: 'Teknik destek',
      icon: '🛠️'
    }
  ]

  return (
    <>
      {/* WhatsApp Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse transform hover:scale-105"
            aria-label="WhatsApp ile iletişim kur"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
        ) : (
          <Button
            onClick={() => setIsOpen(false)}
            className="w-14 h-14 bg-gray-500 hover:bg-gray-600 rounded-full shadow-lg"
            aria-label="Kapat"
          >
            <X className="w-6 h-6 text-white" />
          </Button>
        )}
      </div>

      {/* WhatsApp Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 bg-white shadow-2xl border border-gray-100 rounded-xl z-50 animate-in slide-in-from-bottom-2 duration-300 hover:shadow-2xl">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Müşteri Destek</h3>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Çevrimiçi</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="py-3">
              <p className="text-sm text-gray-600 mb-3">
                Merhaba! Size nasıl yardımcı olabiliriz? Aşağıdaki hızlı seçeneklerden birini seçebilir veya doğrudan WhatsApp'ta yazabilirsiniz.
              </p>

              {/* Quick Message Buttons */}
              <div className="space-y-2">
                {quickMessages.map((msg, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const phoneNumber = '905551234567'
                      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg.text)}`
                      window.open(whatsappUrl, '_blank')
                      
                      // Event tracking
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'click', {
                          event_category: 'WhatsApp',
                          event_label: `Quick Message: ${msg.text}`
                        })
                      }
                    }}
                    className="w-full justify-start text-xs h-auto p-2 border-green-200 hover:bg-green-50"
                  >
                    <span className="mr-2">{msg.icon}</span>
                    {msg.text}
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t space-y-2">
              <Button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp'ta Yaz
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('tel:+905551234567')}
                  className="flex-1 text-xs"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Ara
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('mailto:info@gurbuzoyuncak.com')}
                  className="flex-1 text-xs"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  E-posta
                </Button>
              </div>

              {/* Working Hours */}
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 pt-1">
                <Clock className="w-3 h-3" />
                <span>Çalışma Saatleri: 09:00 - 18:00</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Floating WhatsApp Button Alternative */}
      <div className="hidden sm:block fixed bottom-6 left-6 z-40">
        <div className="bg-green-500 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-green-600 transition-colors"
             onClick={handleWhatsAppClick}>
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      </div>

      {/* WhatsApp QR Code Modal (for desktop) */}
      {isOpen && (
        <div className="hidden lg:block fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">WhatsApp Destek</h3>
              <div className="bg-white p-4 rounded-lg mb-4">
                {/* Placeholder for QR Code - Gerçek uygulamada QR kod kütüphanesi kullanın */}
                <div className="w-32 h-32 bg-gray-100 mx-auto rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Kod</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                QR kodu tarayarak WhatsApp'ta mesaj gönderebilirsiniz
              </p>
              <Button onClick={() => setIsOpen(false)} variant="outline">
                Kapat
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
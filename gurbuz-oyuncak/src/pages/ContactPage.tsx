import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, HelpCircle, FileText, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Form verilerini Supabase'e kaydet
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            category: formData.category,
            message: formData.message,
            status: 'new',
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      // Google Analytics Event Tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'submit', {
          event_category: 'Contact Form',
          event_label: 'Support Request'
        })
      }

      toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
      
      // Formu temizle
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      })
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
      toast.error('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      content: '+90 212 555 1234',
      description: 'Pazartesi - Cuma, 09:00 - 18:00',
      action: 'tel:+902125551234'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      content: '+90 555 123 4567',
      description: '7/24 WhatsApp desteği',
      action: 'https://wa.me/905551234567'
    },
    {
      icon: Mail,
      title: 'E-posta',
      content: 'info@gurbuzoyuncak.com',
      description: '24 saat içinde yanıt',
      action: 'mailto:info@gurbuzoyuncak.com'
    },
    {
      icon: MapPin,
      title: 'Adres',
      content: 'İstanbul, Türkiye',
      description: 'Merkez ofisimiz',
      action: '#'
    }
  ]

  const faqItems = [
    {
      category: 'Sipariş',
      questions: [
        {
          q: 'Siparişim ne kadar sürede kargoya verilir?',
          a: 'Siparişleriniz genellikle 1-2 iş günü içinde kargoya verilir. Özel durumlar için müşteri temsilcimiz sizinle iletişime geçer.'
        },
        {
          q: 'Kargo ücreti ne kadar?',
          a: '150 TL ve üzeri siparişlerde kargo ücretsizdir. Altındaki siparişler için 25 TL kargo ücreti alınır.'
        },
        {
          q: 'Siparişimi nasıl takip edebilirim?',
          a: 'Sipariş onay e-postasında yer alan kargo takip numarası ile kargo firmasının web sitesinden takip edebilirsiniz.'
        }
      ]
    },
    {
      category: 'Ürün',
      questions: [
        {
          q: 'Ürünleriniz güvenli mi?',
          a: 'Tüm ürünlerimiz CE işaretlidir ve güvenlik testlerinden geçmiştir. 0-3 yaş arası ürünlerimiz EN 71 standardına uygun olarak üretilir.'
        },
        {
          q: 'Ürün değişimi nasıl yapılır?',
          a: 'Ürünü orijinal ambalajında, kullanılmamış ve eksiksiz olarak 14 gün içinde iade edebilirsiniz.'
        }
      ]
    },
    {
      category: 'Ödeme',
      questions: [
        {
          q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
          a: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçenekleri mevcuttur.'
        },
        {
          q: 'Taksitli ödeme yapabilir miyim?',
          a: 'Evet, kredi kartı ile 3, 6, 9 ve 12 aya kadar taksitli ödeme yapabilirsiniz.'
        }
      ]
    }
  ]

  const supportTickets = [
    {
      id: 'SUP-001',
      subject: 'Sipariş durumu hakkında',
      status: 'Yanıtlandı',
      date: '2024-01-15',
      priority: 'Normal'
    },
    {
      id: 'SUP-002', 
      subject: 'Ürün iade talebi',
      status: 'İşlemde',
      date: '2024-01-16',
      priority: 'Yüksek'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">İletişim & Destek</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya yardıma ihtiyacınız mı var? Size nasıl yardımcı olabileceğimizi öğrenmek için bizimle iletişime geçin.
          </p>
        </div>

        <Tabs defaultValue="contact" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
            <TabsTrigger value="contact">İletişim</TabsTrigger>
            <TabsTrigger value="faq">SSS</TabsTrigger>
            <TabsTrigger value="support">Destek Talebi</TabsTrigger>
            <TabsTrigger value="tickets">Talep Geçmişi</TabsTrigger>
          </TabsList>

          {/* İletişim Tab */}
          <TabsContent value="contact" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Bize Yazın</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        placeholder="Adınız ve soyadınız"
                        className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">E-posta *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        placeholder="ornek@email.com"
                        className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md py-3"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefon</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0555 123 4567"
                        className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Konu *</label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                        placeholder="Mesajınızın konusu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md py-3">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="siparis">Sipariş</SelectItem>
                        <SelectItem value="urun">Ürün</SelectItem>
                        <SelectItem value="odeme">Ödeme</SelectItem>
                        <SelectItem value="kargo">Kargo</SelectItem>
                        <SelectItem value="iade">İade/Değişim</SelectItem>
                        <SelectItem value="teknik">Teknik Destek</SelectItem>
                        <SelectItem value="sikayet">Şikayet</SelectItem>
                        <SelectItem value="oneri">Öneri</SelectItem>
                        <SelectItem value="diger">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Mesaj *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={5}
                      placeholder="Mesajınızı detaylı olarak yazın..."
                      className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md resize-none py-3"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full transition-all duration-300 ease-in-out hover:shadow-lg active:scale-95 py-3"
                  >
                    {isSubmitting ? (
                      'Gönderiliyor...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Mesaj Gönder
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">İletişim Bilgileri</h2>
                  <div className="space-y-4">
                    {contactInfo.map((info, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <info.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{info.title}</h3>
                          <p className="text-gray-600">{info.content}</p>
                          <p className="text-sm text-gray-500">{info.description}</p>
                        </div>
                        {info.action !== '#' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(info.action)}
                          >
                            İletişim
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start transition-all duration-300 ease-in-out hover:shadow-md active:scale-95 py-3"
                      onClick={() => window.open('tel:+902125551234')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Hemen Ara
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start transition-all duration-300 ease-in-out hover:shadow-md active:scale-95 py-3"
                      onClick={() => window.open('https://wa.me/905551234567')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp'tan Yaz
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('mailto:info@gurbuzoyuncak.com')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      E-posta Gönder
                    </Button>
                  </div>
                </Card>

                {/* Working Hours */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Çalışma Saatleri
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pazartesi - Cuma</span>
                      <span className="font-medium">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cumartesi</span>
                      <span className="font-medium">10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pazar</span>
                      <span className="text-red-500">Kapalı</span>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                      <strong>WhatsApp:</strong> 7/24 destek
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* SSS Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Sıkça Sorulan Sorular</h2>
              <p className="text-gray-600">En çok merak edilen konular hakkında hızlı yanıtlar</p>
            </div>
            
            <div className="space-y-8">
              {faqItems.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.questions.map((item, questionIndex) => (
                      <div key={questionIndex} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <h4 className="font-medium text-gray-800 mb-2">{item.q}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Destek Talebi Tab */}
          <TabsContent value="support">
            <Card className="p-6">
              <div className="text-center mb-8">
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Destek Talebi Oluştur</h2>
                <p className="text-gray-600">
                  Özel bir sorununuz mu var? Detaylı bir destek talebi oluşturun, size en kısa sürede dönüş yapalım.
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ad Soyad *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        placeholder="Adınız ve soyadınız"
                        className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">E-posta *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        placeholder="ornek@email.com"
                        className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md py-3"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefon</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0555 123 4567"
                        className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md py-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Öncelik</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Öncelik seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Düşük</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Yüksek</SelectItem>
                          <SelectItem value="urgent">Acil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Konu *</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      placeholder="Talebinizin konusu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="transition-all duration-300 ease-in-out hover:shadow-md focus:shadow-md py-3">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Teknik Sorun</SelectItem>
                        <SelectItem value="billing">Faturalandırma</SelectItem>
                        <SelectItem value="account">Hesap Sorunu</SelectItem>
                        <SelectItem value="product">Ürün Sorunu</SelectItem>
                        <SelectItem value="order">Sipariş Sorunu</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Detaylı Açıklama *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={8}
                      placeholder="Sorununuzu detaylı olarak açıklayın. Hata mesajları varsa onları da ekleyin..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      'Talep Oluşturuluyor...'
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Destek Talebi Oluştur
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>

          {/* Talep Geçmişi Tab */}
          <TabsContent value="tickets">
            <Card className="p-6">
              <div className="text-center mb-8">
                <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Talep Geçmişiniz</h2>
                <p className="text-gray-600">
                  Önceki destek taleplerinizi görüntüleyin ve durumlarını takip edin.
                </p>
              </div>

              {supportTickets.length > 0 ? (
                <div className="space-y-4">
                  {supportTickets.map((ticket, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-gray-600">Talep No: {ticket.id}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'Yanıtlandı' 
                              ? 'bg-green-100 text-green-800' 
                              : ticket.status === 'İşlemde'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(ticket.date).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          ticket.priority === 'Yüksek' 
                            ? 'bg-red-100 text-red-800'
                            : ticket.priority === 'Normal'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.priority} Öncelik
                        </span>
                        <Button variant="outline" size="sm">
                          Detayları Gör
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Henüz talebiniz yok</h3>
                  <p className="text-gray-500 mb-6">
                    İlk destek talebinizi oluşturmak için yukarıdaki formu kullanabilirsiniz.
                  </p>
                  <Button onClick={() => {
                    const tabElement = document.querySelector('[value="support"]') as HTMLElement
                    tabElement?.click()
                  }}>
                    İlk Talebimi Oluştur
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Facebook, Twitter, Instagram, Share2, Copy, Mail, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { toast } from 'sonner' // Sonner kurulu değil, basit alert kullanıyoruz

interface SocialShareProps {
  productName: string
  productUrl: string
  productImage?: string
  productDescription?: string
  className?: string
}

export default function SocialShare({
  productName,
  productUrl,
  productImage,
  productDescription,
  className = ""
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  
  const shareData = {
    title: productName,
    url: productUrl,
    text: productDescription || `Check out this amazing product: ${productName}`,
    image: productImage
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        alert('Başarıyla paylaşıldı!')
      } catch (error) {
        console.error('Paylaşım hatası:', error)
      }
    } else {
      // Native share yoksa popover aç
      setCopied(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      alert('Link kopyalandı!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Link kopyalama hatası:', error)
      alert('Link kopyalanamadı')
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(productName)
    const body = encodeURIComponent(`${shareData.text}\n\n${productUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const socialShares = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-600 hover:text-white',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
        window.open(url, '_blank', 'width=600,height=400')
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-sky-500 hover:text-white',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(productUrl)}`
        window.open(url, '_blank', 'width=600,height=400')
      }
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white',
      action: () => {
        // Instagram'ın direct share API'si yok, kopyalama yapıyoruz
        navigator.clipboard.writeText(`${shareData.text}\n${productUrl}`)
        alert('Paylaşım bilgisi kopyalandı! Instagram\'da paylaşabilirsiniz.')
      }
    }
  ]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">Paylaş:</span>
      
      {/* Native Share Butonu */}
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Paylaş
        </Button>
      )}

      {/* Sosyal Medya Paylaşım Butonları */}
      <div className="flex gap-1">
        {socialShares.map(social => (
          <Button
            key={social.name}
            variant="outline"
            size="sm"
            onClick={social.action}
            className={`p-2 transition-colors ${social.color}`}
            title={`${social.name}'da paylaş`}
          >
            <social.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Link Kopyalama */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="p-2"
            title="Linki kopyala"
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-semibold">Linki Paylaş</h4>
            
            {/* Ürün Önizlemesi */}
            {productImage && (
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={productImage} 
                  alt={productName}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm line-clamp-2">{productName}</h5>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {productDescription || 'Harika bir ürün!'}
                  </p>
                </div>
              </div>
            )}

            {/* Link */}
            <div className="flex gap-2">
              <input
                type="text"
                value={productUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded bg-gray-50"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Kopyalandı!' : 'Kopyala'}
              </Button>
            </div>

            {/* E-posta Gönder */}
            <Button
              variant="outline"
              onClick={handleEmailShare}
              className="w-full flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              E-posta ile gönder
            </Button>

            {/* WhatsApp Paylaşım */}
            <Button
              variant="outline"
              onClick={() => {
                const message = encodeURIComponent(`${shareData.text}\n${productUrl}`)
                window.open(`https://wa.me/?text=${message}`, '_blank')
              }}
              className="w-full flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <span className="text-lg">📱</span>
              WhatsApp'ta paylaş
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sosyal Medya İstatistikleri (Placeholder) */}
      <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 ml-4">
        <div className="flex items-center gap-1">
          <span>👁️</span>
          <span>124 görüntülenme</span>
        </div>
        <div className="flex items-center gap-1">
          <span>❤️</span>
          <span>23 beğeni</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📤</span>
          <span>8 paylaşım</span>
        </div>
      </div>
    </div>
  )
}
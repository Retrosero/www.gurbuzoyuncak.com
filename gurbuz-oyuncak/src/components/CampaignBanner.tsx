import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import CountdownTimer from './CountdownTimer'

interface Banner {
  id: number
  title: string
  description: string
  image_url: string
  discount_percentage: number
  start_date: string
  end_date: string
  link_url: string
}

export default function CampaignBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 5000) // Her 5 saniyede bir değiş

      return () => clearInterval(interval)
    }
  }, [banners.length])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_banners')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .lte('start_date', new Date().toISOString())
        .order('display_order', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Banner yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  if (loading || banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white rounded-lg overflow-hidden shadow-xl mb-8">
      {/* Banner İçeriği */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Sol: Metin ve Timer */}
          <div className="space-y-4">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
              %{currentBanner.discount_percentage} İndirim
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              {currentBanner.title}
            </h2>
            {currentBanner.description && (
              <p className="text-lg md:text-xl text-red-100">
                {currentBanner.description}
              </p>
            )}
            
            {/* Geri Sayım */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
              <p className="text-sm mb-2 opacity-90">Kampanya Bitiş Süresi:</p>
              <CountdownTimer 
                endDate={currentBanner.end_date} 
                className="text-white"
              />
            </div>

            {/* CTA Butonu */}
            {currentBanner.link_url && (
              <div>
                <a
                  href={currentBanner.link_url}
                  className="inline-block bg-white text-[#FF69B4] px-8 py-3 rounded-lg font-bold hover:bg-pink-50 transition shadow-lg"
                >
                  Kampanyaya Git
                </a>
              </div>
            )}
          </div>

          {/* Sağ: Resim (opsiyonel) */}
          {currentBanner.image_url && (
            <div className="relative h-64 md:h-80">
              <img
                src={currentBanner.image_url}
                alt={currentBanner.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition"
            aria-label="Önceki banner"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition"
            aria-label="Sonraki banner"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                }`}
                aria-label={`Banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

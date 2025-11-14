import { useEffect, useState } from 'react'
import { Battery, X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'

interface BatteryRecommendation {
  product_name: string
  battery_type: string
  battery_count: number
  total_needed: number
}

export default function BatteryRecommendationCard() {
  const { items, addToCart } = useCart()
  const [recommendations, setRecommendations] = useState<BatteryRecommendation[]>([])
  const [batteryProducts, setBatteryProducts] = useState<Map<string, Product>>(new Map())
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      
      // Sepetteki pil gerektiren ürünleri bul
      const productIds = items.map(item => item.product.id)
      
      if (productIds.length === 0) {
        setRecommendations([])
        setLoading(false)
        return
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, name, battery_required, battery_type, battery_count')
        .in('id', productIds)
        .eq('battery_required', true)

      if (!products || products.length === 0) {
        setRecommendations([])
        setLoading(false)
        return
      }

      // Pil ürünlerini getir
      const uniqueBatteryTypes = [...new Set(products.map(p => p.battery_type).filter(Boolean))]
      const { data: batteries } = await supabase
        .from('products')
        .select('*')
        .in('name', uniqueBatteryTypes.map(type => `Duracell ${type} Pil (4'lü Paket)`))
        .limit(10)

      const batteryMap = new Map<string, Product>()
      batteries?.forEach(battery => {
        const match = battery.name.match(/(AA|AAA|CR2032|9V)/)
        if (match) {
          batteryMap.set(match[1], battery)
        }
      })
      setBatteryProducts(batteryMap)

      // Önerileri oluştur
      const recs: BatteryRecommendation[] = []
      const batteryNeeds = new Map<string, { count: number; products: string[] }>()

      products.forEach(product => {
        if (!product.battery_type || !product.battery_count) return

        const cartItem = items.find(item => item.product.id === product.id)
        if (!cartItem) return

        // Eğer kullanıcı zaten pil seçmişse atla
        if (cartItem.battery_selection) return

        const totalNeeded = product.battery_count * cartItem.quantity
        
        if (batteryNeeds.has(product.battery_type)) {
          const existing = batteryNeeds.get(product.battery_type)!
          existing.count += totalNeeded
          existing.products.push(product.name)
        } else {
          batteryNeeds.set(product.battery_type, {
            count: totalNeeded,
            products: [product.name]
          })
        }
      })

      batteryNeeds.forEach((value, batteryType) => {
        recs.push({
          product_name: value.products.join(', '),
          battery_type: batteryType,
          battery_count: value.count,
          total_needed: value.count
        })
      })

      setRecommendations(recs)
      setLoading(false)
    }

    fetchRecommendations()
  }, [items])

  const handleAddBatteries = async (batteryType: string, count: number) => {
    const batteryProduct = batteryProducts.get(batteryType)
    if (!batteryProduct) {
      alert('Üzgünüz, bu pil türü şu an stokta bulunmuyor.')
      return
    }

    // Her pakette 4 pil olduğu için gerekli paket sayısını hesapla
    const packagesNeeded = Math.ceil(count / 4)
    
    await addToCart(batteryProduct, packagesNeeded)
    
    // Öneriyi kapat
    setDismissedItems(prev => new Set([...prev, batteryType]))
  }

  const handleDismiss = (batteryType: string) => {
    setDismissedItems(prev => new Set([...prev, batteryType]))
  }

  const visibleRecommendations = recommendations.filter(
    rec => !dismissedItems.has(rec.battery_type)
  )

  if (loading || visibleRecommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {visibleRecommendations.map((rec) => {
        const packagesNeeded = Math.ceil(rec.total_needed / 4)
        
        return (
          <div
            key={rec.battery_type}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-[#ffde59]/20 rounded-xl p-4 shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffde59]/10 to-amber-100 flex items-center justify-center">
                  <Battery className="w-6 h-6 text-[#ffde59]" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Pil Önerisi
                  </h3>
                  <button
                    onClick={() => handleDismiss(rec.battery_type)}
                    className="flex-shrink-0 text-gray-400 hover:text-[#0cc0df] transition-colors duration-200"
                    aria-label="Kapat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Sepetinizdeki ürünler için toplam{' '}
                  <span className="font-semibold text-[#0cc0df]">
                    {rec.total_needed} adet {rec.battery_type}
                  </span>{' '}
                  pil gerekiyor.
                </p>

                <div className="bg-white rounded-xl p-3 mb-3 border border-[#ffde59]/10 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Önerilen Paket:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {packagesNeeded} adet {rec.battery_type} Pil Paketi (4'lü)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {packagesNeeded * 4} pil = {rec.total_needed} gerekli + {(packagesNeeded * 4) - rec.total_needed} yedek
                  </p>
                </div>

                <button
                  onClick={() => handleAddBatteries(rec.battery_type, rec.total_needed)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl transition-all duration-200 text-sm font-medium bg-gradient-to-r from-[#ffde59] to-yellow-400 hover:from-yellow-400 hover:to-[#ffde59] hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Sepete Ekle ({packagesNeeded} Paket)
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

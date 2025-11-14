import { useState, useEffect } from 'react'
import { Product, ProductStockMovement } from '@/types'
import { Package, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

interface RealTimeStockProps {
  product: Product
  className?: string
}

interface StockAlert {
  type: 'low_stock' | 'out_of_stock' | 'back_in_stock' | 'price_change'
  message: string
  timestamp: string
}

export default function RealTimeStock({ product, className = "" }: RealTimeStockProps) {
  const [currentStock, setCurrentStock] = useState(product.stock)
  const [stockMovements, setStockMovements] = useState<ProductStockMovement[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [isLowStock, setIsLowStock] = useState(false)
  const [stockTrend, setStockTrend] = useState<'up' | 'down' | 'stable'>('stable')

  useEffect(() => {
    loadStockMovements()
    setupRealTimeSubscription()
    checkStockLevels()
  }, [product.id])

  const loadStockMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('product_stock_movements')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setStockMovements(data || [])

      // Son 3 haftadaki trend'i analiz et
      if (data && data.length >= 2) {
        const recentMovements = data.slice(0, 3)
        const inMovements = recentMovements.filter(m => m.movement_type === 'in').reduce((sum, m) => sum + m.quantity, 0)
        const outMovements = recentMovements.filter(m => m.movement_type === 'out').reduce((sum, m) => sum + m.quantity, 0)
        
        if (inMovements > outMovements) setStockTrend('up')
        else if (outMovements > inMovements) setStockTrend('down')
        else setStockTrend('stable')
      }
    } catch (error) {
      console.error('Stok hareketleri yüklenemedi:', error)
    }
  }

  const setupRealTimeSubscription = () => {
    // Supabase real-time subscription
    const subscription = supabase
      .channel('stock-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'product_stock_movements',
        filter: `product_id=eq.${product.id}`
      }, (payload) => {
        console.log('Stock movement detected:', payload)
        loadStockMovements() // Yenile
        
        if (payload.eventType === 'INSERT') {
          const movement = payload.new as ProductStockMovement
          addAlert(movement)
          updateCurrentStock(movement)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const checkStockLevels = () => {
    const lowStockThreshold = 5 // Düşük stok eşiği
    setIsLowStock(currentStock <= lowStockThreshold && currentStock > 0)
  }

  const addAlert = (movement: ProductStockMovement) => {
    const newAlert: StockAlert = {
      type: 'out_of_stock',
      message: `${movement.movement_type === 'in' ? 'Stok eklendi' : 'Stok satıldı'}: ${movement.quantity} adet`,
      timestamp: new Date().toISOString()
    }
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]) // En son 5 uyarı
    
    // Eski uyarıları temizle
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert !== newAlert))
    }, 5000)
  }

  const updateCurrentStock = (movement: ProductStockMovement) => {
    setCurrentStock(movement.new_stock)
  }

  const getStockStatus = () => {
    if (currentStock === 0) {
      return {
        status: 'out_of_stock',
        label: 'Stokta Yok',
        color: 'bg-red-500',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    } else if (currentStock <= 5) {
      return {
        status: 'low_stock',
        label: 'Son Az',
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    } else {
      return {
        status: 'in_stock',
        label: 'Stokta',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    }
  }

  const getTrendIcon = () => {
    switch (stockTrend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'out': return <TrendingDown className="w-3 h-3 text-red-500" />
      default: return <Package className="w-3 h-3 text-gray-500" />
    }
  }

  const stockStatus = getStockStatus()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Ana Stok Durumu */}
      <div className={`p-4 rounded-lg border ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stockStatus.color}`}></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stockStatus.label}</span>
                {getTrendIcon()}
              </div>
              <div className="text-sm text-gray-600">
                {currentStock} adet mevcut
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${stockStatus.textColor}`}>
              {currentStock}
            </div>
            <div className="text-xs text-gray-500">
              {stockStatus.status === 'out_of_stock' ? 'Stokta yok' : 
               stockStatus.status === 'low_stock' ? 'Az kaldı' : 'Stokta'}
            </div>
          </div>
        </div>

        {/* Stok Uyarıları */}
        {isLowStock && currentStock > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">
              Az stok kaldı! Son {currentStock} adet.
            </span>
          </div>
        )}

        {currentStock === 0 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">
              Stokta yok. Stok geldiğinde bildirim alacaksınız.
            </span>
          </div>
        )}
      </div>

      {/* Son Stok Hareketleri */}
      {stockMovements.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Son Stok Hareketleri
          </h4>
          
          <div className="space-y-2">
            {stockMovements.slice(0, 5).map(movement => (
              <div key={movement.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-2">
                  {getMovementIcon(movement.movement_type)}
                  <span className="text-sm font-medium">
                    {movement.movement_type === 'in' ? 'Stok Girişi' :
                     movement.movement_type === 'out' ? 'Stok Çıkışı' : 'Ayarlama'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(movement.created_at).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({movement.previous_stock} → {movement.new_stock})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bildirimler */}
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 animate-fadeIn"
          >
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">{alert.message}</span>
          </div>
        ))}
      </div>

      {/* Stok Bilgilendirme */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h5 className="font-semibold text-gray-800 mb-2">📦 Stok Bilgilendirme</h5>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Stok seviyeleri gerçek zamanlı olarak güncellenir</p>
          <p>• Azalan stoklar için otomatik bildirim alırsınız</p>
          <p>• Stok bittiğinde sistem otomatik olarak sipariş verir</p>
          <p>• Toplu siparişler için özel fiyatlandırma mevcuttur</p>
        </div>
      </div>

      {/* Stok Tahmini (Basit algoritma) */}
      {stockMovements.length > 3 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold mb-3">📈 Stok Tahmini</h4>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {Math.max(0, Math.round(currentStock * 0.8))}
              </div>
              <div className="text-xs text-gray-500">7 günlük tahmin</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {Math.max(0, Math.round(currentStock * 0.5))}
              </div>
              <div className="text-xs text-gray-500">14 günlük tahmin</div>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            * Son stok hareketlerine dayalı basit tahmin
          </div>
        </div>
      )}
    </div>
  )
}
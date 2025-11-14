import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, X } from 'lucide-react'

interface Order {
  id: number
  order_number: string
  total_amount: number
  payment_status: string
  order_status: string
  tracking_number: string | null
  carrier: string | null
  created_at: string
  shipping_address: any
  order_items: Array<{
    id: number
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    gift_wrap: boolean
  }>
}

interface OrderStatusModalProps {
  order: Order | null
  onClose: () => void
}

function OrderStatusModal({ order, onClose }: OrderStatusModalProps) {
  if (!order) return null

  const statusSteps = [
    { key: 'pending', label: 'Sipariş Alındı', icon: Clock },
    { key: 'processing', label: 'Hazırlanıyor', icon: Package },
    { key: 'shipped', label: 'Kargoya Verildi', icon: Truck },
    { key: 'delivered', label: 'Teslim Edildi', icon: CheckCircle }
  ]

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.order_status)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sipariş Detayları</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sipariş Bilgileri */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Sipariş No</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
              {order.tracking_number && (
                <div>
                  <p className="text-sm text-gray-600">Takip No</p>
                  <p className="font-semibold">{order.tracking_number}</p>
                </div>
              )}
              {order.carrier && (
                <div>
                  <p className="text-sm text-gray-600">Kargo Firması</p>
                  <p className="font-semibold">{order.carrier}</p>
                </div>
              )}
            </div>
          </div>

          {/* Durum Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Kargo Durumu</h3>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {index < statusSteps.length - 1 && (
                      <div 
                        className={`absolute left-5 top-12 w-0.5 h-12 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 pb-8">
                      <p className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-green-600 mt-1">Şu anda burada</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ürünler */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Ürünler</h3>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                  {item.gift_wrap && (
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1">
                      <Package size={12} />
                      Hediye Paketi
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700">{item.total_price.toFixed(2)} TL</p>
                  <p className="text-xs text-gray-500">{item.unit_price.toFixed(2)} TL/adet</p>
                </div>
              </div>
            ))}
          </div>

          {/* Teslimat Adresi */}
          {order.shipping_address && (
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Teslimat Adresi</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold">{order.shipping_address.full_name}</p>
                <p className="text-sm text-gray-600 mt-1">{order.shipping_address.address}</p>
                <p className="text-sm text-gray-600">
                  {order.shipping_address.city} / {order.shipping_address.district}
                </p>
                <p className="text-sm text-gray-600">{order.shipping_address.phone}</p>
              </div>
            </div>
          )}

          {/* Toplam */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Toplam Tutar</span>
              <span className="text-blue-700">{order.total_amount.toFixed(2)} TL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<number[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price,
            gift_wrap
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Beklemede',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Package className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz Siparişiniz Yok</h2>
        <p className="text-gray-600 mb-6">İlk siparişinizi vermek için alışverişe başlayın</p>
        <a 
          href="/" 
          className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800"
        >
          Alışverişe Başla
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Siparişlerim</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrders.includes(order.id)

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleOrderExpand(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="font-bold text-lg">{order.order_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                        {getStatusLabel(order.order_status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(order.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-lg font-bold text-blue-700 mt-2">
                      {order.total_amount.toFixed(2)} TL
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                        {item.gift_wrap && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1">
                            <Package size={12} />
                            Hediye Paketi
                          </span>
                        )}
                      </div>
                      <p className="font-bold">{item.total_price.toFixed(2)} TL</p>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedOrder(order)
                      }}
                      className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-medium"
                    >
                      Sipariş Takibi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedOrder && (
        <OrderStatusModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

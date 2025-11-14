import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, Eye, CheckCircle, XCircle, Download, FileText, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Order {
  id: number
  order_number: string
  total_amount: number
  order_status: string
  payment_status: string
  created_at: string
  customer_type: string
  pdf_url: string | null
  pdf_name: string | null
  user_id: string
}

interface OrderDetails {
  order: Order
  items: Array<{
    id: number
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
  user: {
    email: string
    full_name: string
  } | null
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [filter])

  async function loadOrders() {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('order_status', filter)
      }

      const { data } = await query.limit(100)
      if (data) setOrders(data)
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error)
      toast.error('Siparişler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function loadOrderDetails(orderId: number) {
    try {
      setLoadingDetails(true)
      
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (itemsError) throw itemsError

      // Get user info
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', order.user_id)
        .single()

      if (userError) console.error('User info error:', userError)

      setSelectedOrder({
        order,
        items: items || [],
        user: user || null
      })
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Sipariş detayları yüklenemedi:', error)
      toast.error('Sipariş detayları yüklenemedi')
    } finally {
      setLoadingDetails(false)
    }
  }

  async function updateOrderStatus(orderId: number, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, order_status: newStatus } : o
      ))
      
      if (selectedOrder && selectedOrder.order.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          order: { ...selectedOrder.order, order_status: newStatus }
        })
      }
      
      toast.success('Sipariş durumu güncellendi')
    } catch (error: any) {
      toast.error('Hata: ' + error.message)
    }
  }

  const handleDownloadPDF = (pdfUrl: string, pdfName: string) => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = pdfName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-green-100 text-green-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusLabels: Record<string, string> = {
    pending: 'Bekliyor',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-700 text-white transition-all duration-200 hover:shadow-lg py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Sipariş Yönetimi</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Siparişler ({orders.length})</h2>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-green-700 text-white transition-all duration-200 hover:shadow-lg' : 'bg-gray-200'}`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-green-700 text-white transition-all duration-200 hover:shadow-lg' : 'bg-gray-200'}`}
              >
                Bekleyen
              </button>
              <button
                onClick={() => setFilter('processing')}
                className={`px-4 py-2 rounded ${filter === 'processing' ? 'bg-green-700 text-white transition-all duration-200 hover:shadow-lg' : 'bg-gray-200'}`}
              >
                Hazırlanıyor
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Sipariş No</th>
                  <th className="text-left p-3">Tarih</th>
                  <th className="text-left p-3">Tutar</th>
                  <th className="text-left p-3">Müşteri Tipi</th>
                  <th className="text-left p-3">PDF</th>
                  <th className="text-left p-3">Durum</th>
                  <th className="text-left p-3">Ödeme</th>
                  <th className="text-right p-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{order.order_number}</td>
                    <td className="p-3 text-sm">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-3 font-semibold">{order.total_amount.toFixed(2)} TL</td>
                    <td className="p-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {order.customer_type}
                      </span>
                    </td>
                    <td className="p-3">
                      {order.pdf_url ? (
                        <button
                          onClick={() => handleDownloadPDF(order.pdf_url!, order.pdf_name || 'fis.pdf')}
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors duration-200"
                          title="PDF İndir"
                        >
                          <FileText size={16} />
                          <Download size={14} />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-3 py-1 rounded text-sm ${statusColors[order.order_status]}`}
                      >
                        <option value="pending">Bekliyor</option>
                        <option value="processing">Hazırlanıyor</option>
                        <option value="shipped">Kargoda</option>
                        <option value="delivered">Teslim Edildi</option>
                        <option value="cancelled">İptal</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {order.payment_status === 'paid' ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <XCircle className="text-red-600" size={20} />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => loadOrderDetails(order.id)}
                          disabled={loadingDetails}
                          className="text-green-600 hover:text-green-800 transition-colors duration-200 p-1"
                          title="Detaylar"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {filter === 'all' 
                ? 'Henüz sipariş bulunmuyor.'
                : `Bu durumda sipariş bulunmuyor.`
              }
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Sipariş Detayları</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sipariş No</p>
                    <p className="font-semibold">{selectedOrder.order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                    <p className="font-semibold">
                      {new Date(selectedOrder.order.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Müşteri</p>
                    <p className="font-semibold">
                      {selectedOrder.user?.full_name || selectedOrder.user?.email || 'Bilinmiyor'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Müşteri Tipi</p>
                    <p className="font-semibold">{selectedOrder.order.customer_type}</p>
                  </div>
                </div>
              </div>

              {/* PDF Section */}
              {selectedOrder.order.pdf_url && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-600" size={24} />
                      <div>
                        <p className="font-semibold text-green-900">Pazaryeri Fişi</p>
                        <p className="text-sm text-green-700">{selectedOrder.order.pdf_name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(
                        selectedOrder.order.pdf_url!, 
                        selectedOrder.order.pdf_name || 'fis.pdf'
                      )}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      <Download size={16} />
                      İndir
                    </button>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Ürünler</h3>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div className="flex-1">
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">{item.total_price.toFixed(2)} TL</p>
                      <p className="text-xs text-gray-500">{item.unit_price.toFixed(2)} TL/adet</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Update */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Sipariş Durumu</h3>
                <select
                  value={selectedOrder.order.order_status}
                  onChange={(e) => updateOrderStatus(selectedOrder.order.id, e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border border-gray-300 ${statusColors[selectedOrder.order.order_status]}`}
                >
                  <option value="pending">Bekliyor</option>
                  <option value="processing">Hazırlanıyor</option>
                  <option value="shipped">Kargoda</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Toplam Tutar</span>
                  <span className="text-green-700">{selectedOrder.order.total_amount.toFixed(2)} TL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

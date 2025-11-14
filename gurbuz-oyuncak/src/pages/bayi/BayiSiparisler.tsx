import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  ShoppingBag, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: string
  created_at: string
  items_count: number
  payment_method: string
}

const orderStatuses = [
  { value: 'all', label: 'Tümü', color: 'gray' },
  { value: 'pending', label: 'Beklemede', color: 'yellow' },
  { value: 'processing', label: 'Hazırlanıyor', color: 'blue' },
  { value: 'shipped', label: 'Kargoda', color: 'purple' },
  { value: 'delivered', label: 'Teslim Edildi', color: 'green' },
  { value: 'cancelled', label: 'İptal', color: 'red' }
]

export default function BayiSiparisler() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // İstatistikler
  const [stats, setStats] = useState({
    total_orders: 0,
    total_spent: 0,
    pending_orders: 0,
    completed_orders: 0
  })

  useEffect(() => {
    if (user) {
      fetchOrders()
      fetchStats()
    }
  }, [user, filterStatus, filterStartDate, filterEndDate])

  const fetchOrders = async () => {
    if (!user) return

    try {
      setLoading(true)

      let query = supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at, payment_method')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      if (filterStartDate) {
        query = query.gte('created_at', filterStartDate)
      }

      if (filterEndDate) {
        query = query.lte('created_at', filterEndDate + 'T23:59:59')
      }

      const { data, error } = await query.limit(50)

      if (error) throw error

      // Her sipariş için item sayısını al
      const ordersWithItems = await Promise.all(
        (data || []).map(async (order) => {
          const { count } = await supabase
            .from('order_items')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.id)

          return {
            ...order,
            items_count: count || 0
          }
        })
      )

      setOrders(ordersWithItems)
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      // Toplam sipariş sayısı ve tutar
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('user_id', user.id)

      if (allOrders) {
        const totalSpent = allOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        const pendingCount = allOrders.filter(o => o.status === 'pending').length
        const completedCount = allOrders.filter(o => o.status === 'delivered').length

        setStats({
          total_orders: allOrders.length,
          total_spent: totalSpent,
          pending_orders: pendingCount,
          completed_orders: completedCount
        })
      }
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />
      case 'processing':
        return <Package className="text-blue-500" size={20} />
      case 'shipped':
        return <TrendingUp className="text-purple-500" size={20} />
      case 'delivered':
        return <CheckCircle className="text-green-500" size={20} />
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />
      default:
        return <ShoppingBag className="text-gray-500" size={20} />
    }
  }

  const getStatusLabel = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status)
    return statusObj?.label || status
  }

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status)
    const colors: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700'
    }
    return colors[statusObj?.color || 'gray']
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const resetFilters = () => {
    setFilterStatus('all')
    setFilterStartDate('')
    setFilterEndDate('')
  }

  return (
    <div className="space-y-6">
      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Toplam Sipariş</h3>
            <ShoppingBag className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total_orders}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Toplam Harcama</h3>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ₺{stats.total_spent.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Bekleyen</h3>
            <Clock className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.pending_orders}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Tamamlanan</h3>
            <CheckCircle className="text-purple-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.completed_orders}</p>
        </div>
      </div>

      {/* Sipariş Listesi */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Siparişlerim</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <Filter size={18} />
            Filtrele
          </button>
        </div>

        {/* Filtreler */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              >
                {orderStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* Sipariş Kartları */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz sipariş bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-semibold text-gray-800">Sipariş #{order.order_number}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Ürün Sayısı</p>
                    <p className="font-medium text-gray-800">{order.items_count} ürün</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ödeme Yöntemi</p>
                    <p className="font-medium text-gray-800">
                      {order.payment_method === 'balance' ? 'Bakiye' : 'Kredi Kartı'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Toplam Tutar</p>
                    <p className="font-bold text-green-600 text-lg">
                      ₺{order.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

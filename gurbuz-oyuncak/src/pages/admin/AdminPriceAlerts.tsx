import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Edit2, 
  Trash2,
  AlertTriangle,
  Package,
  Users,
  Bell,
  X,
  Save
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface PriceAlert {
  id: string
  product_id: string
  product_name: string
  current_price: number
  target_price: number
  alert_type: 'price_drop' | 'price_increase' | 'threshold'
  threshold_percentage?: number
  subscribers_count: number
  is_active: boolean
  triggered_count: number
  last_triggered?: string
  created_at: string
}

const ALERT_TYPES = [
  { 
    value: 'price_drop', 
    label: 'Fiyat Düşüşü', 
    description: 'Fiyat hedef değerin altına düştüğünde bildir',
    icon: TrendingDown,
    color: 'text-green-600 bg-green-50'
  },
  { 
    value: 'price_increase', 
    label: 'Fiyat Artışı', 
    description: 'Fiyat hedef değerin üstüne çıktığında bildir',
    icon: TrendingUp,
    color: 'text-red-600 bg-red-50'
  },
  { 
    value: 'threshold', 
    label: 'Yüzde Eşik', 
    description: 'Fiyat %X değiştiğinde bildir',
    icon: AlertTriangle,
    color: 'text-yellow-600 bg-yellow-50'
  }
]

export default function AdminPriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_price_alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlerts(data || [])
    } catch (error: any) {
      console.error('Error loading alerts:', error)
      toast.error('Fiyat uyarıları yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.alert_type === filterType
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && alert.is_active) ||
      (filterActive === 'inactive' && !alert.is_active)
    return matchesType && matchesActive
  })

  const handleCreate = async () => {
    if (!editingAlert) return

    try {
      if (editingAlert.id) {
        // Update
        const { error } = await supabase
          .from('admin_price_alerts')
          .update({
            product_name: editingAlert.product_name,
            current_price: editingAlert.current_price,
            target_price: editingAlert.target_price,
            alert_type: editingAlert.alert_type,
            threshold_percentage: editingAlert.threshold_percentage,
            is_active: editingAlert.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAlert.id)

        if (error) throw error
        toast.success('Uyarı başarıyla güncellendi')
      } else {
        // Create new
        const { error } = await supabase
          .from('admin_price_alerts')
          .insert([{
            product_id: `prod_${Date.now()}`,
            product_name: editingAlert.product_name,
            current_price: editingAlert.current_price,
            target_price: editingAlert.target_price,
            alert_type: editingAlert.alert_type,
            threshold_percentage: editingAlert.threshold_percentage,
            is_active: editingAlert.is_active,
            subscribers_count: 0,
            triggered_count: 0
          }])

        if (error) throw error
        toast.success('Uyarı başarıyla oluşturuldu')
      }

      setShowCreateModal(false)
      setEditingAlert(null)
      loadAlerts()
    } catch (error: any) {
      console.error('Error saving alert:', error)
      toast.error('Uyarı kaydedilirken hata oluştu')
    }
  }

  const handleEdit = (alert: PriceAlert) => {
    setEditingAlert({...alert})
    setShowCreateModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu fiyat uyarısını silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('admin_price_alerts')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Uyarı başarıyla silindi')
      loadAlerts()
    } catch (error: any) {
      console.error('Error deleting alert:', error)
      toast.error('Uyarı silinirken hata oluştu')
    }
  }

  const handleToggleActive = async (id: string) => {
    const alert = alerts.find(a => a.id === id)
    if (!alert) return

    try {
      const { error } = await supabase
        .from('admin_price_alerts')
        .update({ is_active: !alert.is_active })
        .eq('id', id)

      if (error) throw error
      loadAlerts()
      toast.success(`Uyarı ${!alert.is_active ? 'aktif' : 'pasif'} edildi`)
    } catch (error: any) {
      console.error('Error toggling alert:', error)
      toast.error('Uyarı durumu değiştirilemedi')
    }
  }

  const handleAddNew = () => {
    setEditingAlert({
      id: '',
      product_id: '',
      product_name: '',
      current_price: 0,
      target_price: 0,
      alert_type: 'price_drop',
      subscribers_count: 0,
      is_active: true,
      triggered_count: 0,
      created_at: ''
    })
    setShowCreateModal(true)
  }

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.is_active).length,
    subscribers: alerts.reduce((sum, a) => sum + a.subscribers_count, 0),
    triggered: alerts.reduce((sum, a) => sum + a.triggered_count, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp size={32} className="text-green-600" />
              Fiyat Uyarıları
            </h1>
            <p className="text-gray-600 mt-2">Ürün fiyat değişikliklerini takip edin ve kullanıcıları bilgilendirin</p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Yeni Uyarı
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Toplam Uyarı</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Package className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Aktif Uyarı</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <Bell className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Toplam Abone</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.subscribers}</p>
              </div>
              <Users className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tetiklenme</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.triggered}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Uyarı Tipi</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Tüm Tipler</option>
                {ALERT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Uyarı Bulunamadı
              </h3>
              <p className="text-gray-600">
                {filterType !== 'all' || filterActive !== 'all' ? 'Filtrelere uygun uyarı bulunamadı' : 'Henüz fiyat uyarısı eklenmemiş'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const typeInfo = ALERT_TYPES.find(t => t.value === alert.alert_type)
              const TypeIcon = typeInfo?.icon || TrendingUp
              const priceDiff = alert.target_price - alert.current_price
              const priceChangePercent = Math.abs((priceDiff / alert.current_price) * 100).toFixed(1)

              return (
                <div key={alert.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${typeInfo?.color}`}>
                        <TypeIcon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{alert.product_name}</h3>
                          {alert.is_active ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              Pasif
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo?.color}`}>
                            {typeInfo?.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Mevcut Fiyat</p>
                            <p className="text-lg font-semibold text-gray-900">₺{alert.current_price}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Hedef Fiyat</p>
                            <p className="text-lg font-semibold text-green-600">₺{alert.target_price}</p>
                          </div>
                          {alert.alert_type === 'threshold' && (
                            <div>
                              <p className="text-xs text-gray-500">Eşik Değeri</p>
                              <p className="text-lg font-semibold text-orange-600">%{alert.threshold_percentage}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Fark</p>
                            <p className={`text-lg font-semibold ${priceDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {priceDiff > 0 ? '+' : ''}{priceDiff > 0 ? `₺${priceDiff}` : `₺${Math.abs(priceDiff)}`} ({priceChangePercent}%)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{alert.subscribers_count} abone</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bell size={16} />
                            <span>{alert.triggered_count} kez tetiklendi</span>
                          </div>
                          {alert.last_triggered && (
                            <div className="flex items-center gap-2">
                              <span>Son: {new Date(alert.last_triggered).toLocaleDateString('tr-TR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(alert.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          alert.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {alert.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                      <button
                        onClick={() => handleEdit(alert)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                        title="Düzenle"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                        title="Sil"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && editingAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAlert.id ? 'Uyarı Düzenle' : 'Yeni Fiyat Uyarısı'}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı</label>
                  <input
                    type="text"
                    value={editingAlert.product_name}
                    onChange={(e) => setEditingAlert({...editingAlert, product_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ürün adı..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Fiyat (₺)</label>
                    <input
                      type="number"
                      value={editingAlert.current_price}
                      onChange={(e) => setEditingAlert({...editingAlert, current_price: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Fiyat (₺)</label>
                    <input
                      type="number"
                      value={editingAlert.target_price}
                      onChange={(e) => setEditingAlert({...editingAlert, target_price: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uyarı Tipi</label>
                  <div className="space-y-2">
                    {ALERT_TYPES.map((type) => {
                      const TypeIcon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setEditingAlert({...editingAlert, alert_type: type.value as any})}
                          className={`w-full text-left p-4 rounded-xl border-2 transition ${
                            editingAlert.alert_type === type.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl ${type.color}`}>
                              <TypeIcon size={20} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{type.label}</h4>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {editingAlert.alert_type === 'threshold' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eşik Yüzdesi (%)</label>
                    <input
                      type="number"
                      value={editingAlert.threshold_percentage || 0}
                      onChange={(e) => setEditingAlert({...editingAlert, threshold_percentage: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAlert.is_active}
                      onChange={(e) => setEditingAlert({...editingAlert, is_active: e.target.checked})}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAlert(null)
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-xl flex items-center gap-2"
                >
                  <X size={20} />
                  İptal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!editingAlert.product_name}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save size={20} />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

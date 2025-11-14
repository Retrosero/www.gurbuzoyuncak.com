import { useState, useEffect } from 'react'
import { 
  Bell, 
  Plus, 
  Send, 
  Users, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Eye
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  notification_type: 'info' | 'success' | 'warning' | 'error'
  target: 'all' | 'bayi' | 'b2c' | 'vip' | 'specific'
  target_users?: string[]
  status: 'draft' | 'scheduled' | 'sent'
  scheduled_at?: string
  sent_at?: string
  read_count: number
  total_recipients: number
  created_at: string
}

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Bilgilendirme', color: 'bg-[#74B9FF] text-white', icon: Bell },
  { value: 'success', label: 'Başarılı', color: 'bg-[#4ECDC4] text-white', icon: CheckCircle },
  { value: 'warning', label: 'Uyarı', color: 'bg-[#FFE66D] text-black', icon: AlertCircle },
  { value: 'error', label: 'Hata', color: 'bg-[#FF6B6B] text-white', icon: AlertCircle }
]

const TARGET_GROUPS = [
  { value: 'all', label: 'Tüm Kullanıcılar', description: 'Sistemdeki tüm kullanıcılara gönder' },
  { value: 'bayi', label: 'Bayiler', description: 'Sadece bayi hesaplarına gönder' },
  { value: 'b2c', label: 'Bireysel Müşteriler', description: 'B2C müşterilerine gönder' },
  { value: 'vip', label: 'VIP Müşteriler', description: 'VIP seviyesindeki kullanıcılara gönder' },
  { value: 'specific', label: 'Belirli Kullanıcılar', description: 'Seçtiğiniz kullanıcılara gönder' }
]

export default function AdminNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    title: '',
    message: '',
    notification_type: 'info',
    target: 'all',
    status: 'draft'
  })
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error: any) {
      console.error('Error loading notifications:', error)
      toast.error('Bildirimler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    const matchesStatus = filterStatus === 'all' || notif.status === filterStatus
    const matchesType = filterType === 'all' || notif.notification_type === filterType
    return matchesStatus && matchesType
  })

  const handleCreate = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Lütfen tüm alanları doldurun')
      return
    }

    try {
      // Simulate recipient count based on target
      let recipientCount = 100
      if (newNotification.target === 'all') recipientCount = Math.floor(Math.random() * 500) + 100
      else if (newNotification.target === 'bayi') recipientCount = Math.floor(Math.random() * 100) + 20
      else if (newNotification.target === 'vip') recipientCount = Math.floor(Math.random() * 50) + 10

      const { error } = await supabase
        .from('admin_notifications')
        .insert([{
          title: newNotification.title,
          message: newNotification.message,
          notification_type: newNotification.notification_type || 'info',
          target: newNotification.target || 'all',
          target_users: newNotification.target_users || [],
          status: 'sent',
          sent_at: new Date().toISOString(),
          read_count: 0,
          total_recipients: recipientCount
        }])

      if (error) throw error

      toast.success('Bildirim başarıyla gönderildi')
      setShowCreateModal(false)
      setNewNotification({
        title: '',
        message: '',
        notification_type: 'info',
        target: 'all',
        status: 'draft'
      })
      loadNotifications()
    } catch (error: any) {
      console.error('Error creating notification:', error)
      toast.error('Bildirim gönderilirken hata oluştu')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Bildirim başarıyla silindi')
      loadNotifications()
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      toast.error('Bildirim silinirken hata oluştu')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="px-3 py-1 bg-[#4ECDC4] text-white rounded-full text-xs font-medium">Gönderildi</span>
      case 'scheduled':
        return <span className="px-3 py-1 bg-[#74B9FF] text-white rounded-full text-xs font-medium">Planlandı</span>
      case 'draft':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Taslak</span>
      default:
        return null
    }
  }

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    scheduled: notifications.filter(n => n.status === 'scheduled').length,
    draft: notifications.filter(n => n.status === 'draft').length
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
              <Bell size={32} className="text-green-600" />
              Bildirim Merkezi
            </h1>
            <p className="text-gray-600 mt-2">Kullanıcılara bildirim gönder ve yönet</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Yeni Bildirim
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Toplam Bildirim</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Bell className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gönderilen</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.sent}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Planlanan</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.scheduled}</p>
              </div>
              <Clock className="text-green-600" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Taslak</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</p>
              </div>
              <Filter className="text-gray-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="sent">Gönderilen</option>
                <option value="scheduled">Planlanan</option>
                <option value="draft">Taslak</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tip</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Tüm Tipler</option>
                {NOTIFICATION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Bildirim Bulunamadı
              </h3>
              <p className="text-gray-600">
                {filterStatus !== 'all' || filterType !== 'all' ? 'Filtrelere uygun bildirim bulunamadı' : 'Henüz bildirim gönderilmemiş'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const typeInfo = NOTIFICATION_TYPES.find(t => t.value === notification.notification_type)
              const targetInfo = TARGET_GROUPS.find(t => t.value === notification.target)
              const TypeIcon = typeInfo?.icon || Bell

              return (
                <div key={notification.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${typeInfo?.color}`}>
                        <TypeIcon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                          {getStatusBadge(notification.status)}
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {targetInfo?.label}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{notification.total_recipients} alıcı</span>
                          </div>
                          {notification.status === 'sent' && (
                            <div className="flex items-center gap-2">
                              <Eye size={16} />
                              <span>{notification.read_count} okundu ({Math.round(notification.read_count / notification.total_recipients * 100)}%)</span>
                            </div>
                          )}
                          {notification.sent_at && (
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span>{new Date(notification.sent_at).toLocaleDateString('tr-TR', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl ml-4"
                      title="Sil"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Yeni Bildirim Oluştur</h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                  <input
                    type="text"
                    value={newNotification.title || ''}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Bildirim başlığı..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj</label>
                  <textarea
                    value={newNotification.message || ''}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Bildirim mesajı..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bildirim Tipi</label>
                  <div className="grid grid-cols-2 gap-3">
                    {NOTIFICATION_TYPES.map((type) => {
                      const TypeIcon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setNewNotification({...newNotification, notification_type: type.value as any})}
                          className={`p-4 rounded-xl border-2 transition ${
                            newNotification.notification_type === type.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${type.color}`}>
                              <TypeIcon size={20} />
                            </div>
                            <span className="font-medium">{type.label}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Kitle</label>
                  <div className="space-y-2">
                    {TARGET_GROUPS.map((group) => (
                      <button
                        key={group.value}
                        onClick={() => setNewNotification({...newNotification, target: group.value as any})}
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${
                          newNotification.target === group.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={newNotification.target === group.value}
                            onChange={() => {}}
                            className="w-4 h-4 text-green-600"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{group.label}</h4>
                            <p className="text-sm text-gray-600">{group.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newNotification.title || !newNotification.message}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={20} />
                  Gönder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Award,
  DollarSign,
  TrendingUp,
  Search
} from 'lucide-react'
import { toast } from 'sonner'

interface Bayi {
  id: string
  email: string
  dealer_company_name: string
  is_bayi: boolean
  bayi_discount_percentage: number
  bayi_status: string
  vip_level: number
  bayi_code: string
  created_at: string
  balance: number
}

const vipLevelNames = ['BRONZ', 'GÜMÜŞ', 'ALTIN', 'PLATİN', 'ELMAS']

export default function AdminBayiler() {
  const { user } = useAuth()
  const [bayiler, setBayiler] = useState<Bayi[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBayi, setSelectedBayi] = useState<Bayi | null>(null)
  const [editForm, setEditForm] = useState({
    bayi_discount_percentage: 0,
    bayi_status: 'active',
    vip_level: 1,
    is_bayi: true
  })

  useEffect(() => {
    fetchBayiler()
  }, [])

  const fetchBayiler = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBayiler(data || [])
    } catch (error) {
      console.error('Bayiler yüklenemedi:', error)
      toast.error('Bayi listesi yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (bayi: Bayi) => {
    setSelectedBayi(bayi)
    setEditForm({
      bayi_discount_percentage: bayi.bayi_discount_percentage || 0,
      bayi_status: bayi.bayi_status || 'active',
      vip_level: bayi.vip_level || 1,
      is_bayi: bayi.is_bayi || false
    })
    setShowEditModal(true)
  }

  const handleSave = async () => {
    if (!selectedBayi) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('id', selectedBayi.id)

      if (error) throw error

      toast.success('Bayi bilgileri güncellendi')
      setShowEditModal(false)
      fetchBayiler()
    } catch (error) {
      console.error('Bayi güncellenemedi:', error)
      toast.error('Bayi bilgileri güncellenirken hata oluştu')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getVIPColor = (level: number) => {
    const colors = [
      'text-orange-500', // BRONZ
      'text-gray-500',   // GÜMÜŞ
      'text-yellow-500', // ALTIN
      'text-green-500',   // PLATİN
      'text-cyan-500'    // ELMAS
    ]
    return colors[level - 1] || colors[0]
  }

  const filteredBayiler = bayiler.filter(bayi =>
    bayi.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bayi.dealer_company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bayi.bayi_code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bayi Yönetimi</h1>
            <p className="text-gray-600">Bayi hesaplarını yönetin ve indirim oranlarını ayarlayın</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">{filteredBayiler.length}</p>
            <p className="text-sm text-gray-500">Toplam Bayi</p>
          </div>
        </div>

        {/* Arama */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Bayi ara (email, firma adı, kod)..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bayi Listesi */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bayi Bilgileri</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">İndirim</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">VIP Seviye</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Durum</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bakiye</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBayiler.map((bayi) => (
                <tr key={bayi.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-800">{bayi.dealer_company_name || 'İsimsiz'}</p>
                      <p className="text-sm text-gray-600">{bayi.email}</p>
                      <p className="text-xs text-green-600">{bayi.bayi_code}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">%{bayi.bayi_discount_percentage || 0}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Award size={16} className={getVIPColor(bayi.vip_level)} />
                      <span className={`font-semibold ${getVIPColor(bayi.vip_level)}`}>
                        {vipLevelNames[bayi.vip_level - 1] || 'BRONZ'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(bayi.bayi_status)}`}>
                      {bayi.bayi_status || 'active'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} className="text-green-500" />
                      <span className="font-semibold text-green-600">
                        ₺{(bayi.balance || 0).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(bayi)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition"
                        title="Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedBayi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Bayi Düzenle</h2>
              <p className="text-sm text-gray-600">{selectedBayi.email}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İndirim Oranı (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  value={editForm.bayi_discount_percentage}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    bayi_discount_percentage: parseFloat(e.target.value)
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIP Seviyesi
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  value={editForm.vip_level}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    vip_level: parseInt(e.target.value)
                  })}
                >
                  <option value={1}>BRONZ</option>
                  <option value={2}>GÜMÜŞ</option>
                  <option value={3}>ALTIN</option>
                  <option value={4}>PLATİN</option>
                  <option value={5}>ELMAS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  value={editForm.bayi_status}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    bayi_status: e.target.value
                  })}
                >
                  <option value="active">Aktif</option>
                  <option value="suspended">Askıya Alınmış</option>
                  <option value="pending">Beklemede</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t flex gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-xl hover:bg-gray-600 transition"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
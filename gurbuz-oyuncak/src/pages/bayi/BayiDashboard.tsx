import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Award,
  Plus,
  Calendar,
  Clock
} from 'lucide-react'

interface DashboardStats {
  current_balance: number
  monthly_deposits: number
  monthly_purchases: number
  transaction_count: number
  vip_level: number
  dealer_company_name: string
}

interface Transaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
}

const vipLevelNames = ['BRONZ', 'GÜMÜŞ', 'ALTIN', 'PLATİN', 'ELMAS']

export default function BayiDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Edge function'dan dashboard verilerini çek
      const { data, error } = await supabase.functions.invoke('bayi-dashboard', {
        body: { user_id: user.id }
      })

      if (error) throw error

      if (data && data.data) {
        setStats(data.data.stats)
        setRecentTransactions(data.data.recent_transactions || [])
      }
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVIPLevelName = (level: number) => {
    return vipLevelNames[level - 1] || 'BRONZ'
  }

  const getVIPColor = (level: number) => {
    const colors = [
      'text-orange-500 bg-orange-50 border-orange-200', // BRONZ
      'text-gray-500 bg-gray-50 border-gray-200',       // GÜMÜŞ
      'text-yellow-500 bg-yellow-50 border-yellow-200', // ALTIN
      'text-blue-500 bg-blue-50 border-blue-200',       // PLATİN
      'text-cyan-500 bg-cyan-50 border-cyan-200'        // ELMAS
    ]
    return colors[level - 1] || colors[0]
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="text-green-500" size={20} />
      case 'purchase':
        return <TrendingDown className="text-red-500" size={20} />
      default:
        return <Activity className="text-blue-500" size={20} />
    }
  }

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Bakiye Yükleme',
      purchase: 'Alım',
      payment: 'Ödeme',
      refund: 'İade',
      transfer: 'Transfer',
      adjustment: 'Düzeltme',
      bonus: 'Bonus'
    }
    return labels[type] || type
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dashboard verileri yüklenemedi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hoşgeldin Mesajı */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Hoşgeldiniz, {stats.dealer_company_name}!</h2>
        <p className="text-blue-100">B2B Bayi paneline hoş geldiniz. Hesabınızı buradan yönetebilirsiniz.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Mevcut Bakiye */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Mevcut Bakiye</h3>
            <Wallet className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ₺{stats.current_balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Kullanılabilir bakiye</p>
        </div>

        {/* Bu Ay Yükleme */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Bu Ay Yükleme</h3>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ₺{stats.monthly_deposits.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Bu Ay Harcama */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Bu Ay Harcama</h3>
            <TrendingDown className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ₺{stats.monthly_purchases.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Toplam alım tutarı</p>
        </div>

        {/* İşlem Sayısı */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">İşlem Sayısı</h3>
            <Activity className="text-purple-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.transaction_count}</p>
          <p className="text-xs text-gray-500 mt-2">Bu ay</p>
        </div>
      </div>

      {/* VIP Seviye ve Hızlı Eylemler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VIP Seviye */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">VIP Seviyeniz</h3>
            <Award className="text-blue-600" size={24} />
          </div>
          <div className={`text-center py-8 rounded-lg border-2 ${getVIPColor(stats.vip_level)}`}>
            <Award size={48} className="mx-auto mb-3" />
            <p className="text-2xl font-bold mb-2">{getVIPLevelName(stats.vip_level)}</p>
            <p className="text-sm">Seviye {stats.vip_level}</p>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">✓ B2B İndirim: %30</p>
            <p className="mb-2">✓ Toptan İndirim: %40</p>
            <p>✓ Öncelikli Teslimat</p>
          </div>
        </div>

        {/* Hızlı Eylemler */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hızlı Eylemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/bayi/bakiye'}
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
            >
              <Plus className="text-blue-600" size={24} />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Bakiye Yükle</p>
                <p className="text-sm text-gray-600">Hesabınıza bakiye ekleyin</p>
              </div>
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition"
            >
              <Activity className="text-green-600" size={24} />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Alışverişe Başla</p>
                <p className="text-sm text-gray-600">Ürünleri inceleyin</p>
              </div>
            </button>
            <button
              onClick={() => window.location.href = '/bayi/siparisler'}
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
            >
              <Calendar className="text-purple-600" size={24} />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Siparişlerim</p>
                <p className="text-sm text-gray-600">Geçmiş siparişler</p>
              </div>
            </button>
            <button
              onClick={() => window.location.href = '/bayi/ayarlar'}
              className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition"
            >
              <Clock className="text-orange-600" size={24} />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Ayarlar</p>
                <p className="text-sm text-gray-600">Hesap yönetimi</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Son İşlemler */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Son İşlemler</h3>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Henüz işlem bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tip</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Açıklama</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tarih</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transaction_type)}
                        <span className="text-sm font-medium text-gray-700">
                          {getTransactionLabel(transaction.transaction_type)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-semibold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}
                      ₺{Math.abs(transaction.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

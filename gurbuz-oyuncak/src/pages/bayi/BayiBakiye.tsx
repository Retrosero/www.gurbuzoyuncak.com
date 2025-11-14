import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  Wallet, 
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Filter,
  Calendar,
  X
} from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
  balance_after: number
}

const transactionTypes = [
  { value: 'all', label: 'Tümü' },
  { value: 'deposit', label: 'Yükleme' },
  { value: 'purchase', label: 'Alım' },
  { value: 'payment', label: 'Ödeme' },
  { value: 'refund', label: 'İade' },
  { value: 'bonus', label: 'Bonus' }
]

export default function BayiBakiye() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [showLoadForm, setShowLoadForm] = useState(false)
  const [loadAmount, setLoadAmount] = useState('')
  const [loadNote, setLoadNote] = useState('')
  const [loadingRequest, setLoadingRequest] = useState(false)
  
  // Filtreler
  const [filterType, setFilterType] = useState('all')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    if (user) {
      fetchBalance()
      fetchTransactions()
    }
  }, [user, currentPage, filterType, filterStartDate, filterEndDate])

  const fetchBalance = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      if (data) {
        setCurrentBalance(data.balance || 0)
      }
    } catch (error) {
      console.error('Bakiye yüklenemedi:', error)
    }
  }

  const fetchTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Edge function'dan işlem geçmişini çek
      const { data, error } = await supabase.functions.invoke('bayi-balance', {
        body: { 
          user_id: user.id,
          action: 'get_transactions',
          page: currentPage,
          limit: itemsPerPage,
          transaction_type: filterType !== 'all' ? filterType : undefined,
          start_date: filterStartDate || undefined,
          end_date: filterEndDate || undefined
        }
      })

      if (error) throw error

      if (data && data.data) {
        setTransactions(data.data.transactions || [])
        setTotalPages(Math.ceil((data.data.total_count || 0) / itemsPerPage))
      }
    } catch (error) {
      console.error('İşlem geçmişi yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !loadAmount) return

    const amount = parseFloat(loadAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Geçerli bir tutar girin')
      return
    }

    try {
      setLoadingRequest(true)

      const { data, error } = await supabase.functions.invoke('bayi-balance', {
        body: {
          user_id: user.id,
          action: 'request_load',
          amount,
          note: loadNote || 'Bakiye yükleme talebi'
        }
      })

      if (error) throw error

      alert('Bakiye yükleme talebiniz alındı! Onaylandıktan sonra bakiyenize eklenecektir.')
      setShowLoadForm(false)
      setLoadAmount('')
      setLoadNote('')
      fetchTransactions()
    } catch (error) {
      console.error('Yükleme talebi gönderilemedi:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoadingRequest(false)
    }
  }

  const resetFilters = () => {
    setFilterType('all')
    setFilterStartDate('')
    setFilterEndDate('')
    setCurrentPage(1)
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

  return (
    <div className="space-y-6">
      {/* Bakiye Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Mevcut Bakiye</h3>
            <Wallet size={24} />
          </div>
          <p className="text-4xl font-bold mb-1">
            ₺{currentBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-green-100 text-sm">Kullanılabilir bakiye</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Hızlı İşlemler</h3>
          <button
            onClick={() => setShowLoadForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition font-medium"
          >
            <Plus size={20} />
            Bakiye Yükleme Talebi
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Bilgi</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Bakiye yükleme talebiniz admin onayından sonra hesabınıza yansıyacaktır.
          </p>
        </div>
      </div>

      {/* Bakiye Yükleme Formu Modal */}
      {showLoadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Bakiye Yükleme Talebi</h3>
              <button
                onClick={() => setShowLoadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleLoadRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yüklenecek Tutar (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-blue-500"
                  placeholder="Örn: 5000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Not (Opsiyonel)
                </label>
                <textarea
                  value={loadNote}
                  onChange={(e) => setLoadNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-blue-500"
                  rows={3}
                  placeholder="Ödeme detayları veya notlarınızı yazın..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoadForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loadingRequest}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-blue-400"
                >
                  {loadingRequest ? 'Gönderiliyor...' : 'Talep Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">İşlem Geçmişi</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <Filter size={18} />
            Filtrele
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tipi</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              >
                {transactionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
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

        {/* İşlem Tablosu */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz işlem bulunmuyor.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tip</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Açıklama</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tarih</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tutar</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Kalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
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
                      <td className="py-3 px-4 text-right text-sm text-gray-700 font-medium">
                        ₺{transaction.balance_after.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Önceki
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

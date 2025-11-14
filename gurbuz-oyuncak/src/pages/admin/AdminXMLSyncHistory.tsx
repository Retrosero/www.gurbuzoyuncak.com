import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { History, CheckCircle, XCircle, Clock, Eye, RefreshCw, Download, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SyncHistory {
  id: string
  sync_type: string
  source_type: string
  source_name: string
  total_products: number
  new_products: number
  updated_products: number
  deactivated_products: number
  failed_products: number
  skipped_products: number
  status: string
  started_at: string
  completed_at: string
  processing_time_ms: number
  error_message?: string
}

interface SyncLog {
  id: string
  product_code: string
  product_name: string
  action: string
  old_values: any
  new_values: any
  changes: any
  error_message?: string
  created_at: string
}

export default function AdminXMLSyncHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<SyncHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSync, setSelectedSync] = useState<string | null>(null)
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    loadHistory()
  }, [statusFilter, typeFilter])

  const loadHistory = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('xml_sync_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (typeFilter !== 'all') {
        query = query.eq('sync_type', typeFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error('Geçmiş yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSyncLogs = async (syncId: string) => {
    setLogsLoading(true)
    setSelectedSync(syncId)
    try {
      const { data, error } = await supabase
        .from('xml_sync_logs')
        .select('*')
        .eq('sync_id', syncId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSyncLogs(data || [])
    } catch (error) {
      console.error('Log yükleme hatası:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Tamamlandı' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Başarısız' },
      processing: { color: 'bg-green-100 text-green-800', icon: RefreshCw, label: 'İşleniyor' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Bekliyor' },
    }

    const badge = badges[status as keyof typeof badges] || badges.pending
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
  }

  const getActionBadge = (action: string) => {
    const colors = {
      insert: 'bg-green-100 text-green-800',
      update: 'bg-green-100 text-green-800',
      deactivate: 'bg-orange-100 text-orange-800',
      skip: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    }

    const labels = {
      insert: 'Yeni Eklendi',
      update: 'Güncellendi',
      deactivate: 'Pasifleştirildi',
      skip: 'Atlandı',
      error: 'Hata'
    }

    return (
      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${colors[action as keyof typeof colors]}`}>
        {labels[action as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = (sync: SyncHistory) => {
    // CSV export fonksiyonu
    const headers = ['Ürün Kodu', 'Ürün Adı', 'İşlem', 'Hata']
    const rows = syncLogs.map(log => [
      log.product_code,
      log.product_name,
      log.action,
      log.error_message || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sync-${sync.id}-logs.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <History className="w-8 h-8" />
                Senkronizasyon Geçmişi
              </h1>
              <p className="text-green-100 mt-2">Tüm XML senkronizasyon işlemlerini görüntüleyin</p>
            </div>
            <button
              onClick={() => navigate('/admin/xml/yukle')}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtreler */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tümü</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="failed">Başarısız</option>
                  <option value="processing">İşleniyor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tümü</option>
                  <option value="manual">Manuel</option>
                  <option value="scheduled">Zamanlanmış</option>
                  <option value="auto">Otomatik</option>
                </select>
              </div>
            </div>
            <button
              onClick={loadHistory}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
          </div>
        </div>

        {/* Geçmiş Listesi */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-green-600 mb-2" />
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Henüz senkronizasyon kaydı yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Yeni</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Güncellenen</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pasif</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hata</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Süre</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.map((sync) => (
                    <tr key={sync.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(sync.started_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{sync.source_name}</div>
                        <div className="text-xs text-gray-500">
                          {sync.source_type === 'file' ? 'Dosya' : 'URL'} • {sync.sync_type === 'manual' ? 'Manuel' : 'Otomatik'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(sync.status)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold">{sync.total_products}</td>
                      <td className="px-4 py-3 text-center text-sm text-green-600 font-semibold">{sync.new_products}</td>
                      <td className="px-4 py-3 text-center text-sm text-green-600 font-semibold">{sync.updated_products}</td>
                      <td className="px-4 py-3 text-center text-sm text-orange-600 font-semibold">{sync.deactivated_products}</td>
                      <td className="px-4 py-3 text-center text-sm text-red-600 font-semibold">{sync.failed_products}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sync.processing_time_ms ? `${(sync.processing_time_ms / 1000).toFixed(1)}s` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => loadSyncLogs(sync.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          <Eye className="w-4 h-4" />
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detay Modal */}
        {selectedSync && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-bold">Senkronizasyon Detayları</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const sync = history.find(h => h.id === selectedSync)
                      if (sync) exportToCSV(sync)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    CSV İndir
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSync(null)
                      setSyncLogs([])
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    Kapat
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {logsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-green-600 mb-2" />
                    <p className="text-gray-600">Detaylar yükleniyor...</p>
                  </div>
                ) : syncLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Log bulunamadı</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ürün Kodu</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ürün Adı</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Değişiklikler</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hata</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {syncLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-mono">{log.product_code}</td>
                            <td className="px-4 py-2 text-sm">{log.product_name}</td>
                            <td className="px-4 py-2">{getActionBadge(log.action)}</td>
                            <td className="px-4 py-2 text-sm">
                              {log.changes && typeof log.changes === 'object' ? (
                                <div className="text-xs space-y-1">
                                  {Object.entries(log.changes).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-semibold">{key}:</span> {JSON.stringify(value)}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm text-red-600">
                              {log.error_message || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

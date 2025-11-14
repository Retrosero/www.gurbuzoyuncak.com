import { useState } from 'react'
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  FileBarChart
} from 'lucide-react'

type ReportType = 'sales' | 'products' | 'customers' | 'orders' | 'revenue' | ''
type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom'

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('')
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [generating, setGenerating] = useState(false)

  const reportTypes = [
    {
      id: 'sales' as ReportType,
      name: 'Satış Raporu',
      description: 'Detaylı satış performans raporu',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 'products' as ReportType,
      name: 'Ürün Raporu',
      description: 'Ürün bazlı satış ve stok raporu',
      icon: Package,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 'customers' as ReportType,
      name: 'Müşteri Raporu',
      description: 'Müşteri aktivite ve davranış raporu',
      icon: Users,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 'orders' as ReportType,
      name: 'Sipariş Raporu',
      description: 'Sipariş detayları ve durum raporu',
      icon: ShoppingCart,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      id: 'revenue' as ReportType,
      name: 'Gelir Raporu',
      description: 'Toplam gelir ve kar marjı analizi',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50'
    }
  ]

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    if (!selectedReport) {
      alert('Lütfen bir rapor türü seçin')
      return
    }

    setGenerating(true)
    
    // Simulated report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Rapor'
    const fileName = `${reportName}_${dateRange}_${Date.now()}.${format}`
    
    alert(`${fileName} başarıyla oluşturuldu! (Demo - Gerçek dosya indirme yakında eklenecek)`)
    
    setGenerating(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileBarChart size={32} className="text-green-600" />
            Raporlar
          </h1>
          <p className="text-gray-600 mt-2">Detaylı raporlar oluşturun ve analiz edin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rapor Türü Seçimi */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <h2 className="text-lg font-semibold mb-4">Rapor Türü</h2>
              <div className="space-y-3">
                {reportTypes.map((report) => {
                  const Icon = report.icon
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedReport === report.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${report.color}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{report.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Rapor Ayarları ve Önizleme */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarih Aralığı */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Tarih Aralığı
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {[
                  { value: 'today', label: 'Bugün' },
                  { value: 'week', label: 'Bu Hafta' },
                  { value: 'month', label: 'Bu Ay' },
                  { value: 'year', label: 'Bu Yıl' },
                  { value: 'custom', label: 'Özel' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setDateRange(range.value as DateRange)}
                    className={`px-4 py-2 rounded-xl border-2 transition ${
                      dateRange === range.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rapor Özeti */}
            {selectedReport ? (
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
                <h2 className="text-lg font-semibold mb-4">Rapor Özeti</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Rapor Türü:</span>
                    <span className="font-semibold">
                      {reportTypes.find(r => r.id === selectedReport)?.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Tarih Aralığı:</span>
                    <span className="font-semibold">
                      {dateRange === 'today' && 'Bugün'}
                      {dateRange === 'week' && 'Bu Hafta'}
                      {dateRange === 'month' && 'Bu Ay'}
                      {dateRange === 'year' && 'Bu Yıl'}
                      {dateRange === 'custom' && 'Özel Tarih'}
                    </span>
                  </div>

                  {dateRange === 'custom' && startDate && endDate && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-700">Tarih:</span>
                      <span className="font-semibold">
                        {new Date(startDate).toLocaleDateString('tr-TR')} - {new Date(endDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Export Buttons */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleGenerateReport('pdf')}
                    disabled={generating}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                  >
                    <Download size={20} />
                    {generating ? 'Oluşturuluyor...' : 'PDF İndir'}
                  </button>
                  
                  <button
                    onClick={() => handleGenerateReport('excel')}
                    disabled={generating}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                  >
                    <Download size={20} />
                    {generating ? 'Oluşturuluyor...' : 'Excel İndir'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Rapor Seçin
                </h3>
                <p className="text-gray-600">
                  Lütfen sol taraftan bir rapor türü seçin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

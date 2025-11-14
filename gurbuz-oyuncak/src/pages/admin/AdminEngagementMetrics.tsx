import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Progress } from '../../components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Eye, 
  Heart, 
  ShoppingCart, 
  Search,
  MousePointer,
  Clock,
  Target,
  Zap,
  Award,
  Star,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface EngagementMetrics {
  user_id: string
  email: string
  full_name: string
  customer_type: string
  daily_activity: number
  weekly_activity: number
  monthly_activity: number
  total_views: number
  total_favorites_added: number
  total_cart_additions: number
  total_purchases: number
  total_searches: number
  total_sessions: number
  avg_session_duration: number
  view_to_favorite_rate: number
  favorite_to_cart_rate: number
  cart_to_purchase_rate: number
  hours_since_last_activity: number
}

interface MetricOverview {
  name: string
  value: number
  change: number
  target: number
  status: 'good' | 'warning' | 'critical'
  description: string
}

interface TimeSeriesData {
  date: string
  views: number
  favorites: number
  cart_adds: number
  purchases: number
  sessions: number
}

interface MetricComparison {
  metric: string
  current: number
  previous: number
  change_percent: number
  trend: 'up' | 'down' | 'stable'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function AdminEngagementMetrics() {
  const [engagementData, setEngagementData] = useState<EngagementMetrics[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [metricComparisons, setMetricComparisons] = useState<MetricComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [customerType, setCustomerType] = useState('all')
  const [metricFilter, setMetricFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchEngagementData()
    fetchTimeSeriesData()
    fetchMetricComparisons()
  }, [timeRange, customerType])

  const fetchEngagementData = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('user_engagement_metrics')
        .select('*')
        .order('monthly_activity', { ascending: false })

      if (customerType !== 'all') {
        query = query.eq('customer_type', customerType)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error
      setEngagementData(data || [])
    } catch (error) {
      console.error('Engagement data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeSeriesData = async () => {
    // Son 30 günlük zaman serisi verisi simülasyonu
    const days = parseInt(timeRange)
    const data: TimeSeriesData[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 1000) + 200,
        favorites: Math.floor(Math.random() * 150) + 30,
        cart_adds: Math.floor(Math.random() * 80) + 15,
        purchases: Math.floor(Math.random() * 40) + 8,
        sessions: Math.floor(Math.random() * 300) + 100
      })
    }
    
    setTimeSeriesData(data)
  }

  const fetchMetricComparisons = async () => {
    // Metrik karşılaştırmaları simülasyonu
    const comparisons: MetricComparison[] = [
      { metric: 'Günlük Aktif Kullanıcı', current: 1250, previous: 1180, change_percent: 5.9, trend: 'up' },
      { metric: 'Ortalama Oturum Süresi', current: 8.5, previous: 7.2, change_percent: 18.1, trend: 'up' },
      { metric: 'Sayfa Görüntüleme', current: 45200, previous: 42100, change_percent: 7.4, trend: 'up' },
      { metric: 'Favori Ekleme Oranı', current: 15.2, previous: 16.8, change_percent: -9.5, trend: 'down' },
      { metric: 'Sepete Ekleme Oranı', current: 8.7, previous: 7.9, change_percent: 10.1, trend: 'up' },
      { metric: 'Dönüşüm Oranı', current: 3.2, previous: 2.8, change_percent: 14.3, trend: 'up' },
      { metric: 'Bounce Rate', current: 42.5, previous: 48.2, change_percent: -11.8, trend: 'up' },
      { metric: 'Return Visitor Rate', current: 68.3, previous: 64.1, change_percent: 6.6, trend: 'up' }
    ]

    setMetricComparisons(comparisons)
  }

  const exportMetricsData = () => {
    const csvData = engagementData.map(user => ({
      'Email': user.email,
      'İsim': user.full_name,
      'Tip': user.customer_type,
      'Günlük Aktivite': user.daily_activity,
      'Haftalık Aktivite': user.weekly_activity,
      'Aylık Aktivite': user.monthly_activity,
      'Toplam Görüntüleme': user.total_views,
      'Toplam Favori': user.total_favorites_added,
      'Toplam Sepet': user.total_cart_additions,
      'Toplam Satın Alma': user.total_purchases,
      'Toplam Arama': user.total_searches,
      'Oturum Sayısı': user.total_sessions,
      'Ort. Oturum Süresi': Math.round(user.avg_session_duration / 60),
      'Favori Oranı': user.view_to_favorite_rate,
      'Sepet Oranı': user.favorite_to_cart_rate,
      'Satın Alma Oranı': user.cart_to_purchase_rate
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `engagement-metrics-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-500" />
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  // Metrik özeti hesaplamaları
  const totalUsers = engagementData.length
  const avgDailyActivity = engagementData.reduce((sum, user) => sum + user.daily_activity, 0) / totalUsers || 0
  const avgWeeklyActivity = engagementData.reduce((sum, user) => sum + user.weekly_activity, 0) / totalUsers || 0
  const avgMonthlyActivity = engagementData.reduce((sum, user) => sum + user.monthly_activity, 0) / totalUsers || 0
  const avgSessionDuration = engagementData.reduce((sum, user) => sum + user.avg_session_duration, 0) / totalUsers || 0
  const avgConversionRate = engagementData.reduce((sum, user) => sum + user.cart_to_purchase_rate, 0) / totalUsers || 0
  const highEngagementUsers = engagementData.filter(user => user.monthly_activity >= 50).length

  const metricOverview: MetricOverview[] = [
    {
      name: 'Günlük Aktif Kullanıcı',
      value: Math.round(avgDailyActivity * 10),
      change: 5.9,
      target: 1500,
      status: 'good',
      description: 'Günlük en az bir aktivite gerçekleştiren kullanıcı sayısı'
    },
    {
      name: 'Ortalama Oturum Süresi',
      value: Math.round(avgSessionDuration / 60),
      change: 18.1,
      target: 10,
      status: 'warning',
      description: 'Kullanıcıların ortalama oturum süresi (dakika)'
    },
    {
      name: 'Sayfa Görüntüleme',
      value: Math.round(avgMonthlyActivity * 100),
      change: 7.4,
      target: 50000,
      status: 'good',
      description: 'Toplam sayfa görüntüleme sayısı'
    },
    {
      name: 'Dönüşüm Oranı',
      value: Math.round(avgConversionRate * 10) / 10,
      change: 14.3,
      target: 5.0,
      status: 'critical',
      description: 'Sepetten satın almaya dönüşüm oranı (%)'
    },
    {
      name: 'Yüksek Engagement',
      value: highEngagementUsers,
      change: 12.5,
      target: 200,
      status: 'warning',
      description: '50+ aylık aktiviteye sahip kullanıcı sayısı'
    },
    {
      name: 'Return Visitor Rate',
      value: 68.3,
      change: 6.6,
      target: 75.0,
      status: 'good',
      description: 'Tekrar ziyaret eden kullanıcı oranı (%)'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Engagement Metrikleri</h1>
          <p className="text-gray-600 mt-1">Kullanıcı etkileşim ve engagement ölçümleri</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportMetricsData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={fetchEngagementData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Zaman Aralığı</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Son 7 Gün</SelectItem>
                  <SelectItem value="30">Son 30 Gün</SelectItem>
                  <SelectItem value="90">Son 90 Gün</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Müşteri Tipi</label>
              <Select value={customerType} onValueChange={setCustomerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="B2C">B2C</SelectItem>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="Toptan">Toptan</SelectItem>
                  <SelectItem value="Kurumsal">Kurumsal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Metrik Filtresi</label>
              <Select value={metricFilter} onValueChange={setMetricFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Metrikler</SelectItem>
                  <SelectItem value="activity">Aktivite</SelectItem>
                  <SelectItem value="conversion">Dönüşüm</SelectItem>
                  <SelectItem value="retention">El Tutma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricOverview.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status === 'good' ? 'İyi' : metric.status === 'warning' ? 'Uyarı' : 'Kritik'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(metric.change > 0 ? 'up' : metric.change < 0 ? 'down' : 'stable')}
                    <span className={`text-sm ml-1 ${metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Hedef</p>
                  <p className="font-medium">{metric.target}</p>
                  <Progress value={(metric.value / metric.target) * 100} className="w-20 mt-1" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="trends">Trendler</TabsTrigger>
          <TabsTrigger value="comparisons">Karşılaştırmalar</TabsTrigger>
          <TabsTrigger value="insights">İçgörüler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Günlük Aktivite Trendi</CardTitle>
                <CardDescription>Son 30 günlük aktivite verileri</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="views" fill="#8884d8" name="Görüntüleme" />
                    <Bar yAxisId="left" dataKey="favorites" fill="#82ca9d" name="Favoriler" />
                    <Line yAxisId="right" type="monotone" dataKey="sessions" stroke="#ff7300" strokeWidth={2} name="Oturumlar" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Davranış Dağılımı</CardTitle>
                <CardDescription>Farklı aktivite türlerinin oranları</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Görüntüleme', value: engagementData.reduce((s, u) => s + u.total_views, 0) },
                        { name: 'Favori Ekleme', value: engagementData.reduce((s, u) => s + u.total_favorites_added, 0) },
                        { name: 'Sepete Ekleme', value: engagementData.reduce((s, u) => s + u.total_cart_additions, 0) },
                        { name: 'Satın Alma', value: engagementData.reduce((s, u) => s + u.total_purchases, 0) },
                        { name: 'Arama', value: engagementData.reduce((s, u) => s + u.total_searches, 0) }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Engagement Skoru</CardTitle>
              <CardDescription>Bireysel kullanıcı engagement analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={engagementData.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="monthly_activity" 
                    name="Aylık Aktivite"
                    unit="aktivite"
                  />
                  <YAxis 
                    dataKey="avg_session_duration" 
                    name="Ortalama Süre"
                    unit="dk"
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'monthly_activity' ? `${value} aktivite` : `${Math.round(value / 60)} dakika`,
                      name === 'monthly_activity' ? 'Aylık Aktivite' : 'Ortalama Oturum Süresi'
                    ]}
                    labelFormatter={(label) => `Kullanıcı Engagement`}
                  />
                  <Scatter dataKey="cart_to_purchase_rate" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metrik Trend Analizi</CardTitle>
              <CardDescription>Zaman bazlı metrik değişimleri</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} name="Görüntüleme" />
                  <Line type="monotone" dataKey="favorites" stroke="#82ca9d" strokeWidth={2} name="Favoriler" />
                  <Line type="monotone" dataKey="cart_adds" stroke="#ffc658" strokeWidth={2} name="Sepete Ekleme" />
                  <Line type="monotone" dataKey="purchases" stroke="#ff7c7c" strokeWidth={2} name="Satın Alma" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktivite Artış Trendi</CardTitle>
                <CardDescription>En çok artış gösteren metrikler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricComparisons
                    .filter(m => m.change_percent > 0)
                    .sort((a, b) => b.change_percent - a.change_percent)
                    .slice(0, 5)
                    .map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-xl">
                        <div>
                          <p className="font-medium">{metric.metric}</p>
                          <p className="text-sm text-gray-500">
                            {metric.current.toLocaleString()} (önceki: {metric.previous.toLocaleString()})
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            +{metric.change_percent.toFixed(1)}%
                          </Badge>
                          {getTrendIcon('up')}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktivite Düşüş Trendi</CardTitle>
                <CardDescription>Dikkat gerektiren metrikler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricComparisons
                    .filter(m => m.change_percent < 0)
                    .sort((a, b) => a.change_percent - b.change_percent)
                    .slice(0, 5)
                    .map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-xl">
                        <div>
                          <p className="font-medium">{metric.metric}</p>
                          <p className="text-sm text-gray-500">
                            {metric.current.toLocaleString()} (önceki: {metric.previous.toLocaleString()})
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {metric.change_percent.toFixed(1)}%
                          </Badge>
                          {getTrendIcon('down')}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dönemsel Karşılaştırma</CardTitle>
              <CardDescription>Önceki dönemle karşılaştırmalı analiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricComparisons.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{metric.metric}</h3>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Mevcut Dönem</p>
                          <p className="font-medium">{metric.current.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Önceki Dönem</p>
                          <p className="font-medium">{metric.previous.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <p className="text-2xl font-bold">
                          {metric.change_percent > 0 ? '+' : ''}{metric.change_percent.toFixed(1)}%
                        </p>
                      </div>
                      <Progress 
                        value={Math.min(100, Math.abs(metric.change_percent))} 
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performans İçgörüleri</CardTitle>
                <CardDescription>Metrik analizine dayalı öneriler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-green-900">Güçlü Performans</h4>
                    </div>
                    <p className="text-sm text-green-800">
                      Dönüşüm oranı %14.3 artış gösterdi. Sepet sürecinde yapılan iyileştirmeler etkili oldu.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <h4 className="font-medium text-yellow-900">İyileştirme Alanı</h4>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Favori ekleme oranı %9.5 azaldı. Kullanıcı deneyimi gözden geçirilmeli.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-green-900">Fırsat</h4>
                    </div>
                    <p className="text-sm text-green-800">
                      Oturum süresi %18.1 arttı. Kullanıcılar daha fazla içerik tüketiyor.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium text-purple-900">Kullanıcı Segmenti</h4>
                    </div>
                    <p className="text-sm text-purple-800">
                      Yüksek engagement kullanıcıları %12.5 arttı. VIP programı etkili.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Önerilen Aksiyonlar</CardTitle>
                <CardDescription>Performansı artırmak için yapılacaklar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-xl">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-red-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Favori Özelliğini İyileştir</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Favori ekleme sürecini basitleştir ve daha görünür hale getir.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-xl">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-yellow-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Retargeting Kampanyası</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Düşük engagement kullanıcıları için özel kampanya başlat.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-xl">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-green-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">İçerik Optimizasyonu</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Artan oturum süresini değerlendirerek içerik stratejisini geliştir.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-xl">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-green-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Dönüşüm Hunisi İyileştirme</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Sepet terk oranını azaltmak için reminder sistemleri kur.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hedef vs Gerçekleşen</CardTitle>
              <CardDescription>Aylık hedefler ve performans karşılaştırması</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricOverview.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-xl">
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-gray-500">
                        Hedef: {metric.target} | Gerçekleşen: {metric.value}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        %{((metric.value / metric.target) * 100).toFixed(0)}
                      </p>
                      <Progress 
                        value={Math.min(100, (metric.value / metric.target) * 100)} 
                        className="w-24 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
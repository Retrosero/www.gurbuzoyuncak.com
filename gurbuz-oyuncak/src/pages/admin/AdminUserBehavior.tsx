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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Heart, 
  ShoppingCart, 
  Search,
  Clock,
  Users,
  Target,
  Zap,
  Calendar,
  MousePointer,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface UserBehavior {
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

interface BehaviorPattern {
  pattern_name: string
  user_count: number
  description: string
  characteristics: string[]
  conversion_rate: number
}

interface NavigationPath {
  from_page: string
  to_page: string
  transition_count: number
  avg_duration: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function AdminUserBehavior() {
  const [behaviorData, setBehaviorData] = useState<UserBehavior[]>([])
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([])
  const [navigationPaths, setNavigationPaths] = useState<NavigationPath[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [customerType, setCustomerType] = useState('all')
  const [activityLevel, setActivityLevel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('patterns')

  useEffect(() => {
    fetchBehaviorData()
    fetchBehaviorPatterns()
    fetchNavigationPaths()
  }, [timeRange, customerType, activityLevel])

  const fetchBehaviorData = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('user_engagement_metrics')
        .select('*')
        .order('monthly_activity', { ascending: false })

      if (customerType !== 'all') {
        query = query.eq('customer_type', customerType)
      }

      if (activityLevel !== 'all') {
        if (activityLevel === 'high') {
          query = query.gte('monthly_activity', 50)
        } else if (activityLevel === 'medium') {
          query = query.gte('monthly_activity', 20).lt('monthly_activity', 50)
        } else if (activityLevel === 'low') {
          query = query.lt('monthly_activity', 20)
        }
      }

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error
      setBehaviorData(data || [])
    } catch (error) {
      console.error('Behavior data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBehaviorPatterns = async () => {
    // Davranış örüntüleri simülasyonu
    const patterns: BehaviorPattern[] = [
      {
        pattern_name: 'Yüksek Engagement',
        user_count: 45,
        description: 'Günlük aktif kullanıcılar, yüksek etkileşim',
        characteristics: ['50+ aylık aktivite', 'Yüksek favori oranı', 'Düşük terk oranı'],
        conversion_rate: 85.5
      },
      {
        pattern_name: 'Orta Seviye Kullanıcı',
        user_count: 120,
        description: 'Haftalık ortalama aktivite',
        characteristics: ['20-50 aylık aktivite', 'Orta favori oranı', 'Normal terk oranı'],
        conversion_rate: 62.3
      },
      {
        pattern_name: 'Pasif Kullanıcı',
        user_count: 89,
        description: 'Düşük aktivite, nadir ziyaret',
        characteristics: ['<20 aylık aktivite', 'Düşük favori oranı', 'Yüksek terk oranı'],
        conversion_rate: 28.7
      },
      {
        pattern_name: 'Hızlı Karar Verici',
        user_count: 34,
        description: 'Hızlı ürün keşfi ve satın alma',
        characteristics: ['Yüksek görüntüleme', 'Az sayfa gezme', 'Hızlı sepete ekleme'],
        conversion_rate: 92.1
      },
      {
        pattern_name: 'Detaycı Kullanıcı',
        user_count: 67,
        description: 'Ürün detaylarını inceleyerek karar verir',
        characteristics: ['Uzun oturum süresi', 'Çok sayfa gezme', 'Karşılaştırma yapma'],
        conversion_rate: 71.8
      },
      {
        pattern_name: 'Fiyat Odaklı',
        user_count: 56,
        description: 'Fiyat karşılaştırması yapar',
        characteristics: ['Fiyat filtreleme', 'İndirim arama', 'Çoklu marka inceleme'],
        conversion_rate: 45.2
      }
    ]

    setBehaviorPatterns(patterns)
  }

  const fetchNavigationPaths = async () => {
    // Sayfa geçiş yolları simülasyonu
    const paths: NavigationPath[] = [
      { from_page: 'Ana Sayfa', to_page: 'Ürün Detay', transition_count: 1250, avg_duration: 45 },
      { from_page: 'Ürün Detay', to_page: 'Sepet', transition_count: 680, avg_duration: 120 },
      { from_page: 'Sepet', to_page: 'Ödeme', transition_count: 420, avg_duration: 180 },
      { from_page: 'Kategori', to_page: 'Ürün Listesi', transition_count: 890, avg_duration: 60 },
      { from_page: 'Arama', to_page: 'Ürün Detay', transition_count: 560, avg_duration: 90 },
      { from_page: 'Favoriler', to_page: 'Sepet', transition_count: 340, avg_duration: 75 },
      { from_page: 'Ana Sayfa', to_page: 'Kategori', transition_count: 720, avg_duration: 30 },
      { from_page: 'Ürün Detay', to_page: 'Favoriler', transition_count: 290, avg_duration: 15 }
    ]

    setNavigationPaths(paths)
  }

  const exportBehaviorData = () => {
    const csvData = behaviorData.map(user => ({
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
    link.download = `davranis-analizi-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getCustomerTypeColor = (type: string) => {
    const colors = {
      'B2C': 'bg-green-100 text-green-800',
      'B2B': 'bg-green-100 text-green-800',
      'Toptan': 'bg-purple-100 text-purple-800',
      'Kurumsal': 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getActivityLevelBadge = (monthly: number) => {
    if (monthly >= 50) return { variant: 'default' as const, text: 'Yüksek', color: 'text-green-600' }
    if (monthly >= 20) return { variant: 'secondary' as const, text: 'Orta', color: 'text-green-600' }
    return { variant: 'outline' as const, text: 'Düşük', color: 'text-gray-600' }
  }

  const getEngagementScore = (user: UserBehavior) => {
    const weightedScore = (
      user.daily_activity * 0.4 +
      user.view_to_favorite_rate * 0.2 +
      user.favorite_to_cart_rate * 0.2 +
      user.cart_to_purchase_rate * 0.2
    )
    return Math.min(100, weightedScore)
  }

  const totalUsers = behaviorData.length
  const avgMonthlyActivity = behaviorData.reduce((sum, user) => sum + user.monthly_activity, 0) / totalUsers || 0
  const avgSessionDuration = behaviorData.reduce((sum, user) => sum + user.avg_session_duration, 0) / totalUsers || 0
  const highEngagementUsers = behaviorData.filter(user => getEngagementScore(user) >= 70).length
  const conversionRate = behaviorData.reduce((sum, user) => sum + user.cart_to_purchase_rate, 0) / totalUsers || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Davranış Analizi</h1>
          <p className="text-gray-600 mt-1">Kullanıcı etkileşim örüntüleri ve davranış analizi</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportBehaviorData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={fetchBehaviorData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="text-sm font-medium mb-2 block">Aktivite Seviyesi</label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Seviyeler</SelectItem>
                  <SelectItem value="high">Yüksek (50+)</SelectItem>
                  <SelectItem value="medium">Orta (20-49)</SelectItem>
                  <SelectItem value="low">Düşük (&lt;20)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ara</label>
              <Input
                placeholder="Email veya isim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchBehaviorData()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Aktif kullanıcı</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Aylık Aktivite</p>
                <p className="text-3xl font-bold text-gray-900">{avgMonthlyActivity.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yüksek Engagement</p>
                <p className="text-3xl font-bold text-gray-900">{highEngagementUsers}</p>
                <div className="flex items-center mt-1">
                  <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Güçlü kullanıcı</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dönüşüm Oranı</p>
                <p className="text-3xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Satın alma</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="patterns">Davranış Örüntüleri</TabsTrigger>
          <TabsTrigger value="navigation">Sayfa Geçişleri</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversion">Dönüşüm Hunisi</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Davranış Örüntüleri Dağılımı</CardTitle>
                <CardDescription>Kullanıcı davranış kategorileri</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={behaviorPatterns}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ pattern_name, percent }) => `${pattern_name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="user_count"
                    >
                      {behaviorPatterns.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Örüntü Performans Karşılaştırması</CardTitle>
                <CardDescription>Dönüşüm oranlarına göre davranış grupları</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={behaviorPatterns} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="pattern_name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="conversion_rate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Davranış Örüntü Detayları</CardTitle>
              <CardDescription>Her davranış grubunun detaylı analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorPatterns.map((pattern, index) => (
                  <div key={index} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{pattern.pattern_name}</h3>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{pattern.user_count} kullanıcı</Badge>
                        <Badge variant={pattern.conversion_rate > 70 ? 'default' : 'secondary'}>
                          {pattern.conversion_rate.toFixed(1)}% dönüşüm
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {pattern.characteristics.map((char, charIndex) => (
                        <div key={charIndex} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{char}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sayfa Geçiş Yolları</CardTitle>
              <CardDescription>Kullanıcıların sitede izlediği yollar</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={navigationPaths}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="from_page" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'transition_count' ? `${value} geçiş` : `${value} saniye`,
                      name === 'transition_count' ? 'Geçiş Sayısı' : 'Ortalama Süre'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="transition_count" fill="#8884d8" name="Geçiş Sayısı" />
                  <Bar dataKey="avg_duration" fill="#82ca9d" name="Ortalama Süre (sn)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>En Popüler Geçişler</CardTitle>
                <CardDescription>En çok kullanılan sayfa geçişleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {navigationPaths
                    .sort((a, b) => b.transition_count - a.transition_count)
                    .slice(0, 5)
                    .map((path, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-green-600">#{index + 1}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {path.from_page} → {path.to_page}
                          </span>
                        </div>
                        <Badge variant="outline">{path.transition_count} geçiş</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>En Uzun Süren Geçişler</CardTitle>
                <CardDescription>En çok zaman geçirilen sayfa geçişleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {navigationPaths
                    .sort((a, b) => b.avg_duration - a.avg_duration)
                    .slice(0, 5)
                    .map((path, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Clock className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm font-medium">
                            {path.from_page} → {path.to_page}
                          </span>
                        </div>
                        <Badge variant="outline">{path.avg_duration}sn</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Engagement Radarı</CardTitle>
              <CardDescription>Kullanıcı etkileşim metriklerinin görsel analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  {
                    metric: 'Günlük Aktivite',
                    high: 95,
                    medium: 65,
                    low: 35,
                    current: avgMonthlyActivity / 2
                  },
                  {
                    metric: 'Favori Ekleme',
                    high: 88,
                    medium: 58,
                    low: 28,
                    current: behaviorData.reduce((s, u) => s + u.view_to_favorite_rate, 0) / behaviorData.length || 0
                  },
                  {
                    metric: 'Sepet Ekleme',
                    high: 82,
                    medium: 52,
                    low: 22,
                    current: behaviorData.reduce((s, u) => s + u.favorite_to_cart_rate, 0) / behaviorData.length || 0
                  },
                  {
                    metric: 'Satın Alma',
                    high: 90,
                    medium: 60,
                    low: 30,
                    current: conversionRate
                  },
                  {
                    metric: 'Arama Kullanımı',
                    high: 75,
                    medium: 45,
                    low: 15,
                    current: behaviorData.reduce((s, u) => s + u.total_searches, 0) / behaviorData.length / 100
                  }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <Radar name="Mevcut" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Radar name="Yüksek" dataKey="high" stroke="#00C49F" fill="#00C49F" fillOpacity={0.1} />
                  <Radar name="Orta" dataKey="medium" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.1} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Yüksek Engagement</CardTitle>
                <CardDescription>En aktif kullanıcılar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{highEngagementUsers}</p>
                  <p className="text-sm text-gray-600">kullanıcı</p>
                  <Progress value={70} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">%{((highEngagementUsers / totalUsers) * 100).toFixed(1)} oranı</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orta Engagement</CardTitle>
                <CardDescription>Düzenli kullanıcılar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {behaviorData.filter(u => {
                      const score = getEngagementScore(u)
                      return score >= 40 && score < 70
                    }).length}
                  </p>
                  <p className="text-sm text-gray-600">kullanıcı</p>
                  <Progress value={50} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">%{((behaviorData.filter(u => getEngagementScore(u) >= 40 && getEngagementScore(u) < 70).length / totalUsers) * 100).toFixed(1)} oranı</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Düşük Engagement</CardTitle>
                <CardDescription>Az aktif kullanıcılar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600">
                    {behaviorData.filter(u => getEngagementScore(u) < 40).length}
                  </p>
                  <p className="text-sm text-gray-600">kullanıcı</p>
                  <Progress value={25} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">%{((behaviorData.filter(u => getEngagementScore(u) < 40).length / totalUsers) * 100).toFixed(1)} oranı</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dönüşüm Hunisi</CardTitle>
              <CardDescription>Kullanıcı yolculuğu analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Dönüşüm Aşamaları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Eye className="w-6 h-6" />
                      </div>
                      <h4 className="font-medium">Görüntüleme</h4>
                      <p className="text-2xl font-bold text-green-600 mt-1">100%</p>
                      <p className="text-sm text-green-700">Tüm kullanıcılar</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="w-6 h-6" />
                      </div>
                      <h4 className="font-medium">Favori Ekleme</h4>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {((behaviorData.reduce((s, u) => s + u.view_to_favorite_rate, 0) / behaviorData.length) || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-green-700">Favorilere ekleme</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <h4 className="font-medium">Sepete Ekleme</h4>
                      <p className="text-2xl font-bold text-orange-600 mt-1">
                        {((behaviorData.reduce((s, u) => s + u.favorite_to_cart_rate, 0) / behaviorData.length) || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-orange-700">Sepete ekleme</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="w-6 h-6" />
                      </div>
                      <h4 className="font-medium">Satın Alma</h4>
                      <p className="text-2xl font-bold text-purple-600 mt-1">{conversionRate.toFixed(1)}%</p>
                      <p className="text-sm text-purple-700">Başarılı satın alma</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Kullanıcı Segmentleri</h4>
                  <div className="space-y-3">
                    {behaviorPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-xl">
                        <div>
                          <p className="font-medium">{pattern.pattern_name}</p>
                          <p className="text-sm text-gray-500">{pattern.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{pattern.user_count} kullanıcı</Badge>
                          <div className="text-right">
                            <p className="font-medium">{pattern.conversion_rate.toFixed(1)}%</p>
                            <Progress value={pattern.conversion_rate} className="w-20 h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Davranış Detayları</CardTitle>
              <CardDescription>Bireysel kullanıcı analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {behaviorData.slice(0, 50).map((user) => {
                  const activityBadge = getActivityLevelBadge(user.monthly_activity)
                  const engagementScore = getEngagementScore(user)
                  
                  return (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'İsimsiz'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCustomerTypeColor(user.customer_type)}>
                              {user.customer_type}
                            </Badge>
                            <Badge variant={activityBadge.variant} className={activityBadge.color}>
                              {activityBadge.text}
                            </Badge>
                            <Badge variant="outline">
                              Engagement: {engagementScore.toFixed(0)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-green-600">{user.monthly_activity}</p>
                            <p className="text-gray-500">Aylık</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-green-600">{user.total_sessions}</p>
                            <p className="text-gray-500">Oturum</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-orange-600">{Math.round(user.avg_session_duration / 60)}dk</p>
                            <p className="text-gray-500">Ort. Süre</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-purple-600">{user.cart_to_purchase_rate.toFixed(1)}%</p>
                            <p className="text-gray-500">Dönüşüm</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
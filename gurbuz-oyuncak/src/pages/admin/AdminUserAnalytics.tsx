import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
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
  AreaChart
} from 'recharts'
import { 
  Users, 
  TrendingUp, 
  Eye, 
  Heart, 
  ShoppingCart, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Calendar,
  UserCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface UserAnalytics {
  user_id: string
  email: string
  full_name: string
  customer_type: string
  vip_level: number
  total_favorites: number
  total_cart_items: number
  weekly_activity_score: number
  unique_categories_browsed: number
  total_purchases: number
  total_spent: number
  last_active: string
}

interface EngagementMetrics {
  user_id: string
  email: string
  daily_activity: number
  weekly_activity: number
  monthly_activity: number
  total_views: number
  total_favorites_added: number
  total_cart_additions: number
  view_to_favorite_rate: number
  favorite_to_cart_rate: number
  cart_to_purchase_rate: number
}

interface ActivityData {
  date: string
  users: number
  views: number
  favorites: number
  cart_adds: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function AdminUserAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<UserAnalytics[]>([])
  const [engagementData, setEngagementData] = useState<EngagementMetrics[]>([])
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [customerType, setCustomerType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
    fetchEngagementData()
    fetchActivityData()
  }, [timeRange, customerType])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('user_behavior_analytics')
        .select('*')
        .order('weekly_activity_score', { ascending: false })

      if (customerType !== 'all') {
        query = query.eq('customer_type', customerType)
      }

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error
      setAnalyticsData(data || [])
    } catch (error) {
      console.error('Analytics data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEngagementData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .order('monthly_activity', { ascending: false })
        .limit(50)

      if (error) throw error
      setEngagementData(data || [])
    } catch (error) {
      console.error('Engagement data error:', error)
    }
  }

  const fetchActivityData = async () => {
    // Son 30 günlük aktivite verisi simülasyonu
    const days = parseInt(timeRange)
    const data: ActivityData[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 20,
        views: Math.floor(Math.random() * 500) + 100,
        favorites: Math.floor(Math.random() * 50) + 10,
        cart_adds: Math.floor(Math.random() * 30) + 5
      })
    }
    
    setActivityData(data)
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

  const getVipLevelBadge = (level: number) => {
    if (level >= 5) return { variant: 'default' as const, text: 'VIP+', color: 'text-yellow-600' }
    if (level >= 3) return { variant: 'secondary' as const, text: 'VIP', color: 'text-green-600' }
    if (level >= 1) return { variant: 'outline' as const, text: 'Üye', color: 'text-gray-600' }
    return { variant: 'outline' as const, text: 'Yeni', color: 'text-gray-400' }
  }

  const exportData = () => {
    const csvData = analyticsData.map(user => ({
      'Email': user.email,
      'İsim': user.full_name,
      'Tip': user.customer_type,
      'VIP Seviye': user.vip_level,
      'Favoriler': user.total_favorites,
      'Sepet Ürünleri': user.total_cart_items,
      'Haftalık Aktivite': user.weekly_activity_score,
      'Kategoriler': user.unique_categories_browsed,
      'Toplam Alışveriş': user.total_purchases,
      'Toplam Harcama': user.total_spent,
      'Son Aktivite': user.last_active
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `user-analytics-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const totalUsers = analyticsData.length
  const avgFavorites = analyticsData.reduce((sum, user) => sum + user.total_favorites, 0) / totalUsers || 0
  const avgCartItems = analyticsData.reduce((sum, user) => sum + user.total_cart_items, 0) / totalUsers || 0
  const totalSpent = analyticsData.reduce((sum, user) => sum + user.total_spent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Analytics</h1>
          <p className="text-gray-600 mt-1">Kullanıcı davranışları ve engagement analizi</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
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
                  <SelectItem value="365">Son 1 Yıl</SelectItem>
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
              <label className="text-sm font-medium mb-2 block">Ara</label>
              <Input
                placeholder="Email veya isim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchAnalyticsData()}
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
                  <span className="text-sm text-green-600">+12% bu ay</span>
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
                <p className="text-sm font-medium text-gray-600">Ortalama Favori</p>
                <p className="text-3xl font-bold text-gray-900">{avgFavorites.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Sepet</p>
                <p className="text-3xl font-bold text-gray-900">{avgCartItems.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                <p className="text-3xl font-bold text-gray-900">₺{totalSpent.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+23% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="activity">Aktivite</TabsTrigger>
          <TabsTrigger value="customers">Müşteriler</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Günlük Aktivite Trendi</CardTitle>
                <CardDescription>Son 30 günlük kullanıcı aktivite verileri</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="views" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Müşteri Tipi Dağılımı</CardTitle>
                <CardDescription>Kullanıcıların müşteri tipine göre dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'B2C', value: analyticsData.filter(u => u.customer_type === 'B2C').length },
                        { name: 'B2B', value: analyticsData.filter(u => u.customer_type === 'B2B').length },
                        { name: 'Toptan', value: analyticsData.filter(u => u.customer_type === 'Toptan').length },
                        { name: 'Kurumsal', value: analyticsData.filter(u => u.customer_type === 'Kurumsal').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktivite Grafikleri</CardTitle>
              <CardDescription>Detaylı aktivite analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="favorites" stroke="#FF8042" strokeWidth={2} />
                  <Line type="monotone" dataKey="cart_adds" stroke="#00C49F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Listesi</CardTitle>
              <CardDescription>Top 50 aktif kullanıcı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analyticsData.slice(0, 50).map((user) => {
                  const vipBadge = getVipLevelBadge(user.vip_level)
                  return (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'İsimsiz'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCustomerTypeColor(user.customer_type)}>
                              {user.customer_type}
                            </Badge>
                            <Badge variant={vipBadge.variant} className={vipBadge.color}>
                              {vipBadge.text}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{user.total_favorites}</p>
                            <p className="text-gray-500">Favori</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{user.total_cart_items}</p>
                            <p className="text-gray-500">Sepet</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">₺{user.total_spent.toLocaleString()}</p>
                            <p className="text-gray-500">Harcama</p>
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

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrikleri</CardTitle>
              <CardDescription>Kullanıcı etkileşim analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {engagementData.slice(0, 30).map((user) => (
                  <div key={user.user_id} className="p-4 border rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium">{user.email}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Günlük: {user.daily_activity}
                        </Badge>
                        <Badge variant="outline">
                          Haftalık: {user.weekly_activity}
                        </Badge>
                        <Badge variant="outline">
                          Aylık: {user.monthly_activity}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Görüntüleme</p>
                        <p className="font-medium">{user.total_views}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Favori→Sepet</p>
                        <p className="font-medium">{typeof user.favorite_to_cart_rate === 'number' && !isNaN(user.favorite_to_cart_rate) ? user.favorite_to_cart_rate.toFixed(1) : '0'}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sepet→Satın Alma</p>
                        <p className="font-medium">{typeof user.cart_to_purchase_rate === 'number' && !isNaN(user.cart_to_purchase_rate) ? user.cart_to_purchase_rate.toFixed(1) : '0'}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg. Oturum</p>
                        <p className="font-medium">{Math.round(user.weekly_activity / 7)}dk</p>
                      </div>
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
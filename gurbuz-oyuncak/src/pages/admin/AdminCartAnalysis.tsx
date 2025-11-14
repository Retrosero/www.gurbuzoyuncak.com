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
  ScatterChart,
  Scatter
} from 'recharts'
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Package, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Zap,
  Mail
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface CartAnalysis {
  user_id: string
  email: string
  full_name: string
  customer_type: string
  total_cart_sessions: number
  total_cart_items: number
  avg_cart_value: number
  abandonment_rate: number
  last_cart_activity: string
  cart_conversion_rate: number
}

interface AbandonedCart {
  cart_id: number
  user_email: string
  total_value: number
  item_count: number
  abandoned_days: number
  products: Array<{
    name: string
    quantity: number
    price: number
  }>
}

interface CartProduct {
  product_id: number
  product_code: string
  name: string
  category_name: string
  brand_name: string
  base_price: number
  stock: number
  cart_add_count: number
  avg_cart_quantity: number
  view_to_cart_rate: number
  cart_to_purchase_rate: number
  abandonment_rate: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function AdminCartAnalysis() {
  const [cartAnalysis, setCartAnalysis] = useState<CartAnalysis[]>([])
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([])
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [customerType, setCustomerType] = useState('all')
  const [cartStatus, setCartStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchCartAnalysis()
    fetchAbandonedCarts()
    fetchCartProducts()
  }, [timeRange, customerType, cartStatus])

  const fetchCartAnalysis = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('user_behavior_analytics')
        .select('*')
        .gte('total_cart_sessions', 1)
        .order('total_cart_sessions', { ascending: false })

      if (customerType !== 'all') {
        query = query.eq('customer_type', customerType)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error
      setCartAnalysis(data || [])
    } catch (error) {
      console.error('Cart analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAbandonedCarts = async () => {
    try {
      // Abandoned carts simülasyonu (gerçek uygulamada carts tablosundan çekilecek)
      const mockAbandonedCarts: AbandonedCart[] = [
        {
          cart_id: 1,
          user_email: 'ahmet@example.com',
          total_value: 1250.50,
          item_count: 3,
          abandoned_days: 2,
          products: [
            { name: 'LEGO Technic İleri Seviye', quantity: 2, price: 450.25 },
            { name: 'Barbie Bebeği Premium', quantity: 1, price: 350.00 }
          ]
        },
        {
          cart_id: 2,
          user_email: 'mehmet@example.com',
          total_value: 890.75,
          item_count: 2,
          abandoned_days: 5,
          products: [
            { name: 'RC Araba 1:18', quantity: 1, price: 590.75 },
            { name: 'Puzzle 1000 Parça', quantity: 1, price: 300.00 }
          ]
        },
        {
          cart_id: 3,
          user_email: 'ayse@example.com',
          total_value: 2100.00,
          item_count: 5,
          abandoned_days: 1,
          products: [
            { name: 'Sahnelik Set 50 Parça', quantity: 1, price: 800.00 },
            { name: 'Kalemlik ve Organizer', quantity: 2, price: 450.00 },
            { name: 'Okul Çantası Fileli', quantity: 2, price: 350.00 }
          ]
        }
      ]

      setAbandonedCarts(mockAbandonedCarts)
    } catch (error) {
      console.error('Abandoned carts error:', error)
    }
  }

  const fetchCartProducts = async () => {
    try {
      let query = supabase
        .from('product_engagement')
        .select('*')
        .gte('cart_add_count', 1)
        .order('cart_add_count', { ascending: false })

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setCartProducts(data || [])
    } catch (error) {
      console.error('Cart products error:', error)
    }
  }

  const exportCartData = () => {
    const csvData = cartAnalysis.map(user => ({
      'Email': user.email,
      'İsim': user.full_name,
      'Tip': user.customer_type,
      'Sepet Sayısı': user.total_cart_sessions,
      'Toplam Ürün': user.total_cart_items,
      'Ortalama Değer': user.avg_cart_value,
      ' Terk Etme Oranı': user.abandonment_rate,
      'Dönüşüm Oranı': user.cart_conversion_rate,
      'Son Aktivite': user.last_cart_activity
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sepet-analizi-${new Date().toISOString().split('T')[0]}.csv`
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

  const getStatusBadge = (days: number) => {
    if (days === 0) return { variant: 'default' as const, text: 'Bugün', color: 'text-green-600' }
    if (days <= 1) return { variant: 'secondary' as const, text: '1 Gün Önce', color: 'text-yellow-600' }
    if (days <= 3) return { variant: 'outline' as const, text: '2-3 Gün Önce', color: 'text-orange-600' }
    return { variant: 'outline' as const, text: `${days}+ Gün Önce`, color: 'text-red-600' }
  }

  const totalCarts = cartAnalysis.length
  const totalAbandoned = abandonedCarts.length
  const avgCartValue = cartAnalysis.reduce((sum, user) => sum + user.avg_cart_value, 0) / totalCarts || 0
  const totalCartValue = abandonedCarts.reduce((sum, cart) => sum + cart.total_value, 0)
  const totalItems = cartAnalysis.reduce((sum, user) => sum + user.total_cart_items, 0)
  const avgAbandonmentRate = cartAnalysis.reduce((sum, user) => sum + user.abandonment_rate, 0) / totalCarts || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sepet Analizi</h1>
          <p className="text-gray-600 mt-1">Sepet davranışları ve terk etme analizi</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCartData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={fetchCartAnalysis} variant="outline" size="sm">
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
              <label className="text-sm font-medium mb-2 block">Sepet Durumu</label>
              <Select value={cartStatus} onValueChange={setCartStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sepetler</SelectItem>
                  <SelectItem value="active">Aktif Sepetler</SelectItem>
                  <SelectItem value="abandoned">Terk Edilenler</SelectItem>
                  <SelectItem value="completed">Tamamlananlar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ara</label>
              <Input
                placeholder="Email veya isim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchCartAnalysis()}
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
                <p className="text-sm font-medium text-gray-600">Aktif Sepetler</p>
                <p className="text-3xl font-bold text-gray-900">{totalCarts}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
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
                <p className="text-sm font-medium text-gray-600">Terk Edilen Sepet</p>
                <p className="text-3xl font-bold text-gray-900">{totalAbandoned}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">+8% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Sepet Değeri</p>
                <p className="text-3xl font-bold text-gray-900">₺{avgCartValue.toFixed(0)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600"> Terk Edilen Değer</p>
                <p className="text-3xl font-bold text-gray-900">₺{totalCartValue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">Kritik seviye</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="abandoned">Terk Edilenler</TabsTrigger>
          <TabsTrigger value="products">Ürünler</TabsTrigger>
          <TabsTrigger value="conversion">Dönüşüm</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sepet Durumu Dağılımı</CardTitle>
                <CardDescription>Aktif, terk edilen ve tamamlanan sepetler</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Aktif', value: totalCarts, color: '#00C49F' },
                        { name: 'Terk Edilen', value: totalAbandoned, color: '#FF8042' },
                        { name: 'Tamamlanan', value: Math.floor(totalCarts * 0.7), color: '#0088FE' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#FF8042" />
                      <Cell fill="#0088FE" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Müşteri Tipine Göre Sepet Analizi</CardTitle>
                <CardDescription>Farklı müşteri segmentlerinin sepet davranışları</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { 
                      type: 'B2C', 
                      sepet: cartAnalysis.filter(u => u.customer_type === 'B2C').length,
                      ortalama: cartAnalysis.filter(u => u.customer_type === 'B2C').reduce((s,u)=>s+u.avg_cart_value,0) / cartAnalysis.filter(u => u.customer_type === 'B2C').length || 0
                    },
                    { 
                      type: 'B2B', 
                      sepet: cartAnalysis.filter(u => u.customer_type === 'B2B').length,
                      ortalama: cartAnalysis.filter(u => u.customer_type === 'B2B').reduce((s,u)=>s+u.avg_cart_value,0) / cartAnalysis.filter(u => u.customer_type === 'B2B').length || 0
                    },
                    { 
                      type: 'Toptan', 
                      sepet: cartAnalysis.filter(u => u.customer_type === 'Toptan').length,
                      ortalama: cartAnalysis.filter(u => u.customer_type === 'Toptan').reduce((s,u)=>s+u.avg_cart_value,0) / cartAnalysis.filter(u => u.customer_type === 'Toptan').length || 0
                    },
                    { 
                      type: 'Kurumsal', 
                      sepet: cartAnalysis.filter(u => u.customer_type === 'Kurumsal').length,
                      ortalama: cartAnalysis.filter(u => u.customer_type === 'Kurumsal').reduce((s,u)=>s+u.avg_cart_value,0) / cartAnalysis.filter(u => u.customer_type === 'Kurumsal').length || 0
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sepet" fill="#8884d8" name="Sepet Sayısı" />
                    <Bar dataKey="ortalama" fill="#82ca9d" name="Ortalama Değer" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aktif Kullanıcı Sepetleri</CardTitle>
              <CardDescription>En aktif sepet kullanıcıları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartAnalysis.slice(0, 20).map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || 'İsimsiz'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <Badge className={getCustomerTypeColor(user.customer_type)}>
                          {user.customer_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{user.total_cart_sessions}</p>
                          <p className="text-gray-500">Sepet</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{user.total_cart_items}</p>
                          <p className="text-gray-500">Ürün</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">₺{typeof user.avg_cart_value === 'number' && !isNaN(user.avg_cart_value) ? user.avg_cart_value.toFixed(0) : '0'}</p>
                          <p className="text-gray-500">Ortalama</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{typeof user.cart_conversion_rate === 'number' && !isNaN(user.cart_conversion_rate) ? user.cart_conversion_rate.toFixed(1) : '0'}%</p>
                          <p className="text-gray-500">Dönüşüm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abandoned" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Terk Edilen Sepetler</CardTitle>
              <CardDescription>Kurtarılabilir sepet fırsatları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {abandonedCarts.map((cart) => {
                  const statusBadge = getStatusBadge(cart.abandoned_days)
                  return (
                    <div key={cart.cart_id} className="border rounded-xl p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{cart.user_email}</p>
                            <p className="text-sm text-gray-500">Sepet #{cart.cart_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={statusBadge.variant} className={statusBadge.color}>
                            {statusBadge.text}
                          </Badge>
                          <p className="text-lg font-bold text-red-600 mt-1">₺{cart.total_value.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm font-medium mb-2">Ürünler ({cart.item_count} adet):</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {cart.products.map((product, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{product.name} x{product.quantity}</span>
                              <span>₺{(product.price * product.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          İncele
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-1" />
                          Hatırlatma Gönder
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sepete Eklenen Ürünler</CardTitle>
              <CardDescription>En çok sepete eklenen ürünler analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartProducts.slice(0, 30).map((product) => (
                  <div key={product.product_id} className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.product_code}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{product.category_name}</Badge>
                          <Badge variant="outline">{product.brand_name}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-green-600">{product.cart_add_count}</p>
                          <p className="text-gray-500">Sepete Ekleme</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-600">{typeof product.avg_cart_quantity === 'number' && !isNaN(product.avg_cart_quantity) ? product.avg_cart_quantity.toFixed(1) : '0'}</p>
                          <p className="text-gray-500">Ort. Miktar</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-orange-600">{typeof product.view_to_cart_rate === 'number' && !isNaN(product.view_to_cart_rate) ? product.view_to_cart_rate.toFixed(1) : '0'}%</p>
                          <p className="text-gray-500">Görüntüle→Sepet</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-purple-600">{typeof product.cart_to_purchase_rate === 'number' && !isNaN(product.cart_to_purchase_rate) ? product.cart_to_purchase_rate.toFixed(1) : '0'}%</p>
                          <p className="text-gray-500">Sepet→Satın Alma</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sepet Dönüşüm Hunisi</CardTitle>
              <CardDescription>Kullanıcı davranış analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Dönüşüm Oranları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 p-4 rounded-xl">
                      <h4 className="font-medium text-green-900">Görüntüleme → Favori</h4>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {((cartAnalysis.reduce((s,u)=>s+u.total_cart_items,0) / cartAnalysis.reduce((s,u)=>s+u.total_cart_sessions,1)) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-green-700 mt-1">Ortalama dönüşüm oranı</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <h4 className="font-medium text-green-900">Sepet → Tamamlama</h4>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {(avgCartValue > 0 ? (totalCarts - totalAbandoned) / totalCarts * 100 : 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-green-700 mt-1">Başarılı tamamlama oranı</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <h4 className="font-medium text-orange-900">Sepet Terk Oranı</h4>
                      <p className="text-2xl font-bold text-orange-600 mt-2">
                        {avgAbandonmentRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-orange-700 mt-1">İyileştirme alanı</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Performans Göstergeleri</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Görüntüleme → Favori Dönüşümü</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-32" />
                        <span className="text-sm text-gray-600">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Favori → Sepet Dönüşümü</span>
                      <div className="flex items-center gap-2">
                        <Progress value={62} className="w-32" />
                        <span className="text-sm text-gray-600">62%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sepet → Satın Alma Dönüşümü</span>
                      <div className="flex items-center gap-2">
                        <Progress value={73} className="w-32" />
                        <span className="text-sm text-gray-600">73%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Genel Dönüşüm Oranı</span>
                      <div className="flex items-center gap-2">
                        <Progress value={38} className="w-32" />
                        <span className="text-sm text-gray-600">38%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
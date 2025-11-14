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
  Heart, 
  TrendingUp, 
  Eye, 
  Star,
  Filter,
  Download,
  RefreshCw,
  ShoppingCart,
  Package,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Zap
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface FavoriteProduct {
  product_id: number
  product_code: string
  name: string
  category_name: string
  brand_name: string
  base_price: number
  stock: number
  favorite_count: number
  cart_add_count: number
  view_count_tracked: number
  view_to_favorite_rate: number
  view_to_cart_rate: number
  popularity_score: number
}

interface CategoryFavorites {
  category_name: string
  category_id: number
  total_favorites: number
  total_products: number
  avg_favorites_per_product: number
  category_popularity_score: number
}

interface BrandFavorites {
  brand_name: string
  brand_id: number
  total_favorites: number
  total_products: number
  avg_favorites_per_product: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function AdminFavoritesReport() {
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([])
  const [categoryFavorites, setCategoryFavorites] = useState<CategoryFavorites[]>([])
  const [brandFavorites, setBrandFavorites] = useState<BrandFavorites[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popularity_score')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    fetchFavoriteData()
    fetchCategoryData()
    fetchBrandData()
  }, [timeRange, categoryFilter])

  const fetchFavoriteData = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('product_engagement')
        .select('*')
        .gte('favorite_count', 1) // En az 1 favoriye sahip ürünler
        .order(sortBy, { ascending: false })

      if (categoryFilter !== 'all') {
        query = query.eq('category_name', categoryFilter)
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error
      setFavoriteProducts(data || [])
    } catch (error) {
      console.error('Favorite products error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryData = async () => {
    try {
      const { data, error } = await supabase
        .from('category_analytics')
        .select('*')
        .gte('total_favorites', 1)
        .order('total_favorites', { ascending: false })

      if (error) throw error
      setCategoryFavorites(data || [])
    } catch (error) {
      console.error('Category favorites error:', error)
    }
  }

  const fetchBrandData = async () => {
    try {
      // Brand favorilerini hesapla
      const { data: products, error } = await supabase
        .from('product_engagement')
        .select('brand_name, favorite_count')
        .not('brand_name', 'is', null)

      if (error) throw error

      const brandMap = new Map()
      products?.forEach(product => {
        if (product.brand_name) {
          const existing = brandMap.get(product.brand_name) || { brand_name: product.brand_name, total_favorites: 0, total_products: 0 }
          existing.total_favorites += product.favorite_count
          existing.total_products += 1
          brandMap.set(product.brand_name, existing)
        }
      })

      const brandData = Array.from(brandMap.values())
        .map(brand => ({
          ...brand,
          avg_favorites_per_product: brand.total_favorites / brand.total_products
        }))
        .sort((a, b) => b.total_favorites - a.total_favorites)

      setBrandFavorites(brandData)
    } catch (error) {
      console.error('Brand favorites error:', error)
    }
  }

  const exportFavoriteData = () => {
    const csvData = favoriteProducts.map(product => ({
      'Ürün Kodu': product.product_code,
      'Ürün Adı': product.name,
      'Kategori': product.category_name,
      'Marka': product.brand_name,
      'Fiyat': product.base_price,
      'Favori Sayısı': product.favorite_count,
      'Sepete Ekleme': product.cart_add_count,
      'Görüntüleme': product.view_count_tracked,
      'Favori Oranı': product.view_to_favorite_rate,
      'Sepet Oranı': product.view_to_cart_rate,
      'Popülerlik Skoru': product.popularity_score.toFixed(2),
      'Stok': product.stock
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `favoriler-raporu-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getPopularityBadge = (score: number) => {
    if (score >= 100) return { variant: 'default' as const, text: 'Çok Popüler', color: 'text-red-600' }
    if (score >= 50) return { variant: 'secondary' as const, text: 'Popüler', color: 'text-orange-600' }
    if (score >= 20) return { variant: 'outline' as const, text: 'İlgi Gören', color: 'text-green-600' }
    return { variant: 'outline' as const, text: 'Normal', color: 'text-gray-600' }
  }

  const totalFavorites = favoriteProducts.reduce((sum, p) => sum + p.favorite_count, 0)
  const avgFavoritesPerProduct = totalFavorites / favoriteProducts.length || 0
  const totalProducts = favoriteProducts.length
  const mostFavoritedProduct = favoriteProducts[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Favori Raporları</h1>
          <p className="text-gray-600 mt-1">Ürün favorileme analizi ve popülerlik raporları</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportFavoriteData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
          <Button onClick={fetchFavoriteData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="text-sm font-medium mb-2 block">Kategori</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categoryFavorites.map(cat => (
                    <SelectItem key={cat.category_id} value={cat.category_name}>
                      {cat.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sıralama</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity_score">Popülerlik Skoru</SelectItem>
                  <SelectItem value="favorite_count">Favori Sayısı</SelectItem>
                  <SelectItem value="view_to_favorite_rate">Favori Oranı</SelectItem>
                  <SelectItem value="base_price">Fiyat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ara</label>
              <Input
                placeholder="Ürün kodu veya adı..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchFavoriteData()}
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
                <p className="text-sm font-medium text-gray-600">Toplam Favori</p>
                <p className="text-3xl font-bold text-gray-900">{totalFavorites}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+18% bu ay</span>
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
                <p className="text-sm font-medium text-gray-600">Favorili Ürün</p>
                <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Favori</p>
                <p className="text-3xl font-bold text-gray-900">{avgFavoritesPerProduct.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+5% bu ay</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Popüler</p>
                <p className="text-lg font-bold text-gray-900">
                  {mostFavoritedProduct?.name?.substring(0, 20)}...
                </p>
                <div className="flex items-center mt-1">
                  <Crown className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">{mostFavoritedProduct?.favorite_count} favori</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Ürünler</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="brands">Markalar</TabsTrigger>
          <TabsTrigger value="trends">Trendler</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Popüler Ürünler</CardTitle>
              <CardDescription>En çok favorilere eklenen ürünler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {favoriteProducts.slice(0, 50).map((product, index) => {
                  const popularityBadge = getPopularityBadge(product.popularity_score)
                  return (
                    <div key={product.product_id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.product_code}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{product.category_name}</Badge>
                            <Badge variant="outline">{product.brand_name}</Badge>
                            <Badge variant={popularityBadge.variant} className={popularityBadge.color}>
                              {popularityBadge.text}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-red-600">{product.favorite_count}</p>
                            <p className="text-gray-500">Favori</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-green-600">{product.cart_add_count}</p>
                            <p className="text-gray-500">Sepet</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-green-600">{product.view_count_tracked}</p>
                            <p className="text-gray-500">Görüntüleme</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-orange-600">{typeof product.view_to_favorite_rate === 'number' && !isNaN(product.view_to_favorite_rate) ? product.view_to_favorite_rate.toFixed(1) : '0'}%</p>
                            <p className="text-gray-500">Oran</p>
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

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kategori Favori Dağılımı</CardTitle>
                <CardDescription>Kategorilere göre favori sayıları</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryFavorites.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category_name, percent }) => `${category_name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_favorites"
                    >
                      {categoryFavorites.map((entry, index) => (
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
                <CardTitle>Kategori Karşılaştırması</CardTitle>
                <CardDescription>Kategori bazında detaylı analiz</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryFavorites.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_favorites" fill="#0088FE" name="Toplam Favori" />
                    <Bar dataKey="avg_favorites_per_product" fill="#00C49F" name="Ürün Başına Ortalama" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kategori Detay Listesi</CardTitle>
              <CardDescription>Tüm kategorilerin favori performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryFavorites.map((category) => (
                  <div key={category.category_id} className="flex items-center justify-between p-3 border rounded-xl">
                    <div>
                      <p className="font-medium">{category.category_name}</p>
                      <p className="text-sm text-gray-500">{category.total_products} ürün</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-red-600">{category.total_favorites}</p>
                        <p className="text-gray-500">Toplam Favori</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">{category.avg_favorites_per_product.toFixed(1)}</p>
                        <p className="text-gray-500">Ortalama</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">{category.category_popularity_score.toFixed(1)}</p>
                        <p className="text-gray-500">Popülerlik</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marka Favori Raporu</CardTitle>
              <CardDescription>Markalara göre favori performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={brandFavorites.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="brand_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_favorites" fill="#8884d8" name="Toplam Favori" />
                  <Bar dataKey="avg_favorites_per_product" fill="#82ca9d" name="Ürün Başına Ortalama" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandFavorites.slice(0, 9).map((brand, index) => (
              <Card key={brand.brand_id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{brand.brand_name}</h3>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Toplam Favori</span>
                      <span className="font-medium">{brand.total_favorites}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Ürün Sayısı</span>
                      <span className="font-medium">{brand.total_products}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Ortalama</span>
                      <span className="font-medium">{brand.avg_favorites_per_product.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favori Trend Analizi</CardTitle>
              <CardDescription>Zaman bazlı favori trendleri</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="new_favorites" stroke="#FF6B6B" strokeWidth={2} name="Yeni Favoriler" />
                  <Line type="monotone" dataKey="removed_favorites" stroke="#4ECDC4" strokeWidth={2} name="Kaldırılan Favoriler" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>En Hızlı Yükselenler</CardTitle>
                <CardDescription>Son dönemde popülerliği artan ürünler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favoriteProducts.slice(0, 5).map((product, index) => (
                    <div key={product.product_id} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Zap className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.favorite_count} favori</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Düşen Trendler</CardTitle>
                <CardDescription>Popülerliği azalan ürünler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {favoriteProducts.slice(-5).reverse().map((product) => (
                    <div key={product.product_id} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <ArrowDownRight className="w-3 h-3 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.favorite_count} favori</p>
                      </div>
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
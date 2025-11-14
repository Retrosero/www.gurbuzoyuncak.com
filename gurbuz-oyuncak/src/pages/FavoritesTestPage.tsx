import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, TestTube, Play, Mail, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function FavoritesTestPage() {
  const { user } = useAuth()
  const { favoritesCount, getFavoritesWithTracking } = useFavorites()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fiyat takip testi
  const testPriceTracking = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Test verisi
      const testData = {
        product_id: 1,
        old_price: 100.00,
        new_price: 95.00
      }

      const { data, error } = await supabase.functions.invoke('favorite-price-tracker', {
        body: testData
      })

      if (error) throw error

      setTestResults(prev => [...prev, {
        type: 'Fiyat Takip Testi',
        success: true,
        data: data.data || data,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }])

      toast.success('Fiyat takip testi başarılı!')
    } catch (error) {
      console.error('Fiyat takip test hatası:', error)
      setTestResults(prev => [...prev, {
        type: 'Fiyat Takip Testi',
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }])
      toast.error('Fiyat takip testi başarısız!')
    } finally {
      setLoading(false)
    }
  }

  // Stok takip testi
  const testStockTracking = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Test verisi
      const testData = {
        product_id: 1,
        old_stock: 10,
        new_stock: 3
      }

      const { data, error } = await supabase.functions.invoke('favorite-stock-tracker', {
        body: testData
      })

      if (error) throw error

      setTestResults(prev => [...prev, {
        type: 'Stok Takip Testi',
        success: true,
        data: data.data || data,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }])

      toast.success('Stok takip testi başarılı!')
    } catch (error) {
      console.error('Stok takip test hatası:', error)
      setTestResults(prev => [...prev, {
        type: 'Stok Takip Testi',
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }])
      toast.error('Stok takip testi başarısız!')
    } finally {
      setLoading(false)
    }
  }

  // Bildirim testi
  const testNotification = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Test verisi
      const testData = {
        user_id: user.id,
        notification_type: 'price_decrease',
        product_id: 1,
        product_name: 'Test Ürünü',
        old_value: 100.00,
        new_value: 95.00,
        change_percentage: 5.00
      }

      const { data, error } = await supabase.functions.invoke('favorite-notifications', {
        body: testData
      })

      if (error) throw error

      setTestResults(prev => [...prev, {
        type: 'Bildirim Testi',
        success: true,
        data: data.data || data,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }])

      toast.success('Bildirim testi başarılı!')
    } catch (error) {
      console.error('Bildirim test hatası:', error)
      setTestResults(prev => [...prev, {
        type: 'Bildirim Testi',
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }])
      toast.error('Bildirim testi başarısız!')
    } finally {
      setLoading(false)
    }
  }

  // Favori ürün oluşturma testi (test verisi ekleme)
  const createTestFavorite = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Önce mevcut test ürünlerini kontrol et
      const { data: existingTest } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', 999999) // Test product ID

      if (existingTest && existingTest.length > 0) {
        toast.info('Test favorisi zaten mevcut')
        setLoading(false)
        return
      }

      // Test favorisi ekle
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          product_id: 999999, // Test product ID
          price_change_threshold: 5.00
        })

      if (error) throw error

      setTestResults(prev => [...prev, {
        type: 'Favori Oluşturma',
        success: true,
        data: 'Test favorisi oluşturuldu',
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }])

      toast.success('Test favorisi oluşturuldu!')
    } catch (error) {
      console.error('Favori oluşturma test hatası:', error)
      setTestResults(prev => [...prev, {
        type: 'Favori Oluşturma',
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      }])
      toast.error('Test favorisi oluşturulamadı!')
    } finally {
      setLoading(false)
    }
  }

  // Test sonuçlarını temizle
  const clearTestResults = () => {
    setTestResults([])
    toast.info('Test sonuçları temizlendi')
  }

  // Favoriler sistemi istatistikleri
  const [favoritesStats, setFavoritesStats] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchFavoritesStats()
    }
  }, [user])

  const fetchFavoritesStats = async () => {
    if (!user) return

    try {
      const favoritesWithTracking = await getFavoritesWithTracking()
      setFavoritesStats({
        total: favoritesWithTracking.length,
        withPriceChanges: favoritesWithTracking.filter((f: any) => 
          f.favorite_price_tracking && f.favorite_price_tracking.length > 0
        ).length,
        withStockAlerts: favoritesWithTracking.filter((f: any) => 
          f.favorite_stock_tracking && f.favorite_stock_tracking.length > 0
        ).length
      })
    } catch (error) {
      console.error('İstatistikler alınamadı:', error)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Giriş Yapın</h2>
        <p className="text-gray-600 mb-8">Favoriler sistemi testlerini görmek için giriş yapmalısınız.</p>
        <Link to="/giris">
          <Button>Giriş Yap</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TestTube className="w-8 h-8 text-green-500" />
            Favoriler Sistemi Test
          </h1>
          <p className="text-gray-600 mt-2">Favoriler sisteminin tüm özelliklerini test edin</p>
        </div>
        <Link to="/favoriler">
          <Button variant="outline">Favoriler Sayfasına Git</Button>
        </Link>
      </div>

      {/* Sistem İstatistikleri */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Favoriler Sistemi Durumu
          </CardTitle>
          <CardDescription>
            Sistem istatistikleri ve genel durum bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{favoritesCount}</div>
              <div className="text-sm text-blue-600">Toplam Favori</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{favoritesStats?.withPriceChanges || 0}</div>
              <div className="text-sm text-green-600">Fiyat Değişikliği</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{favoritesStats?.withStockAlerts || 0}</div>
              <div className="text-sm text-orange-600">Stok Uyarısı</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Butonları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button 
          onClick={createTestFavorite}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2 h-auto p-4"
        >
          <Heart className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Test Favorisi Oluştur</div>
            <div className="text-xs text-gray-500">Test amaçlı favori ekle</div>
          </div>
        </Button>

        <Button 
          onClick={testPriceTracking}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2 h-auto p-4"
        >
          <Play className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Fiyat Takip Testi</div>
            <div className="text-xs text-gray-500">Fiyat değişimini test et</div>
          </div>
        </Button>

        <Button 
          onClick={testStockTracking}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2 h-auto p-4"
        >
          <Play className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Stok Takip Testi</div>
            <div className="text-xs text-gray-500">Stok değişimini test et</div>
          </div>
        </Button>

        <Button 
          onClick={testNotification}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2 h-auto p-4"
        >
          <Mail className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Bildirim Testi</div>
            <div className="text-xs text-gray-500">Email/SMS bildirimi test et</div>
          </div>
        </Button>
      </div>

      {/* Test Sonuçları */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Test Sonuçları</CardTitle>
            <CardDescription>
              Son çalıştırılan testlerin sonuçları
            </CardDescription>
          </div>
          <Button onClick={clearTestResults} variant="outline" size="sm">
            Temizle
          </Button>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto w-12 h-12 mb-4 opacity-50" />
              <p>Henüz test çalıştırılmadı</p>
              <p className="text-sm">Yukarıdaki butonlardan testleri çalıştırın</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{result.type}</div>
                    <div className="text-sm text-gray-500">{result.timestamp}</div>
                  </div>
                  {result.success ? (
                    <div className="text-sm">
                      <div className="text-green-700">✅ Başarılı</div>
                      <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <div className="text-red-700">❌ Başarısız</div>
                      <div className="mt-1 text-red-600">{result.error}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
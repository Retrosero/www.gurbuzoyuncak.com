import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Award, TrendingUp, Gift, Calendar, Star, Trophy, Heart, User, Package, ChevronDown, ChevronUp, Truck, Clock, CheckCircle, X } from 'lucide-react'
import { toast } from 'sonner'

interface VIPInfo {
  points: number
  tier_level: number
  tier_name: string
  tier_icon: string
  discount_percentage: number
  free_shipping_threshold: number | null
  perks: string[]
  next_tier: {
    name: string
    min_points: number
    points_needed: number
  } | null
}

interface PointTransaction {
  id: number
  transaction_type: string
  points: number
  description: string
  created_at: string
}

interface VIPTier {
  tier_name: string
  tier_level: number
  min_points: number
  max_points: number | null
  discount_percentage: number
  icon_emoji: string
  badge_color: string
  perks: string[]
}



export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'orders'>('profile')
  const [vipInfo, setVipInfo] = useState<VIPInfo | null>(null)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [allTiers, setAllTiers] = useState<VIPTier[]>([])
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<number[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [loadingWishlist, setLoadingWishlist] = useState(false)



  useEffect(() => {
    if (user) {
      loadLoyaltyInfo()
      if (activeTab === 'orders') {
        loadOrders()
      } else if (activeTab === 'wishlist') {
        loadWishlist()
      }
    }
  }, [user, activeTab])

  const loadLoyaltyInfo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-loyalty-info', {
        body: { user_id: user?.id }
      })

      if (error) throw error

      if (data?.success) {
        setVipInfo(data.data.vip_info)
        setTransactions(data.data.recent_transactions)
        setAllTiers(data.data.all_tiers)
      }
    } catch (error) {
      console.error('Sadakat bilgisi yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      purchase: <TrendingUp className="text-blue-600" size={20} />,
      review: <Star className="text-yellow-600" size={20} />,
      comment: <Star className="text-green-600" size={20} />,
      social_share: <Gift className="text-purple-600" size={20} />,
      birthday_bonus: <Calendar className="text-pink-600" size={20} />,
      first_order: <Trophy className="text-orange-600" size={20} />,
      admin_bonus: <Award className="text-indigo-600" size={20} />
    }
    return icons[type] || <Award className="text-gray-600" size={20} />
  }

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Alışveriş',
      review: 'Ürün Değerlendirmesi',
      comment: 'Ürün Yorumu',
      social_share: 'Sosyal Medya Paylaşımı',
      birthday_bonus: 'Doğum Günü Bonusu',
      first_order: 'İlk Sipariş Bonusu',
      admin_bonus: 'Yönetici Bonusu'
    }
    return labels[type] || type
  }





  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price,
            gift_wrap
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error)
      toast.error('Siparişler yüklenemedi')
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadWishlist = async () => {
    try {
      setLoadingWishlist(true)
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products (
            id,
            name,
            price,
            images,
            is_active
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWishlistItems(data || [])
    } catch (error) {
      console.error('İstek listesi yüklenemedi:', error)
      toast.error('İstek listesi yüklenemedi')
    } finally {
      setLoadingWishlist(false)
    }
  }

  const removeFromWishlist = async (productId: number) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user?.id)
        .eq('product_id', productId)

      if (error) throw error
      
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId))
      toast.success('Ürün istek listesinden kaldırıldı')
    } catch (error) {
      console.error('Ürün kaldırılamadı:', error)
      toast.error('Ürün kaldırılamadı')
    }
  }

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Beklemede',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    }
    return labels[status] || status
  }

  const progressPercentage = vipInfo && vipInfo.next_tier 
    ? ((vipInfo.points - (allTiers[vipInfo.tier_level - 1]?.min_points || 0)) / 
       ((vipInfo.next_tier.min_points - (allTiers[vipInfo.tier_level - 1]?.min_points || 0)))) * 100
    : 100

interface OrderStatusModalProps {
  order: any | null
  onClose: () => void
}

function OrderStatusModal({ order, onClose }: OrderStatusModalProps) {
  if (!order) return null

  const statusSteps = [
    { key: 'pending', label: 'Sipariş Alındı', icon: Clock },
    { key: 'processing', label: 'Hazırlanıyor', icon: Package },
    { key: 'shipped', label: 'Kargoya Verildi', icon: Truck },
    { key: 'delivered', label: 'Teslim Edildi', icon: CheckCircle }
  ]

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.order_status)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sipariş Detayları</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sipariş Bilgileri */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Sipariş No</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
              {order.tracking_number && (
                <div>
                  <p className="text-sm text-gray-600">Takip No</p>
                  <p className="font-semibold">{order.tracking_number}</p>
                </div>
              )}
              {order.carrier && (
                <div>
                  <p className="text-sm text-gray-600">Kargo Firması</p>
                  <p className="font-semibold">{order.carrier}</p>
                </div>
              )}
            </div>
          </div>

          {/* Durum Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Kargo Durumu</h3>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {index < statusSteps.length - 1 && (
                      <div 
                        className={`absolute left-5 top-12 w-0.5 h-12 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 pb-8">
                      <p className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-green-600 mt-1">Şu anda burada</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ürünler */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Ürünler</h3>
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                  {item.gift_wrap && (
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1">
                      <Package size={12} />
                      Hediye Paketi
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700">{item.total_price.toFixed(2)} TL</p>
                  <p className="text-xs text-gray-500">{item.unit_price.toFixed(2)} TL/adet</p>
                </div>
              </div>
            ))}
          </div>

          {/* Teslimat Adresi */}
          {order.shipping_address && (
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Teslimat Adresi</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold">{order.shipping_address.full_name}</p>
                <p className="text-sm text-gray-600 mt-1">{order.shipping_address.address}</p>
                <p className="text-sm text-gray-600">
                  {order.shipping_address.city} / {order.shipping_address.district}
                </p>
                <p className="text-sm text-gray-600">{order.shipping_address.phone}</p>
              </div>
            </div>
          )}

          {/* Toplam */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Toplam Tutar</span>
              <span className="text-blue-700">{order.total_amount.toFixed(2)} TL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </div>
    )
  }

  if (!vipInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">VIP bilgileri yüklenemedi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Hesabım</h1>

      {/* Sekmeler */}
      <div className="flex border-b mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition border-b-2 ${
            activeTab === 'profile'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-600 hover:text-blue-700'
          }`}
        >
          <User size={20} />
          Profil & VIP
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition border-b-2 ${
            activeTab === 'wishlist'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-600 hover:text-blue-700'
          }`}
        >
          <Heart size={20} />
          İstek Listem
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 transition border-b-2 ${
            activeTab === 'orders'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-600 hover:text-blue-700'
          }`}
        >
          <Package size={20} />
          Siparişlerim
        </button>
      </div>

      {/* Profil & VIP Sekmesi */}
      {activeTab === 'profile' && (
        <>
          {/* VIP Durum Kartı */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="text-5xl">{vipInfo.tier_icon}</span>
              <div>
                <h2 className="text-3xl font-bold">{vipInfo.tier_name}</h2>
                <p className="text-blue-200">VIP Seviyeniz</p>
              </div>
            </div>
            <p className="text-blue-100">
              Toplam <span className="font-bold text-2xl text-white">{vipInfo.points}</span> puan
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-blue-200 text-sm mb-2">Ek İndirim</p>
              <p className="text-4xl font-bold">%{vipInfo.discount_percentage}</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            {vipInfo.next_tier ? (
              <>
                <p className="text-blue-200 mb-2">Bir sonraki seviye</p>
                <p className="text-2xl font-bold mb-2">{vipInfo.next_tier.name}</p>
                <p className="text-sm">
                  <span className="font-semibold">{vipInfo.next_tier.points_needed}</span> puan daha gerekli
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center md:justify-end gap-2">
                <Trophy className="text-yellow-300" size={32} />
                <p className="text-xl font-semibold">Maksimum Seviye!</p>
              </div>
            )}
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        {vipInfo.next_tier && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{allTiers[vipInfo.tier_level - 1]?.tier_name}</span>
              <span>{vipInfo.next_tier.name}</span>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-200 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* VIP Avantajlar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gift className="text-blue-700" size={24} />
              VIP Avantajlarınız
            </h3>
            <ul className="space-y-3">
              {vipInfo.perks.map((perk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tüm VIP Seviyeleri */}
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">VIP Seviyeleri</h3>
            <div className="space-y-3">
              {allTiers.map((tier) => (
                <div 
                  key={tier.tier_level}
                  className={`p-3 rounded-lg border-2 ${
                    tier.tier_level === vipInfo.tier_level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{tier.icon_emoji}</span>
                    <span className="font-semibold">{tier.tier_name}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {tier.min_points} - {tier.max_points || '∞'} puan
                  </p>
                  <p className="text-sm text-blue-700 font-semibold">
                    %{tier.discount_percentage} ek indirim
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Puan Geçmişi */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold mb-4">Puan Geçmişi</h3>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <p className="font-semibold">{getTransactionLabel(transaction.transaction_type)}</p>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">Henüz puan işlemi bulunmuyor</p>
                <p className="text-sm text-gray-400 mt-2">
                  Alışveriş yaparak puan kazanmaya başlayın!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}

      {/* İstek Listem Sekmesi */}
      {activeTab === 'wishlist' && (
        <div>
          {loadingWishlist ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <Heart className="mx-auto w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İstek Listeniz Boş</h2>
              <p className="text-gray-600 mb-8">Beğendiğiniz ürünleri istek listenize ekleyerek daha sonra satın alabilirsiniz</p>
              <a 
                href="/" 
                className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
              >
                Alışverişe Başla
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => {
                const product = item.products
                if (!product || !product.is_active) return null

                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-2xl font-bold text-blue-700 mb-2">{product.price.toFixed(2)} TL</p>
                        <p className="text-sm text-gray-500 mb-4">
                          Listeye eklenme: {new Date(item.created_at).toLocaleDateString('tr-TR')}
                        </p>
                        
                        <div className="flex gap-3">
                          <a
                            href={`/urun/${product.id}`}
                            className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition text-center font-medium"
                          >
                            Ürünü İncele
                          </a>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                          >
                            Listeden Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}



      {/* Siparişlerim Sekmesi */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <Package className="mx-auto w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Henüz Siparişiniz Yok</h2>
              <p className="text-gray-600 mb-8">İlk siparişinizi vermek için alışverişe başlayın</p>
              <a 
                href="/" 
                className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
              >
                Alışverişe Başla
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrders.includes(order.id)

                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => toggleOrderExpand(order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 flex-wrap">
                            <h3 className="font-bold text-lg">{order.order_number}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                              {getStatusLabel(order.order_status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(order.created_at).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-lg font-bold text-blue-700 mt-2">
                            {order.total_amount.toFixed(2)} TL
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-200 p-6 space-y-4">
                        {order.order_items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{item.product_name}</p>
                              <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                              {item.gift_wrap && (
                                <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1">
                                  <Package size={12} />
                                  Hediye Paketi
                                </span>
                              )}
                            </div>
                            <p className="font-bold">{item.total_price.toFixed(2)} TL</p>
                          </div>
                        ))}

                        <div className="flex gap-3 pt-4 border-t">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedOrder(order)
                            }}
                            className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-medium"
                          >
                            Sipariş Takibi
                          </button>
                          {order.order_status === 'pending' && (
                            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium">
                              İptal Et
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Sipariş Detay Modalı */}
          {selectedOrder && (
            <OrderStatusModal 
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          )}
        </div>
      )}

    </div>
  )
}

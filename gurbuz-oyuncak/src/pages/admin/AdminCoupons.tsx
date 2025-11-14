import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Gift, Plus, Edit2, Trash2, Search, Percent, Calendar, Users, TrendingUp, X, Loader2, User, Mail } from 'lucide-react'

interface Coupon {
  id: number
  code: string
  discount_type: string
  discount_value: number
  min_purchase_amount: number | null
  usage_limit: number | null
  used_count: number
  per_user_limit: number | null
  start_date: string
  end_date: string
  is_active: boolean
  description: string | null
  customer_types: string[] | null
  category_ids: number[] | null
  user_id: string | null  // Kullanıcıya özel kupon için
  created_at: string
}

interface Category {
  id: number
  name: string
}

interface UserSearchResult {
  id: string
  email: string
  full_name: string
  search_term?: string // Arama sonucunda highlight için
}

interface CouponFormData {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount: number | null
  usage_limit: number | null
  per_user_limit: number | null
  start_date: string
  end_date: string
  is_active: boolean
  description: string
  customer_types: string[]
  category_ids: number[]
  user_id: string | null  // Kullanıcıya özel kupon için
}

const initialFormData: CouponFormData = {
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_purchase_amount: null,
  usage_limit: null,
  per_user_limit: null,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  is_active: true,
  description: '',
  customer_types: [],
  category_ids: [],
  user_id: null
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [allUsers, setAllUsers] = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  // Kullanıcı arama state'leri
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [userSearchCache, setUserSearchCache] = useState<{[key: string]: UserSearchResult[]}>({})
  const userSearchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const customerTypeOptions = ['B2C', 'B2B', 'Toptan', 'Kurumsal']

  useEffect(() => {
    fetchCoupons()
    fetchCategories()
    fetchUsers()
  }, [])

  // Modal açıldığında kullanıcı arama state'lerini sıfırla
  useEffect(() => {
    if (showModal) {
      setUserSearchTerm('')
      setUserSearchResults([])
      setShowUserDropdown(false)
    }
  }, [showModal])

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userSearchInputRef.current && !userSearchInputRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCoupons(data || [])
    } catch (error) {
      console.error('Kuponlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name')

      if (error) throw error
      setAllUsers(data || [])
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error)
    }
  }

  // Kullanıcı arama fonksiyonu - debounced
  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUserSearchResults([])
      return
    }

    const cacheKey = searchTerm.toLowerCase()
    if (userSearchCache[cacheKey]) {
      setUserSearchResults(userSearchCache[cacheKey])
      return
    }

    setSearchingUsers(true)
    try {
      // Kullanıcı adı ve email'de arama
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('full_name')
        .limit(20) // Performans için sınırla

      if (error) throw error
      
      const results = (data || []).map(user => ({
        ...user,
        search_term: searchTerm
      }))
      
      setUserSearchResults(results)
      setUserSearchCache(prev => ({
        ...prev,
        [cacheKey]: results
      }))
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error)
      setUserSearchResults([])
    } finally {
      setSearchingUsers(false)
    }
  }, [userSearchCache])

  // Debounce effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchUsers(userSearchTerm)
    }, 300) // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [userSearchTerm, searchUsers])

  // Input değişikliği handler
  const handleUserSearchChange = (value: string) => {
    setUserSearchTerm(value)
    setShowUserDropdown(true)
  }

  // Kullanıcı seçimi
  const selectUser = (user: UserSearchResult | null) => {
    if (user) {
      setFormData({...formData, user_id: user.id})
      setUserSearchTerm(user.full_name || user.email)
    } else {
      setFormData({...formData, user_id: null})
      setUserSearchTerm('')
    }
    setShowUserDropdown(false)
  }

  // Arama sonuçlarında arama terimini highlight etme
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchCoupons()
    } catch (error) {
      console.error('Durum değiştirilemedi:', error)
    }
  }

  const deleteCoupon = async (id: number) => {
    if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCoupons()
    } catch (error) {
      console.error('Kupon silinemedi:', error)
    }
  }

  const openCreateModal = () => {
    setEditingCoupon(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type as 'percentage' | 'fixed',
      discount_value: coupon.discount_value,
      min_purchase_amount: coupon.min_purchase_amount,
      usage_limit: coupon.usage_limit,
      per_user_limit: coupon.per_user_limit,
      start_date: coupon.start_date.split('T')[0],
      end_date: coupon.end_date.split('T')[0],
      is_active: coupon.is_active,
      description: coupon.description || '',
      customer_types: coupon.customer_types || [],
      category_ids: coupon.category_ids || [],
      user_id: coupon.user_id
    })

    // Eğer kupon belirli bir kullanıcıya aitse, arama terimini ayarla
    if (coupon.user_id) {
      const user = allUsers.find(u => u.id === coupon.user_id)
      if (user) {
        setUserSearchTerm(user.full_name || user.email)
      }
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_purchase_amount: formData.min_purchase_amount || null,
        usage_limit: formData.usage_limit || null,
        per_user_limit: formData.per_user_limit || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        description: formData.description || null,
        customer_types: formData.customer_types.length > 0 ? formData.customer_types : null,
        category_ids: formData.category_ids.length > 0 ? formData.category_ids : null,
        user_id: formData.user_id || null,
        used_count: editingCoupon ? editingCoupon.used_count : 0
      }

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData])

        if (error) throw error
      }

      setShowModal(false)
      fetchCoupons()
      alert(editingCoupon ? 'Kupon güncellendi!' : 'Kupon oluşturuldu!')
    } catch (error: any) {
      console.error('Kupon kaydedilemedi:', error)
      alert('Hata: ' + (error.message || 'Kupon kaydedilemedi'))
    } finally {
      setSaving(false)
    }
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kupon Yönetimi</h2>
          <p className="text-gray-600 mt-1">İndirim kuponlarını görüntüle ve yönet</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-green-700 hover:bg-green-800 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Yeni Kupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Kupon</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{coupons.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Gift className="text-green-700" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aktif Kuponlar</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {coupons.filter(c => c.is_active && !isExpired(c.end_date) && !isUpcoming(c.start_date)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-700" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Toplam Kullanım</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {coupons.reduce((sum, c) => sum + c.used_count, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="text-green-700" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Süresi Dolan</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {coupons.filter(c => isExpired(c.end_date)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-red-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Kupon kodu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => {
          const expired = isExpired(coupon.end_date)
          const upcoming = isUpcoming(coupon.start_date)
          const usagePercentage = coupon.usage_limit 
            ? (coupon.used_count / coupon.usage_limit) * 100 
            : 0

          return (
            <div 
              key={coupon.id} 
              className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border-l-4 ${
                expired ? 'border-red-500 opacity-75' : 
                upcoming ? 'border-yellow-500' :
                coupon.is_active ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    expired ? 'bg-red-100' :
                    upcoming ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <Gift className={
                      expired ? 'text-red-700' :
                      upcoming ? 'text-yellow-700' :
                      'text-green-700'
                    } size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{coupon.code}</h3>
                    <p className="text-sm text-gray-500">
                      {coupon.discount_type === 'percentage' ? (
                        <span className="flex items-center gap-1">
                          <Percent size={14} />
                          {coupon.discount_value}% İndirim
                        </span>
                      ) : (
                        <span>{coupon.discount_value} TL İndirim</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(coupon.id, coupon.is_active)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    coupon.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {coupon.is_active ? 'Aktif' : 'Pasif'}
                </button>
              </div>

              {coupon.description && (
                <p className="text-sm text-gray-600 mb-3 italic">{coupon.description}</p>
              )}

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {expired && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    Süresi Doldu
                  </span>
                )}
                {upcoming && !expired && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Yakında Başlayacak
                  </span>
                )}
                {coupon.customer_types && coupon.customer_types.length > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {coupon.customer_types.join(', ')}
                  </span>
                )}
                {coupon.per_user_limit && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    Kişi başı {coupon.per_user_limit}x
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Min. Tutar:</span>
                  <span className="font-medium">
                    {coupon.min_purchase_amount ? `${coupon.min_purchase_amount} TL` : 'Yok'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kullanım:</span>
                  <span className="font-medium">
                    {coupon.used_count} / {coupon.usage_limit || '∞'}
                  </span>
                </div>
                {coupon.usage_limit && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        usagePercentage >= 90 ? 'bg-red-500' :
                        usagePercentage >= 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Başlangıç:</span>
                  <span className="font-medium">
                    {new Date(coupon.start_date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bitiş:</span>
                  <span className="font-medium">
                    {new Date(coupon.end_date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => openEditModal(coupon)}
                  className="flex-1 px-4 py-2 text-green-600 hover:bg-green-50 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Düzenle
                </button>
                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Sil
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Gift className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Kupon bulunamadı</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCoupon ? 'Kupon Düzenle' : 'Yeni Kupon Oluştur'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kupon Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Örn: YENI2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Tipi *
                  </label>
                  <select
                    required
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (TL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Değeri *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min. Sepet Tutarı (TL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_purchase_amount || ''}
                    onChange={(e) => setFormData({...formData, min_purchase_amount: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Belirtilmezse sınır yok"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toplam Kullanım Limiti
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usage_limit || ''}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Belirtilmezse sınırsız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kişi Başı Kullanım Limiti
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.per_user_limit || ''}
                    onChange={(e) => setFormData({...formData, per_user_limit: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Belirtilmezse sınırsız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={2}
                  placeholder="Kupon hakkında kısa açıklama..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Müşteri Tipleri (Seçili olmayanlar için geçerli olmaz)
                </label>
                <div className="flex flex-wrap gap-2">
                  {customerTypeOptions.map(type => (
                    <label key={type} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.customer_types.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, customer_types: [...formData.customer_types, type]})
                          } else {
                            setFormData({...formData, customer_types: formData.customer_types.filter(t => t !== type)})
                          }
                        }}
                        className="rounded text-green-600 focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Hiçbiri seçili değilse tüm müşteri tipleri için geçerlidir</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcıya Özel Kupon (İsteğe bağlı)
                </label>
                <div className="relative" ref={userSearchInputRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Kullanıcı adı veya email ara..."
                      value={userSearchTerm}
                      onChange={(e) => handleUserSearchChange(e.target.value)}
                      onFocus={() => setShowUserDropdown(true)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {userSearchTerm && (
                      <button
                        type="button"
                        onClick={() => selectUser(null)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {searchingUsers && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="text-green-500 animate-spin" size={16} />
                      </div>
                    )}
                  </div>

                  {/* Arama Sonuçları Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {searchingUsers ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="text-green-500 animate-spin mr-2" size={16} />
                          <span className="text-sm text-gray-500">Aranıyor...</span>
                        </div>
                      ) : userSearchTerm && userSearchResults.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500">
                          <User className="mx-auto text-gray-400 mb-1" size={16} />
                          Kullanıcı bulunamadı
                        </div>
                      ) : !userSearchTerm ? (
                        <div className="py-4 text-center text-sm text-gray-500">
                          <Users className="mx-auto text-gray-400 mb-1" size={16} />
                          Kullanıcı aramak için yazmaya başlayın
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={() => selectUser(null)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users size={16} className="text-gray-500" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">Genel Kupon</div>
                                <div className="text-xs text-gray-500">Tüm kullanıcılar için geçerli</div>
                              </div>
                            </div>
                          </div>
                          {userSearchResults.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => selectUser(user)}
                              className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <User size={16} className="text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-800 truncate">
                                    {highlightSearchTerm(user.full_name || user.email, user.search_term || '')}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                    <Mail size={12} />
                                    <span>{highlightSearchTerm(user.email, user.search_term || '')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.user_id ? (
                    <span className="text-green-600">✓ Belirli kullanıcıya özel kupon</span>
                  ) : (
                    'Boş bırakılırsa tüm kullanıcılar kullanabilir'
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriler (Seçili olmayanlar için geçerli olmaz)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.category_ids.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, category_ids: [...formData.category_ids, category.id]})
                          } else {
                            setFormData({...formData, category_ids: formData.category_ids.filter(id => id !== category.id)})
                          }
                        }}
                        className="rounded text-green-600 focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Hiçbiri seçili değilse tüm kategoriler için geçerlidir</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded text-green-600 focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Kupon aktif olsun
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-green-700 text-white rounded-xl hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Kaydediliyor...' : (editingCoupon ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Trophy, Star, Gift, TrendingUp, Users, Award, Edit2, Save, X } from 'lucide-react'

interface VIPTier {
  id: number
  level: number
  name: string
  emoji: string
  min_points: number
  discount_percentage: number
  benefits: string[]
}

interface PointRule {
  id: number
  action_type: string
  points_per_action: number
  calculation_formula: string
  description: string
}

interface VIPStats {
  level: number
  name: string
  emoji: string
  user_count: number
}

export default function AdminLoyalty() {
  const [vipTiers, setVipTiers] = useState<VIPTier[]>([])
  const [pointRules, setPointRules] = useState<PointRule[]>([])
  const [vipStats, setVipStats] = useState<VIPStats[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{[key: number]: number}>({})
  const [saving, setSaving] = useState(false)

  // İstatistikler
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [avgPoints, setAvgPoints] = useState(0)
  const [monthlyPointsAwarded, setMonthlyPointsAwarded] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // VIP Seviyeleri
      const { data: tiersData, error: tiersError } = await supabase
        .from('vip_tiers')
        .select('*')
        .order('level')
      
      if (tiersError) throw tiersError
      setVipTiers(tiersData || [])

      // Puan Kuralları
      const { data: rulesData, error: rulesError } = await supabase
        .from('point_rules')
        .select('*')
        .order('id')
      
      if (rulesError) throw rulesError
      setPointRules(rulesData || [])

      // VIP İstatistikleri (Kullanıcı sayısı)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('vip_level, total_points')
      
      if (usersError) throw usersError

      // Her seviye için kullanıcı sayısını hesapla
      const statsMap = new Map<number, number>()
      usersData?.forEach(user => {
        const level = user.vip_level || 1
        statsMap.set(level, (statsMap.get(level) || 0) + 1)
      })

      const stats = tiersData?.map(tier => ({
        level: tier.level,
        name: tier.name,
        emoji: tier.emoji,
        user_count: statsMap.get(tier.level) || 0
      })) || []

      setVipStats(stats)

      // Genel istatistikler
      setTotalUsers(usersData?.length || 0)
      const points = usersData?.reduce((sum, u) => sum + (u.total_points || 0), 0) || 0
      setTotalPoints(points)
      setAvgPoints(usersData?.length ? Math.round(points / usersData.length) : 0)

      // Bu ay verilen puanlar
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: transData, error: transError } = await supabase
        .from('point_transactions')
        .select('points_earned')
        .gte('created_at', startOfMonth.toISOString())
      
      if (!transError) {
        const monthlyPoints = transData?.reduce((sum, t) => sum + t.points_earned, 0) || 0
        setMonthlyPointsAwarded(monthlyPoints)
      }

    } catch (error) {
      console.error('Veri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (rule: PointRule) => {
    setEditingRule(rule.id)
    setEditValues({ ...editValues, [rule.id]: rule.points_per_action })
  }

  const cancelEdit = () => {
    setEditingRule(null)
    setEditValues({})
  }

  const saveRule = async (ruleId: number) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('point_rules')
        .update({ points_per_action: editValues[ruleId] })
        .eq('id', ruleId)

      if (error) throw error

      await fetchData()
      setEditingRule(null)
      alert('Kural güncellendi!')
    } catch (error) {
      console.error('Kural güncellenemedi:', error)
      alert('Hata: Kural güncellenemedi')
    } finally {
      setSaving(false)
    }
  }

  const getActionTypeName = (actionType: string) => {
    const names: {[key: string]: string} = {
      'purchase': 'Alışveriş',
      'review': 'Ürün Yorumu',
      'social_share': 'Sosyal Medya Paylaşımı',
      'birthday': 'Doğum Günü Bonusu',
      'first_order': 'İlk Sipariş Bonusu',
      'comment': 'Yorum Yazma'
    }
    return names[actionType] || actionType
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
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Sadakat ve Puan Sistemi</h2>
        <p className="text-gray-600 mt-1">VIP seviyeleri, puan kuralları ve istatistikler</p>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold mt-2">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Toplam Puan</p>
              <p className="text-3xl font-bold mt-2">{totalPoints.toLocaleString('tr-TR')}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Star size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Ortalama Puan</p>
              <p className="text-3xl font-bold mt-2">{avgPoints}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Bu Ay Verilen</p>
              <p className="text-3xl font-bold mt-2">{monthlyPointsAwarded.toLocaleString('tr-TR')}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Gift size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* VIP Seviyeleri ve Kullanıcı Dağılımı */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="text-yellow-500" size={24} />
          <h3 className="text-xl font-bold text-gray-800">VIP Seviyeleri ve Kullanıcı Dağılımı</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vipStats.map((stat) => {
            const tier = vipTiers.find(t => t.level === stat.level)
            const percentage = totalUsers > 0 ? ((stat.user_count / totalUsers) * 100).toFixed(1) : '0'

            return (
              <div 
                key={stat.level} 
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-400 transition"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{stat.emoji}</div>
                  <h4 className="font-bold text-lg text-gray-800">{stat.name}</h4>
                  <p className="text-sm text-gray-500">Seviye {stat.level}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kullanıcı:</span>
                    <span className="font-bold text-gray-800">{stat.user_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Oran:</span>
                    <span className="font-bold text-green-600">{percentage}%</span>
                  </div>
                  {tier && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Min. Puan:</span>
                        <span className="font-bold text-gray-800">{tier.min_points}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">İndirim:</span>
                        <span className="font-bold text-green-600">{tier.discount_percentage}%</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Puan Kazanım Kuralları */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="text-purple-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Puan Kazanım Kuralları</h3>
          </div>
          <p className="text-sm text-gray-500">Puan değerlerini düzenleyebilirsiniz</p>
        </div>

        <div className="space-y-3">
          {pointRules.map((rule) => (
            <div 
              key={rule.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-300 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Award className="text-green-600" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-800">{getActionTypeName(rule.action_type)}</h4>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                    {rule.calculation_formula && (
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        Formül: {rule.calculation_formula}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {editingRule === rule.id ? (
                  <>
                    <input
                      type="number"
                      min="0"
                      value={editValues[rule.id] || 0}
                      onChange={(e) => setEditValues({...editValues, [rule.id]: parseFloat(e.target.value)})}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center"
                    />
                    <button
                      onClick={() => saveRule(rule.id)}
                      disabled={saving}
                      className="px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{rule.points_per_action}</p>
                      <p className="text-xs text-gray-500">puan</p>
                    </div>
                    <button
                      onClick={() => startEdit(rule)}
                      className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-xl transition"
                    >
                      <Edit2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIP Avantajları Tablosu */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2 mb-6">
          <Gift className="text-green-500" size={24} />
          <h3 className="text-xl font-bold text-gray-800">VIP Seviye Avantajları</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Seviye</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Min. Puan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">İndirim</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Avantajlar</th>
              </tr>
            </thead>
            <tbody>
              {vipTiers.map((tier) => (
                <tr key={tier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tier.emoji}</span>
                      <span className="font-semibold text-gray-800">{tier.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{tier.min_points} puan</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      %{tier.discount_percentage}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bilgi Notu */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex gap-3">
          <div className="text-green-600 mt-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-2">Sistem Bilgileri</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• VIP seviyeleri kullanıcıların toplam puanlarına göre otomatik güncellenir</li>
              <li>• Puan kazanım kuralları tüm sistemde geçerlidir</li>
              <li>• İndirimler alışveriş sırasında otomatik olarak uygulanır</li>
              <li>• Doğum günü bonusları her yıl otomatik olarak verilir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

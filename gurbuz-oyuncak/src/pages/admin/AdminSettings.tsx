import { useState } from 'react'
import { Settings as SettingsIcon, Save, Check, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function AdminSettings() {
  const { authSettings, updateAuthSettings } = useAuth()
  const [siteName, setSiteName] = useState('Gürbüz Oyuncak')
  const [siteDescription, setSiteDescription] = useState('Kaliteli ve uygun fiyatlı oyuncaklar')
  const [contactEmail, setContactEmail] = useState('info@gurbuzoyuncak.com')
  const [minOrderAmount, setMinOrderAmount] = useState('100')
  const [shippingFee, setShippingFee] = useState('29.90')
  const [freeShippingLimit, setFreeShippingLimit] = useState('500')
  const [paytrEnabled, setPaytrEnabled] = useState(false)
  const [paytrMerchantId, setPaytrMerchantId] = useState('')
  const [paytrMerchantKey, setPaytrMerchantKey] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)
  const [stockNotifications, setStockNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaving(true)
    
    // Simülasyon: Ayarları kaydet
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      
      // 2 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSaved(false)
      }, 2000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Sistem Ayarları</h2>
        <p className="text-gray-600 mt-1">Genel ayarları yönet</p>
      </div>

      {/* Demo Mode Notice */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>Not:</strong> Ayarlar şu anda tarayıcı belleğinde saklanmaktadır. Gerçek implementasyonda bu ayarlar veritabanına kaydedilecektir.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Giriş Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Giriş Ayarları
          </h3>
          <p className="text-gray-600 mb-6">
            Kullanıcıların hangi sosyal medya hesapları ile giriş yapabileceğini belirleyin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Auth Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Google ile Giriş</h5>
                  <p className="text-sm text-gray-600">Google hesabı ile giriş yapma</p>
                </div>
              </div>
              <button
                onClick={() => {
                  updateAuthSettings({ googleAuthEnabled: !authSettings?.googleAuthEnabled })
                  toast.success(`Google ile giriş ${!authSettings?.googleAuthEnabled ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`)
                }}
                className="flex items-center gap-2"
              >
                {authSettings?.googleAuthEnabled ? (
                  <ToggleRight className="w-10 h-10 text-green-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Facebook Auth Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Facebook ile Giriş</h5>
                  <p className="text-sm text-gray-600">Facebook hesabı ile giriş yapma</p>
                </div>
              </div>
              <button
                onClick={() => {
                  updateAuthSettings({ facebookAuthEnabled: !authSettings?.facebookAuthEnabled })
                  toast.success(`Facebook ile giriş ${!authSettings?.facebookAuthEnabled ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`)
                }}
                className="flex items-center gap-2"
              >
                {authSettings?.facebookAuthEnabled ? (
                  <ToggleRight className="w-10 h-10 text-green-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-green-600 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-medium text-green-900 mb-1">Bilgi</p>
                <p className="text-green-700">
                  Bu ayarlar tüm kullanıcılar için geçerlidir. Devre dışı bırakılan giriş seçenekleri giriş sayfasında görünmeyecektir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Genel Ayarlar */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <SettingsIcon size={20} />
            Genel Ayarlar
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Adı
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Açıklaması
              </label>
              <textarea
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İletişim E-posta
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Sipariş Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Sipariş Ayarları
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. Sipariş Tutarı (₺)
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kargo Ücreti (₺)
              </label>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ücretsiz Kargo Limiti (₺)
              </label>
              <input
                type="number"
                value={freeShippingLimit}
                onChange={(e) => setFreeShippingLimit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Ödeme Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ödeme Ayarları (Demo Mode)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                PayTR Entegrasyonu
              </label>
              <input 
                type="checkbox" 
                checked={paytrEnabled}
                onChange={(e) => setPaytrEnabled(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PayTR Merchant ID
              </label>
              <input
                type="text"
                value={paytrMerchantId}
                onChange={(e) => setPaytrMerchantId(e.target.value)}
                placeholder="Merchant ID (Demo)"
                disabled={!paytrEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PayTR Merchant Key
              </label>
              <input
                type="password"
                value={paytrMerchantKey}
                onChange={(e) => setPaytrMerchantKey(e.target.value)}
                placeholder="••••••••"
                disabled={!paytrEnabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-800">
                PayTR entegrasyonu yakında aktif edilecektir. Şu anda demo modunda çalışmaktadır.
              </p>
            </div>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Bildirim Ayarları
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                E-posta Bildirimleri
              </label>
              <input 
                type="checkbox" 
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded" 
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Sipariş Bildirimleri
              </label>
              <input 
                type="checkbox" 
                checked={orderNotifications}
                onChange={(e) => setOrderNotifications(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded" 
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Stok Bildirimleri
              </label>
              <input 
                type="checkbox" 
                checked={stockNotifications}
                onChange={(e) => setStockNotifications(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <Check size={20} />
            <span className="text-sm font-medium">Ayarlar kaydedildi!</span>
          </div>
        )}
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-green-700 hover:bg-green-800 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>
    </div>
  )
}

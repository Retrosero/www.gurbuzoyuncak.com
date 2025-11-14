import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Settings, Save, RefreshCw, Clock, Link, Mail, CheckCircle, AlertCircle, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface SyncSettings {
  id?: string
  is_enabled: boolean
  schedule_type: string
  schedule_value: number
  cron_expression: string
  xml_source_type: string
  xml_source_url: string
  send_email_notifications: boolean
  notification_emails: string[]
  last_run_at?: string
  next_run_at?: string
}

export default function AdminXMLSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [settings, setSettings] = useState<SyncSettings>({
    is_enabled: false,
    schedule_type: 'hours',
    schedule_value: 1,
    cron_expression: '0 * * * *',
    xml_source_type: 'url',
    xml_source_url: '',
    send_email_notifications: false,
    notification_emails: []
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('xml_sync_settings')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setSettings({
          ...data,
          notification_emails: data.notification_emails || []
        })
      }
    } catch (error) {
      console.error('Ayarlar yükleme hatası:', error)
      toast.error('Ayarlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Cron expression oluştur
      let cronExpression = ''
      switch (settings.schedule_type) {
        case 'minutes':
          cronExpression = `*/${settings.schedule_value} * * * *`
          break
        case 'hours':
          cronExpression = `0 */${settings.schedule_value} * * *`
          break
        case 'daily':
          cronExpression = `0 ${settings.schedule_value} * * *`
          break
        case 'weekly':
          cronExpression = `0 0 * * ${settings.schedule_value}`
          break
      }

      const saveData = {
        ...settings,
        cron_expression: cronExpression,
        updated_at: new Date().toISOString()
      }

      if (settings.id) {
        // Güncelle
        const { error } = await supabase
          .from('xml_sync_settings')
          .update(saveData)
          .eq('id', settings.id)

        if (error) throw error
      } else {
        // Yeni kayıt
        const { data, error } = await supabase
          .from('xml_sync_settings')
          .insert([saveData])
          .select()
          .single()

        if (error) throw error
        setSettings({ ...settings, id: data.id })
      }

      // Eğer enabled ise cron job oluştur/güncelle
      if (settings.is_enabled) {
        await createOrUpdateCronJob(cronExpression)
      }

      toast.success('Ayarlar başarıyla kaydedildi')
    } catch (error) {
      console.error('Ayarlar kaydetme hatası:', error)
      toast.error('Ayarlar kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const createOrUpdateCronJob = async (cronExpression: string) => {
    try {
      // Cron job oluşturma/güncelleme
      // Bu işlem backend tarafında yapılacak
      console.log('Cron job güncelleniyor:', cronExpression)
    } catch (error) {
      console.error('Cron job hatası:', error)
    }
  }

  const testSyncNow = async () => {
    if (!settings.xml_source_url) {
      toast.error('Önce XML kaynak URL\'si ayarlayın')
      return
    }

    setTesting(true)
    try {
      const { data, error } = await supabase.functions.invoke('xml-auto-sync-cron')

      if (error) throw error

      if (data.executed) {
        toast.success('Test senkronizasyonu başarılı')
        // Sonuçları göster
        if (data.result && data.result.data) {
          const result = data.result.data
          toast.info(`${result.new} yeni, ${result.updated} güncellenen, ${result.deactivated} pasifleştirilen ürün`)
        }
      } else {
        toast.info(data.message)
      }
    } catch (error: any) {
      console.error('Test senkronizasyon hatası:', error)
      toast.error(error.message || 'Test başarısız')
    } finally {
      setTesting(false)
    }
  }

  const getCronDescription = () => {
    const { schedule_type, schedule_value } = settings
    switch (schedule_type) {
      case 'minutes':
        return `Her ${schedule_value} dakikada bir`
      case 'hours':
        return `Her ${schedule_value} saatte bir`
      case 'daily':
        return `Her gün saat ${schedule_value}:00'da`
      case 'weekly':
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
        return `Her ${days[schedule_value]} günü`
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Otomatik Senkronizasyon Ayarları
              </h1>
              <p className="text-green-100 mt-2">XML ürün senkronizasyonunu otomatikleştirin</p>
            </div>
            <button
              onClick={() => navigate('/admin/xml/yukle')}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Aktif/Pasif Durumu */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Otomatik Senkronizasyon</h2>
              <p className="text-gray-600">
                {settings.is_enabled 
                  ? 'Otomatik senkronizasyon aktif. Sistem belirlenen periyotta otomatik olarak çalışacak.'
                  : 'Otomatik senkronizasyon pasif. Sadece manuel senkronizasyon yapılabilir.'
                }
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_enabled}
                onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {settings.last_run_at && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <p className="text-sm text-green-900">
                <Clock className="w-4 h-4 inline mr-1" />
                Son çalışma: {new Date(settings.last_run_at).toLocaleString('tr-TR')}
              </p>
            </div>
          )}
        </div>

        {/* Zamanlama Ayarları */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Zamanlama
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periyot Türü
              </label>
              <select
                value={settings.schedule_type}
                onChange={(e) => setSettings({ ...settings, schedule_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                disabled={!settings.is_enabled}
              >
                <option value="minutes">Dakika</option>
                <option value="hours">Saat</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {settings.schedule_type === 'minutes' && 'Kaç dakikada bir?'}
                {settings.schedule_type === 'hours' && 'Kaç saatte bir?'}
                {settings.schedule_type === 'daily' && 'Saat (0-23)'}
                {settings.schedule_type === 'weekly' && 'Gün (0=Pazar, 6=Cumartesi)'}
              </label>
              <input
                type="number"
                value={settings.schedule_value}
                onChange={(e) => setSettings({ ...settings, schedule_value: parseInt(e.target.value) || 1 })}
                min={1}
                max={settings.schedule_type === 'daily' ? 23 : settings.schedule_type === 'weekly' ? 6 : 60}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                disabled={!settings.is_enabled}
              />
            </div>

            {settings.is_enabled && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                  <CheckCircle className="w-4 h-4" />
                  Zamanlama Özeti
                </div>
                <p className="text-sm text-green-700">
                  {getCronDescription()}
                </p>
                <p className="text-xs text-green-600 mt-1 font-mono">
                  Cron: {settings.cron_expression}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* XML Kaynak Ayarları */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Link className="w-5 h-5" />
            XML Kaynağı
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kaynak Tipi
              </label>
              <select
                value={settings.xml_source_type}
                onChange={(e) => setSettings({ ...settings, xml_source_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                disabled={!settings.is_enabled}
              >
                <option value="url">URL</option>
                <option value="file">Dosya (gelecek sürüm)</option>
              </select>
            </div>

            {settings.xml_source_type === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  XML URL Adresi
                </label>
                <input
                  type="url"
                  value={settings.xml_source_url}
                  onChange={(e) => setSettings({ ...settings, xml_source_url: e.target.value })}
                  placeholder="https://example.com/products.xml"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  disabled={!settings.is_enabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  XML dosyasının bulunduğu URL adresini girin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Bildirimler (Yakında)
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">E-posta Bildirimleri</p>
                <p className="text-sm text-gray-600">Senkronizasyon sonuçları e-posta ile gönderilsin</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={settings.send_email_notifications}
                  onChange={(e) => setSettings({ ...settings, send_email_notifications: e.target.checked })}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                E-posta bildirimleri yakında aktif edilecek
              </p>
            </div>
          </div>
        </div>

        {/* Kaydet ve Test Butonları */}
        <div className="flex gap-4">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Ayarları Kaydet
              </>
            )}
          </button>

          <button
            onClick={testSyncNow}
            disabled={testing || !settings.xml_source_url}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {testing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Test Ediliyor...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Şimdi Test Et
              </>
            )}
          </button>
        </div>

        {/* Uyarı */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Önemli Notlar:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Otomatik senkronizasyon, ayarlanan periyotta XML kaynağından veri çeker</li>
                <li>Yeni ürünler otomatik eklenir, mevcut ürünler güncellenir</li>
                <li>XML'de olmayan aktif ürünler pasifleştirilir</li>
                <li>Çok sık periyot ayarlamak sunucu yükünü artırabilir</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

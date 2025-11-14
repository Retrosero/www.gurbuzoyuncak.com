import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image, 
  Upload, 
  Link as LinkIcon,
  Calendar,
  Percent,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Banner {
  id: number
  title: string
  description: string
  image_url: string
  discount_percentage: number
  start_date: string
  end_date: string
  link_url: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Banner boyut bilgileri
const BANNER_DIMENSIONS = {
  main: { width: 1200, height: 600, label: 'Ana Banner (Desktop)' },
  tablet: { width: 768, height: 400, label: 'Tablet Banner' },
  mobile: { width: 375, height: 300, label: 'Mobile Banner' }
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    discount_percentage: 0,
    start_date: '',
    end_date: '',
    link_url: '',
    is_active: true,
    display_order: 0
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('campaign_banners')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Banner yüklenirken hata:', error)
        // Tablo yoksa oluşturmayı dene
        await createBannersTable()
        return
      }

      setBanners(data || [])
    } catch (error) {
      console.error('Banner yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBannersTable = async () => {
    try {
      const { data, error } = await supabase.rpc('create_banners_table')
      if (error) {
        console.log('Tablo oluşturma RPC başarısız, manuel oluşturma deneniyor...')
        // Manuel tablo oluşturma
        const { error: createError } = await supabase
          .from('campaign_banners')
          .insert({
            title: 'Test Banner',
            description: 'Test açıklama',
            image_url: '',
            discount_percentage: 10,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            link_url: '/urunler',
            is_active: true,
            display_order: 1
          })
        
        if (createError) {
          console.error('Banner tablosu oluşturulamadı:', createError)
        } else {
          console.log('Banner tablosu başarıyla oluşturuldu')
          loadBanners()
        }
      } else {
        loadBanners()
      }
    } catch (error) {
      console.error('Tablo oluşturulurken hata:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageSelect = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image_url

    try {
      setUploading(true)
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `banner_${Date.now()}.${fileExt}`
      const filePath = `banners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Resim yüklenirken hata:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const saveBanner = async () => {
    try {
      setUploading(true)

      let imageUrl = formData.image_url
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const bannerData = {
        ...formData,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      }

      if (editingBanner) {
        // Güncelleme
        const { error } = await supabase
          .from('campaign_banners')
          .update(bannerData)
          .eq('id', editingBanner.id)

        if (error) throw error
      } else {
        // Yeni ekleme
        const { error } = await supabase
          .from('campaign_banners')
          .insert([{
            ...bannerData,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      // Başarı mesajı göster
      await loadBanners()
      closeModal()

      // Toast mesajı
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 text-black px-6 py-3 rounded-xl shadow-lg z-50'
      toast.style.backgroundColor = '#ffde59'
      toast.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          Banner başarıyla kaydedildi!
        </div>
      `
      document.body.appendChild(toast)
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 3000)

    } catch (error) {
      console.error('Banner kaydedilirken hata:', error)
      // Hata mesajı
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 text-white px-6 py-3 rounded-xl shadow-lg z-50'
      toast.style.backgroundColor = '#ef4444'
      toast.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
          Banner kaydedilirken hata oluştu!
        </div>
      `
      document.body.appendChild(toast)
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 3000)
    } finally {
      setUploading(false)
    }
  }

  const deleteBanner = async (id: number) => {
    if (!confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('campaign_banners')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadBanners()

      // Başarı mesajı
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 text-black px-6 py-3 rounded-xl shadow-lg z-50'
      toast.style.backgroundColor = '#ffde59'
      toast.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          Banner başarıyla silindi!
        </div>
      `
      document.body.appendChild(toast)
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 3000)

    } catch (error) {
      console.error('Banner silinirken hata:', error)
    }
  }

  const toggleBannerStatus = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('campaign_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id)

      if (error) throw error

      await loadBanners()
    } catch (error) {
      console.error('Banner durumu güncellenirken hata:', error)
    }
  }

  const moveBanner = async (banner: Banner, direction: 'up' | 'down') => {
    try {
      const newOrder = direction === 'up' ? banner.display_order - 1 : banner.display_order + 1
      const { error } = await supabase
        .from('campaign_banners')
        .update({ display_order: newOrder })
        .eq('id', banner.id)

      if (error) throw error

      await loadBanners()
    } catch (error) {
      console.error('Banner sıralaması güncellenirken hata:', error)
    }
  }

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        title: banner.title,
        description: banner.description,
        image_url: banner.image_url,
        discount_percentage: banner.discount_percentage,
        start_date: banner.start_date.split('T')[0],
        end_date: banner.end_date.split('T')[0],
        link_url: banner.link_url,
        is_active: banner.is_active,
        display_order: banner.display_order
      })
      setImagePreview(banner.image_url)
    } else {
      setEditingBanner(null)
      setFormData({
        title: '',
        description: '',
        image_url: '',
        discount_percentage: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        link_url: '',
        is_active: true,
        display_order: banners.length + 1
      })
      setImagePreview('')
    }
    setImageFile(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBanner(null)
    setImageFile(null)
    setImagePreview('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const isActive = (banner: Banner) => {
    const now = new Date()
    const start = new Date(banner.start_date)
    const end = new Date(banner.end_date)
    return now >= start && now <= end
  }

  if (loading) {
    return (
      <AdminLayout showSidebar={false}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout showSidebar={false}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banner Yönetimi</h1>
            <p className="text-gray-600">Ana sayfa kampanya bannerlarını yönetin</p>
          </div>
          <Button onClick={() => openModal()} className="bg-green-700 hover:bg-green-800 transition-all duration-200 hover:shadow-lg hover:scale-105 transition-all duration-200 hover:shadow-lg hover:scale-105 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Banner Ekle
          </Button>
        </div>

        {/* Banner Boyut Bilgileri */}
        <Card className="mb-6 bg-green-50 border-green-200 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Banner Boyut Önerileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {Object.entries(BANNER_DIMENSIONS).map(([key, dim]) => (
                <div key={key} className="bg-white p-3 rounded-xl border transition-all duration-200 hover:shadow-md">
                  <p className="font-medium text-gray-900">{dim.label}</p>
                  <p className="text-gray-600">{dim.width} x {dim.height} px</p>
                  <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, WebP</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Banner Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Aktif Bannerlar ({banners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {banners.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Henüz banner eklenmemiş</p>
                <Button 
                  onClick={() => openModal()} 
                  variant="outline" 
                  className="mt-4"
                >
                  İlk Bannerınızı Ekleyin
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div 
                    key={banner.id} 
                    className={`p-4 border rounded-xl transition-all duration-200 hover:shadow-md ${
                      banner.is_active && isActive(banner) 
                        ? 'bg-green-50 border-green-200' 
                        : banner.is_active 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Banner Önizleme */}
                      <div className="flex-shrink-0">
                        {banner.image_url ? (
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-24 h-16 object-cover rounded-xl border transition-all duration-200 hover:shadow-md"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-gray-200 rounded-xl border flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Banner Bilgileri */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {banner.title}
                          </h3>
                          {isActive(banner) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium bg-green-100 text-green-800 transition-all duration-200">
                              Aktif
                            </span>
                          )}
                          {!isActive(banner) && banner.is_active && (
                            <span className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium bg-yellow-100 text-yellow-800 transition-all duration-200">
                              Beklemede
                            </span>
                          )}
                          {!banner.is_active && (
                            <span className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium bg-gray-100 text-gray-800 transition-all duration-200">
                              Pasif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                          {banner.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            %{banner.discount_percentage} İndirim
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(banner.start_date)} - {formatDate(banner.end_date)}
                          </span>
                          {banner.link_url && (
                            <span className="flex items-center gap-1">
                              <LinkIcon className="w-3 h-3" />
                              Link Var
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Aksiyon Butonları */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveBanner(banner, 'up')}
                          disabled={banner.display_order === 1}
                          className="transition-all duration-200 hover:shadow-md rounded-xl"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveBanner(banner, 'down')}
                          disabled={banner.display_order === banners.length}
                          className="transition-all duration-200 hover:shadow-md rounded-xl"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBannerStatus(banner)}
                          className="transition-all duration-200 hover:shadow-md rounded-xl"
                        >
                          {banner.is_active ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal(banner)}
                          className="transition-all duration-200 hover:shadow-md rounded-xl"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteBanner(banner.id)}
                          className="text-red-600 hover:text-red-700 transition-all duration-200 hover:shadow-md rounded-xl"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banner Ekleme/Düzenleme Modalı */}
        <Dialog open={showModal} onOpenChange={closeModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Banner Düzenle' : 'Yeni Banner Ekle'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Banner Boyut Bilgisi */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 transition-all duration-200 hover:shadow-md">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Önerilen Boyutlar
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {Object.entries(BANNER_DIMENSIONS).map(([key, dim]) => (
                    <div key={key} className="text-center">
                      <p className="font-medium">{dim.label}</p>
                      <p className="text-green-600">{dim.width}x{dim.height}px</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Başlık */}
              <div>
                <Label htmlFor="title">Banner Başlığı *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Örn: Yeni Yıl İndirimi"
                  className="rounded-xl transition-all duration-200 focus:shadow-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              {/* Açıklama */}
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Banner açıklaması..."
                  rows={3}
                  className="rounded-xl transition-all duration-200 focus:shadow-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* İndirim Yüzdesi */}
              <div>
                <Label htmlFor="discount">İndirim Yüzdesi (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => handleInputChange('discount_percentage', parseInt(e.target.value) || 0)}
                  placeholder="20"
                  className="rounded-xl transition-all duration-200 focus:shadow-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Tarih Aralığı */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Başlangıç Tarihi *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="rounded-xl transition-all duration-200 focus:shadow-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Bitiş Tarihi *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="rounded-xl transition-all duration-200 focus:shadow-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Link */}
              <div>
                <Label htmlFor="link_url">Yönlendirme Linki</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => handleInputChange('link_url', e.target.value)}
                  placeholder="/urunler veya https://example.com"
                  className="rounded-xl transition-all duration-200 focus:shadow-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Resim Yükleme */}
              <div>
                <Label>Banner Resmi *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 transition-all duration-200 hover:border-green-400">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Banner önizleme"
                        className="w-full h-48 object-cover rounded-xl transition-all duration-200 hover:shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-xl p-1.5 hover:bg-red-600 transition-all duration-200 hover:shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Resim yüklemek için tıklayın</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageSelect(file)
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105"
                      >
                        <Upload className="w-4 h-4" />
                        Resim Seç
                      </Label>
                    </div>
                  )}
                </div>

                {/* Link ile Resim URL'i */}
                <div className="mt-4">
                  <Label htmlFor="image_url">Veya Resim URL'i</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="rounded-xl transition-all duration-200 focus:shadow-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Aktif Durumu */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded-xl text-green-600 focus:ring-green-500 transition-all duration-200"
                />
                <Label htmlFor="is_active">Banner aktif olsun</Label>
              </div>

              {/* Butonlar */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={saveBanner}
                  disabled={uploading || !formData.title || (!formData.image_url && !imageFile)}
                  className="flex-1 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105 transition-all duration-200 hover:shadow-lg hover:scale-105 rounded-xl"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Kaydediliyor...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingBanner ? 'Güncelle' : 'Kaydet'}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={closeModal} className="rounded-xl transition-all duration-200 hover:shadow-md">
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
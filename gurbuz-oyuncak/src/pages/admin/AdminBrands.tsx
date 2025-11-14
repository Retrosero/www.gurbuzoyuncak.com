import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Brand } from '../../types'
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Upload,
  X,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Save,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface BrandFormData {
  name: string
  slug: string
  description: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  is_active: boolean
}

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: BrandFormData, logoFile?: File) => Promise<void>
  brand?: Brand | null
  loading: boolean
}

function BrandModal({ isOpen, onClose, onSave, brand, loading }: BrandModalProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_active: true
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [errors, setErrors] = useState<Partial<BrandFormData>>({})

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        meta_title: brand.meta_title || '',
        meta_description: brand.meta_description || '',
        meta_keywords: brand.meta_keywords || '',
        is_active: brand.is_active
      })
      setLogoPreview(brand.logo_url || '')
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        is_active: true
      })
      setLogoPreview('')
    }
    setLogoFile(null)
    setErrors({})
  }, [brand, isOpen])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo dosyası 5MB\'dan büyük olamaz!')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece resim dosyaları yüklenebilir!')
        return
      }
      
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<BrandFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Marka adı gereklidir'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug gereklidir'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug sadece küçük harf, rakam ve tire içerebilir'
    }

    if (formData.meta_description && formData.meta_description.length > 160) {
      newErrors.meta_description = 'Meta açıklama 160 karakterden uzun olamaz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Lütfen form hatalarını düzeltin')
      return
    }

    try {
      await onSave(formData, logoFile || undefined)
      onClose()
    } catch (error) {
      console.error('Marka kaydedilemedi:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {brand ? 'Marka Düzenle' : 'Yeni Marka Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marka Logosu
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo önizleme" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="text-gray-400" size={32} />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl cursor-pointer hover:bg-green-100 transition"
                >
                  <Upload size={16} />
                  Logo Yükle
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimum 5MB, PNG/JPG/WebP
                </p>
              </div>
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marka Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Örn: LEGO"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="lego"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.slug}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Marka hakkında kısa açıklama..."
            />
          </div>

          {/* SEO Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">SEO Ayarları</h3>
            
            {/* Meta Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Başlık
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="SEO için meta başlık..."
              />
            </div>

            {/* Meta Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Açıklama
                <span className="text-gray-500 text-xs ml-2">
                  ({formData.meta_description.length}/160)
                </span>
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                rows={2}
                maxLength={160}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.meta_description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Arama motorları için meta açıklama..."
              />
              {errors.meta_description && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.meta_description}
                </p>
              )}
            </div>

            {/* Meta Keywords */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anahtar Kelimeler
              </label>
              <input
                type="text"
                value={formData.meta_keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="anahtar1, anahtar2, anahtar3"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Aktif Marka
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-700 text-white rounded-xl hover:bg-green-800 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setBrands(data || [])
    } catch (error) {
      console.error('Markalar yüklenemedi:', error)
      toast.error('Markalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `brands/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Logo yüklenemedi:', error)
      throw error
    }
  }

  const saveBrand = async (formData: BrandFormData, logoFile?: File) => {
    try {
      setSaving(true)
      
      let logoUrl = editingBrand?.logo_url || null
      
      // Upload logo if new file provided
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile)
      }

      const brandData = {
        ...formData,
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      }

      if (editingBrand) {
        // Update existing brand
        const { error } = await supabase
          .from('brands')
          .update(brandData)
          .eq('id', editingBrand.id)

        if (error) throw error
        toast.success('Marka başarıyla güncellendi')
      } else {
        // Create new brand
        const { error } = await supabase
          .from('brands')
          .insert([brandData])

        if (error) throw error
        toast.success('Marka başarıyla eklendi')
      }

      await fetchBrands()
      setEditingBrand(null)
    } catch (error) {
      console.error('Marka kaydedilemedi:', error)
      toast.error('Marka kaydedilemedi')
      throw error
    } finally {
      setSaving(false)
    }
  }

  const deleteBrand = async (id: string, name: string) => {
    if (!confirm(`${name} markasını silmek istediğinizden emin misiniz?`)) return

    try {
      // Delete logo from storage
      const brand = brands.find(b => b.id.toString() === id)
      if (brand?.logo_url) {
        const fileName = brand.logo_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('brand-logos')
            .remove([`brands/${fileName}`])
        }
      }

      // Delete brand from database
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Marka başarıyla silindi')
      await fetchBrands()
    } catch (error) {
      console.error('Marka silinemedi:', error)
      toast.error('Marka silinemedi')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean, name: string) => {
    try {
      const { error } = await supabase
        .from('brands')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      const action = !currentStatus ? 'aktifleştirildi' : 'pasifleştirildi'
      toast.success(`${name} markası ${action}`)
      await fetchBrands()
    } catch (error) {
      console.error('Durum değiştirilemedi:', error)
      toast.error('Durum değiştirilemedi')
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditingBrand(null)
    setModalOpen(true)
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h2 className="text-2xl font-bold text-gray-800">Marka Yönetimi</h2>
          <p className="text-gray-600 mt-1">Tüm markaları görüntüle ve yönet</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-green-700 hover:bg-green-800 transition-all duration-200 hover:shadow-lg hover:scale-105 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Yeni Marka
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Toplam Marka</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{brands.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Aktif Markalar</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {brands.filter(b => b.is_active).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Marka ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {brand.logo_url ? (
                    <img 
                      src={brand.logo_url} 
                      alt={brand.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Tag className="text-green-700" size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{brand.name}</h3>
                  <p className="text-sm text-gray-500">{brand.slug}</p>
                </div>
              </div>
              <button
                onClick={() => toggleActive(brand.id.toString(), brand.is_active, brand.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                  brand.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand.is_active ? <Check size={12} /> : <X size={12} />}
                {brand.is_active ? 'Aktif' : 'Pasif'}
              </button>
            </div>

            {brand.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {brand.description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleEdit(brand)}
                className="flex-1 px-4 py-2 text-green-600 hover:bg-green-50 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Düzenle
              </button>
              <button
                onClick={() => deleteBrand(brand.id.toString(), brand.name)}
                className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Tag className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Marka bulunamadı</p>
        </div>
      )}

      {/* Brand Modal */}
      <BrandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveBrand}
        brand={editingBrand}
        loading={saving}
      />
    </div>
  )
}
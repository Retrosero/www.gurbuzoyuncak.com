import { useState, useRef, DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Loader2,
  GripVertical,
  DollarSign,
  Package,
  Tag,
  FileSpreadsheet
} from 'lucide-react'

interface ProductFormData {
  product_code: string
  barcode: string
  name: string
  slug: string
  description: string
  brand_id: string
  category_id: string
  base_price: string
  purchase_price: string
  campaign_price: string
  b2b_price: string
  wholesale_price: string
  tax_rate: string
  stock: string
  is_active: boolean
  is_featured: boolean
  video_type: 'youtube' | 'file' | ''
  video_url: string
}

interface ImageFile {
  id: string
  file: File
  preview: string
  order: number
}

interface DocumentFile {
  id: string
  file: File
  name: string
  size: number
  type: string
}

export default function AdminProductAdd() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [images, setImages] = useState<ImageFile[]>([])
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  const { formData, setFormData, clearSavedForm, hasSavedData } = useFormPersistence<ProductFormData>(
    'admin-product-form',
    {
      product_code: '',
      barcode: '',
      name: '',
      slug: '',
      description: '',
      brand_id: '',
      category_id: '',
      base_price: '',
      purchase_price: '',
      campaign_price: '',
      b2b_price: '',
      wholesale_price: '',
      tax_rate: '18',
      stock: '',
      is_active: true,
      is_featured: false,
      video_type: '',
      video_url: ''
    }
  )

  useState(() => {
    loadCategories()
    loadBrands()
  })

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (data) setCategories(data)
  }

  async function loadBrands() {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (data) setBrands(data)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = 10 - images.length

    if (files.length > remainingSlots) {
      toast.error(`En fazla ${remainingSlots} resim daha ekleyebilirsiniz (Toplam 10)`)
      return
    }

    const newImages: ImageFile[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      order: images.length + index
    }))

    setImages(prev => [...prev, ...newImages])
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const newDocuments: DocumentFile[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }))

    setDocuments(prev => [...prev, ...newDocuments])
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id)
      // Reorder
      return filtered.map((img, index) => ({ ...img, order: index }))
    })
  }

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  // Drag & Drop for image reordering
  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem === targetId) return

    setImages(prev => {
      const draggedIndex = prev.findIndex(img => img.id === draggedItem)
      const targetIndex = prev.findIndex(img => img.id === targetId)

      const newImages = [...prev]
      const [removed] = newImages.splice(draggedIndex, 1)
      newImages.splice(targetIndex, 0, removed)

      // Reorder
      return newImages.map((img, index) => ({ ...img, order: index }))
    })

    setDraggedItem(null)
  }

  const uploadImageToStorage = async (file: File, productId: number, order: number): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}/${Date.now()}-${order}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Resim yükleme hatası:', error)
      return null
    }
  }

  const uploadDocumentToStorage = async (file: File, productId: number): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}/${Date.now()}-${file.name}`
      const filePath = `product-documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Dosya yükleme hatası:', error)
      return null
    }
  }

  const validateForm = async (): Promise<boolean> => {
    if (!formData.name.trim()) {
      toast.error('Ürün adı zorunludur')
      return false
    }
    if (!formData.product_code.trim()) {
      toast.error('Ürün kodu zorunludur')
      return false
    }
    
    // Check if product code already exists
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('product_code', formData.product_code)
        .maybeSingle()
      
      if (error) {
        console.error('Error checking product code:', error)
      } else if (data) {
        toast.error('Bu ürün kodu zaten kullanımda. Lütfen farklı bir kod girin.')
        return false
      }
    } catch (error) {
      console.error('Product code validation error:', error)
    }
    
    if (!formData.category_id) {
      toast.error('Kategori seçiniz')
      return false
    }
    if (!formData.brand_id) {
      toast.error('Marka seçiniz')
      return false
    }
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      toast.error('Geçerli bir satış fiyatı giriniz')
      return false
    }
    if (images.length === 0) {
      toast.error('En az 1 ürün resmi yüklemelisiniz')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) return

    setLoading(true)
    try {
      // 1. Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          product_code: formData.product_code,
          barcode: formData.barcode || null,
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          brand_id: parseInt(formData.brand_id),
          category_id: parseInt(formData.category_id),
          base_price: parseFloat(formData.base_price),
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
          campaign_price: formData.campaign_price ? parseFloat(formData.campaign_price) : null,
          b2b_price: formData.b2b_price ? parseFloat(formData.b2b_price) : null,
          wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
          tax_rate: parseFloat(formData.tax_rate),
          stock: parseInt(formData.stock) || 0,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          video_type: formData.video_type || null,
          video_url: formData.video_url || null,
          has_video: !!formData.video_url
        }])
        .select()
        .single()

      if (productError) throw productError

      // 2. Upload images
      const imageUploadPromises = images.map(async (img) => {
        const publicUrl = await uploadImageToStorage(img.file, product.id, img.order)
        if (publicUrl) {
          return {
            product_id: product.id,
            image_url: publicUrl,
            order_index: img.order,
            is_primary: img.order === 0
          }
        }
        return null
      })

      const imageRecords = (await Promise.all(imageUploadPromises)).filter(Boolean)

      if (imageRecords.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords)

        if (imagesError) throw imagesError
      }

      // 3. Upload documents
      if (documents.length > 0) {
        const documentUploadPromises = documents.map(async (doc) => {
          const publicUrl = await uploadDocumentToStorage(doc.file, product.id)
          if (publicUrl) {
            return {
              product_id: product.id,
              file_url: publicUrl,
              file_name: doc.name,
              file_type: doc.type.includes('pdf') ? 'pdf' : 'excel',
              file_size: doc.size
            }
          }
          return null
        })

        const documentRecords = (await Promise.all(documentUploadPromises)).filter(Boolean)

        if (documentRecords.length > 0) {
          const { error: documentsError } = await supabase
            .from('product_files')
            .insert(documentRecords)

          if (documentsError) throw documentsError
        }
      }

      toast.success('Ürün başarıyla oluşturuldu!')
      clearSavedForm() // Form başarıyla kaydedildiğinde localStorage'ı temizle
      navigate('/admin/products')

    } catch (error: any) {
      console.error('Ürün oluşturma hatası:', error)
      toast.error(error.message || 'Ürün oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Ürünlere Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <p className="text-gray-600 mt-2">Modern ürün ekleme sistemi ile tüm detayları girin</p>
        </div>

        {/* Kaydedilmiş Form Verisi Bildirimi */}
        {hasSavedData && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-800 mb-1">
                  Kaydedilmiş form verisi bulundu
                </h3>
                <p className="text-sm text-green-700">
                  Daha önce yarım bıraktığınız form verileri otomatik olarak yüklendi. Devam edebilir veya formu temizleyerek baştan başlayabilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Kaydedilmiş form verileri silinecek. Emin misiniz?')) {
                    clearSavedForm()
                    toast.success('Form verileri temizlendi')
                  }
                }}
                className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Formu Temizle
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Package className="text-green-600" />
              Temel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Kodu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="product_code"
                  value={formData.product_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="ÖRN: TOY-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barkod
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="8690123456789"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="Ürün adını girin"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL (Slug)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="otomatik-olusur"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  required
                >
                  <option value="">Seçiniz</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marka <span className="text-red-500">*</span>
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  required
                >
                  <option value="">Seçiniz</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="Ürün açıklaması..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Miktarı
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KDV Oranı (%)
                </label>
                <input
                  type="number"
                  name="tax_rate"
                  value={formData.tax_rate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="18"
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Öne Çıkan</span>
                </label>
              </div>
            </div>
          </div>

          {/* Fiyatlandırma */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <DollarSign className="text-green-600" />
              Fiyatlandırma
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alış Fiyatı (Maliyet)
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Ürünün size maliyeti</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Normal Fiyat <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Standart satış fiyatı</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kampanya Fiyatı
                </label>
                <input
                  type="number"
                  name="campaign_price"
                  value={formData.campaign_price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">İndirimli fiyat (opsiyonel)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  B2B Fiyatı
                </label>
                <input
                  type="number"
                  name="b2b_price"
                  value={formData.b2b_price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">B2B müşteriler için</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toptan Fiyat
                </label>
                <input
                  type="number"
                  name="wholesale_price"
                  value={formData.wholesale_price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Toptan satış için</p>
              </div>
            </div>
          </div>

          {/* Resim Yükleme */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ImageIcon className="text-purple-600" />
              Ürün Resimleri <span className="text-sm font-normal text-gray-500">(En fazla 10 resim)</span>
            </h2>

            <div className="space-y-4">
              {/* Upload Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={images.length >= 10}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Upload size={20} />
                  Resim Yükle ({images.length}/10)
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Image Grid with Drag & Drop */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, img.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, img.id)}
                      className="relative group cursor-move border-2 border-gray-200 rounded-xl hover:border-purple-400 transition-colors"
                    >
                      <div className="aspect-square">
                        <img
                          src={img.preview}
                          alt={`Preview ${img.order + 1}`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      
                      {/* Order Badge */}
                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {img.order + 1}
                      </div>

                      {/* Primary Badge */}
                      {img.order === 0 && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                          ANA
                        </div>
                      )}

                      {/* Drag Handle */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-40 rounded-xl transition-opacity">
                        <GripVertical className="text-white" size={32} />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500 text-center">
                İpucu: Resimlerin sırasını değiştirmek için sürükleyip bırakın. İlk resim ana resim olarak kullanılır.
              </p>
            </div>
          </div>

          {/* Dosya Ekleme (PDF/EXCEL) */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileSpreadsheet className="text-orange-600" />
              İndirilebilir Dosyalar (PDF/Excel)
            </h2>

            <div className="space-y-4">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => documentInputRef.current?.click()}
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 flex items-center gap-2"
                >
                  <Upload size={20} />
                  Dosya Yükle
                </button>
                <input
                  ref={documentInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.doc,.docx"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-orange-600" size={24} />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Tag className="text-red-600" />
              Video (Opsiyonel)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Tipi
                </label>
                <select
                  name="video_type"
                  value={formData.video_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                >
                  <option value="">Yok</option>
                  <option value="youtube">YouTube</option>
                  <option value="file">Dosya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="text"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out hover:shadow-md hover:border-green-500/50 focus:shadow-lg"
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={!formData.video_type}
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Form verileri temizlenecek ve varsayılan değerlere dönülecek. Emin misiniz?')) {
                  clearSavedForm()
                  toast.success('Form temizlendi')
                }
              }}
              className="px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              disabled={loading}
            >
              Formu Temizle
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Package size={20} />
                    Ürünü Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

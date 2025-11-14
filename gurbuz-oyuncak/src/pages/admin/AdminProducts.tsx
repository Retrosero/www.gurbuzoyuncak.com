import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Product, Category, Brand } from '@/types'
import { Plus, Edit, Trash2, Eye, Upload, X, CheckSquare, Square, MoreHorizontal, Tag, Package, DollarSign, ToggleLeft, ToggleRight, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ProductFormData {
  product_code: string
  barcode: string
  name: string
  slug: string
  description: string
  brand_id: string
  category_id: string
  base_price: string
  tax_rate: string
  stock: string
  is_active: boolean
  is_featured: boolean
  video_type: 'youtube' | 'file' | ''
  video_url: string
}

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    recentProducts: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  
  // Bulk operations states
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkOperationType, setBulkOperationType] = useState<'edit' | 'delete' | null>(null)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{ total: number; processed: number; current: number; operationName: string }>({
    total: 0,
    processed: 0,
    current: 0,
    operationName: ''
  })
  const [showBulkProgress, setShowBulkProgress] = useState(false)
  const [showAuditLog, setShowAuditLog] = useState(false)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  
  // Bulk edit form data
  const [bulkEditData, setBulkEditData] = useState({
    category_id: '',
    brand_id: '',
    is_active: null as boolean | null,
    base_price: '',
    price_percentage: '', // for percentage increase/decrease
    stock: '',
    stock_operation: 'set' as 'set' | 'add' | 'subtract',
    tax_rate: '',
  })
  
  const [formData, setFormData] = useState<ProductFormData>({
    product_code: '',
    barcode: '',
    name: '',
    slug: '',
    description: '',
    brand_id: '',
    category_id: '',
    base_price: '',
    tax_rate: '18',
    stock: '',
    is_active: true,
    is_featured: false,
    video_type: '',
    video_url: ''
  })
  const [errors, setErrors] = useState<Partial<ProductFormData>>({})

  useEffect(() => {
    loadData()
    loadStats()
    loadAuditLogs()
  }, [])

  async function loadStats() {
    try {
      setStatsLoading(true)
      
      // Toplam ürün sayısı
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      // Aktif ürünler
      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      
      // Pasif ürünler
      const { count: inactiveProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', false)
      
      // Kritik stok (< 10)
      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 10)
        .gt('stock', 0)
      
      // Stok bitti
      const { count: outOfStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('stock', 0)
      
      // Son 7 günde eklenen
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: recentProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())
      
      setStats({
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        inactiveProducts: inactiveProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        outOfStockProducts: outOfStockProducts || 0,
        recentProducts: recentProducts || 0
      })
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error)
      toast.error('İstatistikler yüklenirken hata oluştu')
    } finally {
      setStatsLoading(false)
    }
  }

  async function loadData() {
    try {
      setLoading(true)
      const [productsResult, categoriesResult, brandsResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name')
      ])

      if (productsResult.data) setProducts(productsResult.data)
      if (categoriesResult.data) setCategories(categoriesResult.data)
      if (brandsResult.data) setBrands(brandsResult.data)
    } catch (error) {
      console.error('Veriler yüklenemedi:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function loadAuditLogs() {
    try {
      setLoadingAudit(true)
      const { data, error } = await supabase
        .from('bulk_operations_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setAuditLogs(data || [])
    } catch (error: any) {
      console.error('Audit log yüklenemedi:', error)
      toast.error('Audit log yüklenirken hata oluştu')
    } finally {
      setLoadingAudit(false)
    }
  }

  // Bulk operations functions
  function toggleProductSelection(productId: number) {
    const newSelection = new Set(selectedProducts)
    if (newSelection.has(productId)) {
      newSelection.delete(productId)
    } else {
      newSelection.add(productId)
    }
    setSelectedProducts(newSelection)
  }

  function toggleSelectAll() {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)))
    }
  }

  function openBulkEditModal() {
    if (selectedProducts.size === 0) {
      toast.error('Lütfen en az bir ürün seçin')
      return
    }
    setBulkEditData({
      category_id: '',
      brand_id: '',
      is_active: null,
      base_price: '',
      price_percentage: '',
      stock: '',
      stock_operation: 'set',
      tax_rate: '',
    })
    setBulkOperationType('edit')
    setShowBulkModal(true)
  }

  function openBulkDeleteModal() {
    if (selectedProducts.size === 0) {
      toast.error('Lütfen en az bir ürün seçin')
      return
    }
    setBulkOperationType('delete')
    setShowBulkModal(true)
  }

  async function logBulkOperation(operationType: string, totalRecords: number, operationDetails: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('bulk_operations_log')
        .insert([{
          operation_type: operationType,
          total_records: totalRecords,
          processed_records: 0,
          failed_records: 0,
          status: 'processing',
          operation_details: operationDetails,
          performed_by: user?.id || null
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Audit log kaydedilemedi:', error)
      return null
    }
  }

  async function updateBulkOperationProgress(logId: number, processedRecords: number, failedRecords: number, status: string, errorDetails: any = null) {
    try {
      const updateData: any = {
        processed_records: processedRecords,
        failed_records: failedRecords,
        status: status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'completed' || status === 'failed') {
        updateData.completed_at = new Date().toISOString()
      }

      if (errorDetails) {
        updateData.error_details = errorDetails
      }

      await supabase
        .from('bulk_operations_log')
        .update(updateData)
        .eq('id', logId)
    } catch (error: any) {
      console.error('Audit log güncellenemedi:', error)
    }
  }

  async function performBulkEdit() {
    if (selectedProducts.size === 0) return
    
    const productIds = Array.from(selectedProducts)
    const logId = await logBulkOperation('bulk_update', productIds.length, bulkEditData)
    
    if (!logId) {
      toast.error('İşlem logu oluşturulamadı')
      return
    }

    setBulkProcessing(true)
    setBulkProgress({
      total: productIds.length,
      processed: 0,
      current: 0,
      operationName: 'Toplu Düzenleme'
    })
    setShowBulkProgress(true)

    let processed = 0
    let failed = 0
    const errors: string[] = []

    try {
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i]
        setBulkProgress(prev => ({ ...prev, current: i + 1 }))

        try {
          const updateData: any = {}
          
          // Set new values if provided
          if (bulkEditData.category_id) updateData.category_id = parseInt(bulkEditData.category_id)
          if (bulkEditData.brand_id) updateData.brand_id = parseInt(bulkEditData.brand_id)
          if (bulkEditData.is_active !== null) updateData.is_active = bulkEditData.is_active
          if (bulkEditData.tax_rate) updateData.tax_rate = parseFloat(bulkEditData.tax_rate)

          // Handle price updates
          if (bulkEditData.base_price) {
            updateData.base_price = parseFloat(bulkEditData.base_price)
          } else if (bulkEditData.price_percentage) {
            // Get current price and apply percentage
            const product = products.find(p => p.id === productId)
            if (product) {
              const percentage = parseFloat(bulkEditData.price_percentage)
              updateData.base_price = product.base_price * (1 + percentage / 100)
            }
          }

          // Handle stock updates
          if (bulkEditData.stock) {
            const newStock = parseInt(bulkEditData.stock)
            if (bulkEditData.stock_operation === 'add') {
              const product = products.find(p => p.id === productId)
              updateData.stock = product ? product.stock + newStock : newStock
            } else if (bulkEditData.stock_operation === 'subtract') {
              const product = products.find(p => p.id === productId)
              updateData.stock = product ? Math.max(0, product.stock - newStock) : 0
            } else {
              updateData.stock = newStock
            }
          }

          const { error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId)

          if (error) throw error
          processed++
        } catch (error: any) {
          console.error(`Ürün ${productId} güncellenemedi:`, error)
          errors.push(`Ürün ${productId}: ${error.message}`)
          failed++
        }

        setBulkProgress(prev => ({ ...prev, processed }))
        
        // Add small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      await updateBulkOperationProgress(logId.id, processed, failed, failed > 0 ? 'completed' : 'completed', { errors })
      
      if (failed === 0) {
        toast.success(`${processed} ürün başarıyla güncellendi`)
      } else {
        toast.error(`${processed} ürün güncellendi, ${failed} üründe hata oluştu`)
        console.error('Bulk edit errors:', errors)
      }

      setShowBulkModal(false)
      setSelectedProducts(new Set())
      loadData()
      loadAuditLogs()
    } catch (error: any) {
      await updateBulkOperationProgress(logId.id, processed, failed, 'failed', { general_error: error.message })
      toast.error('Toplu düzenleme sırasında hata oluştu')
    } finally {
      setBulkProcessing(false)
      setShowBulkProgress(false)
    }
  }

  async function performBulkDelete() {
    if (selectedProducts.size === 0) return
    
    const productIds = Array.from(selectedProducts)
    const logId = await logBulkOperation('bulk_delete', productIds.length, {})
    
    if (!logId) {
      toast.error('İşlem logu oluşturulamadı')
      return
    }

    setBulkProcessing(true)
    setBulkProgress({
      total: productIds.length,
      processed: 0,
      current: 0,
      operationName: 'Toplu Silme'
    })
    setShowBulkProgress(true)

    let processed = 0
    let failed = 0
    const errors: string[] = []

    try {
      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i]
        setBulkProgress(prev => ({ ...prev, current: i + 1 }))

        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)

          if (error) throw error
          processed++
        } catch (error: any) {
          console.error(`Ürün ${productId} silinemedi:`, error)
          errors.push(`Ürün ${productId}: ${error.message}`)
          failed++
        }

        setBulkProgress(prev => ({ ...prev, processed }))
        
        // Add small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      await updateBulkOperationProgress(logId.id, processed, failed, failed > 0 ? 'completed' : 'completed', { errors })
      
      if (failed === 0) {
        toast.success(`${processed} ürün başarıyla silindi`)
      } else {
        toast.error(`${processed} ürün silindi, ${failed} üründe hata oluştu`)
        console.error('Bulk delete errors:', errors)
      }

      setShowBulkModal(false)
      setSelectedProducts(new Set())
      loadData()
      loadAuditLogs()
    } catch (error: any) {
      await updateBulkOperationProgress(logId.id, processed, failed, 'failed', { general_error: error.message })
      toast.error('Toplu silme sırasında hata oluştu')
    } finally {
      setBulkProcessing(false)
      setShowBulkProgress(false)
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(products.filter(p => p.id !== id))
      toast.success('Ürün başarıyla silindi')
    } catch (error: any) {
      console.error('Ürün silinemedi:', error)
      toast.error('Ürün silinirken hata oluştu: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(product: Product) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)

      if (error) throw error

      setProducts(products.map(p =>
        p.id === product.id ? { ...p, is_active: !product.is_active } : p
      ))
      toast.success(`Ürün ${!product.is_active ? 'aktifleştirildi' : 'pasifleştirildi'}`)
    } catch (error: any) {
      console.error('Ürün durumu güncellenemedi:', error)
      toast.error('Ürün durumu güncellenirken hata oluştu: ' + error.message)
    }
  }

  // Form functions
  function resetForm() {
    setFormData({
      product_code: '',
      barcode: '',
      name: '',
      slug: '',
      description: '',
      brand_id: '',
      category_id: '',
      base_price: '',
      tax_rate: '18',
      stock: '',
      is_active: true,
      is_featured: false,
      video_type: '',
      video_url: ''
    })
    setErrors({})
  }

  function openAddModal() {
    resetForm()
    setShowAddModal(true)
  }

  function openEditModal(product: Product) {
    setFormData({
      product_code: product.product_code,
      barcode: product.barcode || '',
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      brand_id: product.brand_id?.toString() || '',
      category_id: product.category_id?.toString() || '',
      base_price: product.base_price.toString(),
      tax_rate: product.tax_rate.toString(),
      stock: product.stock.toString(),
      is_active: product.is_active,
      is_featured: product.is_featured,
      video_type: product.video_type || '',
      video_url: product.video_url || ''
    })
    setEditingProduct(product)
    setShowEditModal(true)
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleInputChange(field: keyof ProductFormData, value: string | boolean) {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug when name changes
    if (field === 'name') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value as string) }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  function validateForm(): boolean {
    const newErrors: Partial<ProductFormData> = {}

    if (!formData.product_code.trim()) {
      newErrors.product_code = 'Ürün kodu gerekli'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gerekli'
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug gerekli'
    }
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = 'Geçerli bir fiyat gerekli'
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Geçerli bir stok miktarı gerekli'
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Kategori seçimi gerekli'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Lütfen form hatalarını düzeltin')
      return
    }

    try {
      setSubmitting(true)
      
      const productData = {
        product_code: formData.product_code,
        barcode: formData.barcode || null,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        category_id: parseInt(formData.category_id),
        base_price: parseFloat(formData.base_price),
        tax_rate: parseFloat(formData.tax_rate),
        stock: parseInt(formData.stock),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        video_type: formData.video_type || null,
        video_url: formData.video_url || null,
        has_video: !!formData.video_url,
        view_count: editingProduct?.view_count || 0
      }

      let result
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
      } else {
        result = await supabase
          .from('products')
          .insert([productData])
      }

      if (result.error) throw result.error

      toast.success(`Ürün başarıyla ${editingProduct ? 'güncellendi' : 'eklendi'}`)
      setShowAddModal(false)
      setShowEditModal(false)
      setEditingProduct(null)
      resetForm()
      loadData() // Refresh data
    } catch (error: any) {
      console.error('Ürün kaydedilemedi:', error)
      toast.error('Ürün kaydedilirken hata oluştu: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function uploadImage(file: File, productId: number) {
    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}_${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('product_images')
        .insert([
          {
            product_id: productId,
            image_url: publicUrl,
            order_index: 0,
            is_primary: true
          }
        ])

      if (dbError) throw dbError

      toast.success('Resim başarıyla yüklendi')
      return publicUrl
    } catch (error: any) {
      console.error('Resim yüklenemedi:', error)
      toast.error('Resim yüklenirken hata oluştu: ' + error.message)
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const ProductFormModal = ({ isOpen, onClose, product }: { 
    isOpen: boolean
    onClose: () => void
    product?: Product | null 
  }) => {
    if (!isOpen) return null

    const isEdit = !!product
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Create temporary product for image upload
      if (!isEdit) {
        toast.error('Önce ürünü kaydetmelisiniz')
        return
      }

      await uploadImage(file, product.id)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Kodu *
                </label>
                <input
                  type="text"
                  value={formData.product_code}
                  onChange={(e) => handleInputChange('product_code', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    errors.product_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="örn: URN001"
                />
                {errors.product_code && (
                  <p className="text-red-500 text-sm mt-1">{errors.product_code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barkod
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  placeholder="Opsiyonel"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ürün adını girin"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="urun-adi"
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                placeholder="Ürün açıklaması"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    errors.category_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marka
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => handleInputChange('brand_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">Marka seçin</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (TL) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => handleInputChange('base_price', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    errors.base_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.base_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KDV Oranı (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => handleInputChange('tax_rate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  placeholder="18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Tipi
                </label>
                <select
                  value={formData.video_type}
                  onChange={(e) => handleInputChange('video_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="">Video yok</option>
                  <option value="youtube">YouTube</option>
                  <option value="file">Dosya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Aktif</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Öne Çıkan</span>
              </label>
            </div>

            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Resmi
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadingImage ? 'Yükleniyor...' : 'Resim seçin veya sürükleyin'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF formatları desteklenir
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-700 text-white rounded-xl hover:bg-green-800 disabled:opacity-50"
              >
                {submitting ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Ekle')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white py-6 transition-all duration-200">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
        </div>
      </div>

      {/* Dashboard İstatistikleri */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Toplam Ürün */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Toplam Ürün</p>
                <p className="text-3xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.totalProducts}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full transition-all duration-200">
                <Package size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Aktif Ürünler */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Aktif Ürünler</p>
                <p className="text-3xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.activeProducts}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full transition-all duration-200">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Pasif Ürünler */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Pasif Ürünler</p>
                <p className="text-3xl font-bold text-gray-600">
                  {statsLoading ? '...' : stats.inactiveProducts}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full transition-all duration-200">
                <XCircle size={24} className="text-gray-600" />
              </div>
            </div>
          </div>

          {/* Kritik Stok */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Kritik Stok</p>
                <p className="text-sm text-gray-500">(Stok &lt; 10)</p>
                <p className="text-3xl font-bold text-red-600">
                  {statsLoading ? '...' : stats.lowStockProducts}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full transition-all duration-200">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          {/* Stok Bitti */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Stok Bitti</p>
                <p className="text-sm text-gray-500">(Stok = 0)</p>
                <p className="text-3xl font-bold text-orange-600">
                  {statsLoading ? '...' : stats.outOfStockProducts}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full transition-all duration-200">
                <XCircle size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          {/* Son 7 Günde Eklenen */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Son 7 Günde Eklenen</p>
                <p className="text-3xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.recentProducts}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full transition-all duration-200">
                <Clock size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Ürünler ({products.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  loadData()
                  loadStats()
                  loadAuditLogs()
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 hover:shadow-md"
                disabled={loading || statsLoading}
              >
                <RefreshCw size={20} className={loading || statsLoading ? 'animate-spin' : ''} />
                Yenile
              </button>
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="bg-gray-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 hover:shadow-md"
              >
                <MoreHorizontal size={20} />
                Audit Log
              </button>
              <button
                onClick={() => navigate('/admin/urunler/yeni')}
                className="bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-800 disabled:opacity-50 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Plus size={20} />
                Yeni Ürün
              </button>
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedProducts.size > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 transition-all duration-200 hover:shadow-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-green-800 font-medium">
                    {selectedProducts.size} ürün seçili
                  </span>
                  <button
                    onClick={() => setSelectedProducts(new Set())}
                    className="text-green-600 hover:text-green-800 text-sm underline"
                  >
                    Seçimi temizle
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openBulkEditModal}
                    className="bg-yellow-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-yellow-700 flex items-center gap-1 transition-all duration-200 hover:shadow-md"
                  >
                    <Edit size={16} />
                    Düzenle
                  </button>
                  <button
                    onClick={openBulkDeleteModal}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-red-700 flex items-center gap-1 transition-all duration-200 hover:shadow-md"
                  >
                    <Trash2 size={16} />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Log Panel */}
          {showAuditLog && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 transition-all duration-200 hover:shadow-md">
              <h3 className="text-lg font-semibold mb-3">Audit Log</h3>
              {loadingAudit ? (
                <p>Audit log yükleniyor...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Tarih</th>
                        <th className="text-left p-2">İşlem</th>
                        <th className="text-left p-2">Kayıt Sayısı</th>
                        <th className="text-left p-2">Başarılı</th>
                        <th className="text-left p-2">Başarısız</th>
                        <th className="text-left p-2">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id} className="border-b">
                          <td className="p-2">
                            {new Date(log.created_at).toLocaleString('tr-TR')}
                          </td>
                          <td className="p-2">
                            {log.operation_type === 'bulk_update' ? 'Toplu Güncelleme' : 
                             log.operation_type === 'bulk_delete' ? 'Toplu Silme' : log.operation_type}
                          </td>
                          <td className="p-2">{log.total_records}</td>
                          <td className="p-2 text-green-600">{log.processed_records}</td>
                          <td className="p-2 text-red-600">{log.failed_records}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-xl text-xs transition-all duration-200 ${
                              log.status === 'completed' ? 'bg-green-100 text-green-800' :
                              log.status === 'failed' ? 'bg-red-100 text-red-800' :
                              log.status === 'processing' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.status === 'completed' ? 'Tamamlandı' :
                               log.status === 'failed' ? 'Başarısız' :
                               log.status === 'processing' ? 'İşleniyor' : log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 w-12">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {selectedProducts.size === products.length && products.length > 0 ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-3">Kod</th>
                  <th className="text-left p-3">Ürün Adı</th>
                  <th className="text-left p-3">Fiyat</th>
                  <th className="text-left p-3">Stok</th>
                  <th className="text-left p-3">Durum</th>
                  <th className="text-right p-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const price = product.base_price * (1 + product.tax_rate / 100)
                  return (
                    <tr key={product.id} className={`border-b hover:bg-gray-50 ${selectedProducts.has(product.id) ? 'bg-green-50' : ''}`}>
                      <td className="p-3">
                        <button
                          onClick={() => toggleProductSelection(product.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          {selectedProducts.has(product.id) ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-mono text-sm">{product.product_code}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          {product.is_featured && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Öne Çıkan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{price.toFixed(2)} TL</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : product.stock <= 5
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : product.stock <= 10
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : product.stock > 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {product.stock}
                          {product.stock <= 10 && (
                            <span className="ml-1 text-xs">
                              {product.stock === 0 ? '(Tükendi)' : 
                               product.stock <= 5 ? '(Kritik)' : '(Düşük)'}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`px-3 py-1 rounded text-sm ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.is_active ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => window.open(`/urun/${product.slug}`, '_blank')}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Görüntüle"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-gray-600 hover:text-gray-800 p-1"
                            title="Düzenle"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Henüz ürün bulunmuyor. "Yeni Ürün" butonuna tıklayarak ürün ekleyebilirsiniz.
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <ProductFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Product Modal */}
      <ProductFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
      />

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {bulkOperationType === 'edit' ? 'Toplu Ürün Düzenleme' : 'Toplu Ürün Silme'}
              </h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={bulkProcessing}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {bulkOperationType === 'delete' ? (
                <div>
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="text-red-800 font-semibold mb-2">Uyarı!</h3>
                    <p className="text-red-700">
                      {selectedProducts.size} ürünü silmek üzeresiniz. Bu işlem geri alınamaz!
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowBulkModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
                      disabled={bulkProcessing}
                    >
                      İptal
                    </button>
                    <button
                      onClick={performBulkDelete}
                      disabled={bulkProcessing}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                    >
                      {bulkProcessing ? 'Siliniyor...' : 'Evet, Sil'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-gray-600 mb-4">
                      Seçili ürünler için toplu düzenleme yapacaksınız. Boş bırakılan alanlar değişmeyecektir.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Category & Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kategori
                        </label>
                        <select
                          value={bulkEditData.category_id}
                          onChange={(e) => setBulkEditData(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                        >
                          <option value="">Değiştirme</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marka
                        </label>
                        <select
                          value={bulkEditData.brand_id}
                          onChange={(e) => setBulkEditData(prev => ({ ...prev, brand_id: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                        >
                          <option value="">Değiştirme</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durum
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBulkEditData(prev => ({ ...prev, is_active: true }))}
                          className={`px-3 py-2 rounded text-sm ${
                            bulkEditData.is_active === true
                              ? 'bg-green-100 text-green-800 border-2 border-green-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                          }`}
                        >
                          <ToggleLeft size={16} className="inline mr-1" />
                          Aktif
                        </button>
                        <button
                          onClick={() => setBulkEditData(prev => ({ ...prev, is_active: false }))}
                          className={`px-3 py-2 rounded text-sm ${
                            bulkEditData.is_active === false
                              ? 'bg-red-100 text-red-800 border-2 border-red-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                          }`}
                        >
                          <ToggleRight size={16} className="inline mr-1" />
                          Pasif
                        </button>
                        <button
                          onClick={() => setBulkEditData(prev => ({ ...prev, is_active: null }))}
                          className={`px-3 py-2 rounded text-sm ${
                            bulkEditData.is_active === null
                              ? 'bg-green-100 text-green-800 border-2 border-green-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                          }`}
                        >
                          Değiştirme
                        </button>
                      </div>
                    </div>

                    {/* Price Updates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Yeni Fiyat (TL)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={bulkEditData.base_price}
                          onChange={(e) => setBulkEditData(prev => ({ ...prev, base_price: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                          placeholder="Boş bırakılırsa değişmez"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fiyat Değişimi (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={bulkEditData.price_percentage}
                          onChange={(e) => setBulkEditData(prev => ({ ...prev, price_percentage: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                          placeholder="örn: 10 (artış), -5 (azalış)"
                        />
                      </div>
                    </div>

                    {/* Stock Updates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stok İşlemi
                        </label>
                        <select
                          value={bulkEditData.stock_operation}
                          onChange={(e) => setBulkEditData(prev => ({ ...prev, stock_operation: e.target.value as 'set' | 'add' | 'subtract' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                        >
                          <option value="set">Ayarla</option>
                          <option value="add">Ekle</option>
                          <option value="subtract">Çıkar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stok Miktarı
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={bulkEditData.stock}
                          onChange={(e) => setBulkEditData(prev => ({ ...prev, stock: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                          placeholder="Miktar"
                        />
                      </div>
                    </div>

                    {/* Tax Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        KDV Oranı (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={bulkEditData.tax_rate}
                        onChange={(e) => setBulkEditData(prev => ({ ...prev, tax_rate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                        placeholder="Boş bırakılırsa değişmez"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                    <button
                      onClick={() => setShowBulkModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
                      disabled={bulkProcessing}
                    >
                      İptal
                    </button>
                    <button
                      onClick={performBulkEdit}
                      disabled={bulkProcessing}
                      className="px-4 py-2 bg-green-700 text-white rounded-xl hover:bg-green-800 disabled:opacity-50"
                    >
                      {bulkProcessing ? 'Güncelleniyor...' : 'Güncelle'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Progress Modal */}
      {showBulkProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">{bulkProgress.operationName}</h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>İşlenen</span>
                <span>{bulkProgress.processed} / {bulkProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${(bulkProgress.processed / bulkProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Şu anda işleniyor: {bulkProgress.current}. ürün</p>
              {bulkProcessing && (
                <div className="mt-2 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  İşleniyor...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
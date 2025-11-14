import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Percent, 
  ShoppingCart, 
  Filter,
  Eye,
  Play,
  Pause,
  Zap,
  Package,
  Tag,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar as CalendarIcon } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface BulkDiscount {
  id: number
  name: string
  description: string
  discount_type: string
  discount_value: number
  x_value?: number
  y_value?: number
  target_type: string
  target_categories?: number[]
  target_brands?: number[]
  target_products?: number[]
  min_price?: number
  max_price?: number
  start_date: string
  end_date?: string
  is_scheduled: boolean
  scheduled_for?: string
  is_active: boolean
  priority: number
  max_usage_limit?: number
  current_usage_count: number
  stackable: boolean
  min_order_amount?: number
  max_discount_amount?: number
  preview_mode: boolean
  preview_affected_products?: number[]
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  slug: string
  is_active: boolean
}

interface Brand {
  id: number
  name: string
  slug: string
  is_active: boolean
}

interface Product {
  id: number
  name: string
  product_code: string
  price: number
  is_active: boolean
}

interface DiscountStats {
  total_applications: number
  total_discount_amount: number
  affected_products_count: number
  last_applied_at?: string
}

// Form şeması
const bulkDiscountSchema = z.object({
  name: z.string().min(1, 'İndirim adı zorunludur'),
  description: z.string().min(1, 'Açıklama zorunludur'),
  discount_type: z.enum(['percentage', 'fixed', 'x_for_y']),
  discount_value: z.number().min(0, 'İndirim değeri 0\'dan büyük olmalıdır'),
  x_value: z.number().min(1).optional(),
  y_value: z.number().min(1).optional(),
  target_type: z.enum(['all', 'category', 'brand', 'products', 'price_range']),
  target_categories: z.array(z.number()).optional(),
  target_brands: z.array(z.number()).optional(),
  target_products: z.array(z.number()).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  start_date: z.date({ required_error: 'Başlangıç tarihi zorunludur' }),
  end_date: z.date().optional(),
  is_scheduled: z.boolean().default(false),
  scheduled_for: z.date().optional(),
  priority: z.number().min(1, 'Öncelik 1\'den büyük olmalıdır'),
  max_usage_limit: z.number().min(0).optional(),
  stackable: z.boolean().default(false),
  min_order_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().min(0).optional(),
}).refine((data) => {
  if (data.end_date && data.end_date <= data.start_date) {
    return false;
  }
  if (data.scheduled_for && data.scheduled_for <= data.start_date) {
    return false;
  }
  if (data.discount_type === 'x_for_y' && (!data.x_value || !data.y_value)) {
    return false;
  }
  return true;
}, {
  message: 'Tarih kontrollerini düzeltin',
  path: ['end_date'],
});

type BulkDiscountFormData = z.infer<typeof bulkDiscountSchema>

export default function AdminBulkDiscounts() {
  const [bulkDiscounts, setBulkDiscounts] = useState<BulkDiscount[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<{[key: number]: DiscountStats}>({})
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<BulkDiscount | null>(null)
  const [previewingDiscount, setPreviewingDiscount] = useState<BulkDiscount | null>(null)
  const [previewResults, setPreviewResults] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const form = useForm<BulkDiscountFormData>({
    resolver: zodResolver(bulkDiscountSchema),
    defaultValues: {
      discount_type: 'percentage',
      target_type: 'all',
      discount_value: 0,
      priority: 1,
      is_scheduled: false,
      stackable: false,
    },
  })

  const watchDiscountType = form.watch('discount_type')
  const watchTargetType = form.watch('target_type')

  // Veri yükleme fonksiyonları
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    }
  }, [])

  const fetchBrands = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setBrands(data || [])
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, product_code, price, is_active')
        .eq('is_active', true)
        .order('name')
        .limit(200)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error)
    }
  }, [])

  const fetchBulkDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_discount_summary')
        .select('*')

      if (error) throw error
      setBulkDiscounts(data || [])
    } catch (error) {
      console.error('Bulk discountlar yüklenirken hata:', error)
      toast.error('İndirimler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (discountId: number) => {
    try {
      const { data, error } = await supabase
        .from('bulk_discount_stats')
        .select('*')
        .eq('bulk_discount_id', discountId)
        .single()

      if (error) throw error
      setStats(prev => ({ ...prev, [discountId]: data }))
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error)
    }
  }

  useEffect(() => {
    fetchBulkDiscounts()
    fetchCategories()
    fetchBrands()
    fetchProducts()
  }, [])

  // Form gönderimi
  const onSubmit = async (data: BulkDiscountFormData) => {
    setIsSubmitting(true)
    
    try {
      const discountData = {
        ...data,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date?.toISOString(),
        scheduled_for: data.scheduled_for?.toISOString(),
      }

      if (editingDiscount) {
        const { error } = await supabase
          .from('bulk_discounts')
          .update(discountData)
          .eq('id', editingDiscount.id)

        if (error) throw error
        
        toast.success('Toplu indirim başarıyla güncellendi')
        setIsEditModalOpen(false)
        setEditingDiscount(null)
      } else {
        const { error } = await supabase
          .from('bulk_discounts')
          .insert([{
            ...discountData,
            current_usage_count: 0,
          }])

        if (error) throw error
        
        toast.success('Toplu indirim başarıyla oluşturuldu')
        setIsCreateModalOpen(false)
      }

      form.reset()
      setCurrentStep(1)
      fetchBulkDiscounts()
    } catch (error) {
      console.error('Bulk discount kaydedilirken hata:', error)
      toast.error('İndirim kaydedilirken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  // İndirim uygulama fonksiyonu
  const applyDiscount = async (discountId: number) => {
    try {
      const { data, error } = await supabase
        .rpc('apply_bulk_discount', { discount_id: discountId })

      if (error) throw error
      
      toast.success(data.message || 'İndirim başarıyla uygulandı')
      fetchBulkDiscounts()
      fetchStats(discountId)
    } catch (error) {
      console.error('İndirim uygulanırken hata:', error)
      toast.error('İndirim uygulanırken bir hata oluştu')
    }
  }

  // İndirim kaldırma fonksiyonu
  const removeDiscount = async (discountId: number) => {
    try {
      const { data, error } = await supabase
        .rpc('remove_bulk_discount', { discount_id: discountId })

      if (error) throw error
      
      toast.success(data.message || 'İndirim başarıyla kaldırıldı')
      fetchBulkDiscounts()
      fetchStats(discountId)
    } catch (error) {
      console.error('İndirim kaldırılırken hata:', error)
      toast.error('İndirim kaldırılırken bir hata oluştu')
    }
  }

  // Önizleme fonksiyonu
  const previewDiscount = async (discount: BulkDiscount) => {
    setPreviewingDiscount(discount)
    setIsPreviewModalOpen(true)
    
    try {
      // Önizleme için geçici bir discount oluştur
      const previewData = {
        ...discount,
        preview_mode: true
      }
      
      const { data, error } = await supabase
        .from('bulk_discounts')
        .insert([previewData])
        .select()
        .single()

      if (error) throw error
      
      // Önizleme sonuçlarını al
      const { data: previewResult } = await supabase
        .rpc('apply_bulk_discount', { discount_id: data.id })
      
      setPreviewResults(previewResult)
      
      // Geçici discountu sil
      await supabase
        .from('bulk_discounts')
        .delete()
        .eq('id', data.id)
        
    } catch (error) {
      console.error('Önizleme yapılırken hata:', error)
      toast.error('Önizleme yapılırken bir hata oluştu')
    }
  }

  // Düzenleme modalını açma
  const handleEdit = (discount: BulkDiscount) => {
    setEditingDiscount(discount)
    form.reset({
      name: discount.name,
      description: discount.description,
      discount_type: discount.discount_type as any,
      discount_value: discount.discount_value,
      x_value: discount.x_value,
      y_value: discount.y_value,
      target_type: discount.target_type as any,
      target_categories: discount.target_categories || [],
      target_brands: discount.target_brands || [],
      target_products: discount.target_products || [],
      min_price: discount.min_price || 0,
      max_price: discount.max_price || 0,
      start_date: new Date(discount.start_date),
      end_date: discount.end_date ? new Date(discount.end_date) : undefined,
      is_scheduled: discount.is_scheduled,
      scheduled_for: discount.scheduled_for ? new Date(discount.scheduled_for) : undefined,
      priority: discount.priority,
      max_usage_limit: discount.max_usage_limit || 0,
      stackable: discount.stackable,
      min_order_amount: discount.min_order_amount || 0,
      max_discount_amount: discount.max_discount_amount || 0,
    })
    setIsEditModalOpen(true)
  }

  // Yeni discount oluşturma
  const handleCreate = () => {
    setEditingDiscount(null)
    form.reset({
      discount_type: 'percentage',
      target_type: 'all',
      discount_value: 0,
      priority: 1,
      is_scheduled: false,
      stackable: false,
    })
    setCurrentStep(1)
    setIsCreateModalOpen(true)
  }

  // Durum değiştirme
  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('bulk_discounts')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchBulkDiscounts()
      toast.success(`İndirim ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi`)
    } catch (error) {
      console.error('İndirim durumu güncellenirken hata:', error)
      toast.error('İndirim durumu güncellenirken bir hata oluştu')
    }
  }

  // Silme
  const deleteDiscount = async (id: number) => {
    if (!confirm('Bu toplu indirimi silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('bulk_discounts')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchBulkDiscounts()
      toast.success('Toplu indirim başarıyla silindi')
    } catch (error) {
      console.error('İndirim silinirken hata:', error)
      toast.error('İndirim silinirken bir hata oluştu')
    }
  }

  // Yardımcı fonksiyonlar
  const getDiscountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      percentage: 'Yüzde İndirimi',
      fixed: 'Sabit Tutar İndirimi',
      x_for_y: 'X Al Y Öde'
    }
    return labels[type] || type
  }

  const getTargetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      all: 'Tüm Ürünler',
      category: 'Kategori Bazlı',
      brand: 'Marka Bazlı',
      products: 'Seçili Ürünler',
      price_range: 'Fiyat Aralığı'
    }
    return labels[type] || type
  }

  const formatDiscountValue = (value: number, type: string, xValue?: number, yValue?: number) => {
    if (type === 'percentage') {
      return `%${value}`
    } else if (type === 'fixed') {
      return `₺${value.toFixed(2)}`
    } else if (type === 'x_for_y') {
      return `${xValue} Al ${yValue} Öde`
    }
    return value.toString()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Toplu İndirim Yönetimi</h1>
          <p className="text-gray-600">Ürün gruplarına toplu indirim uygulayın</p>
        </div>
        <Button onClick={handleCreate} className="bg-green-700 hover:bg-green-800 transition-all duration-200 hover:shadow-lg hover:scale-105">
          <Plus className="w-5 h-5 mr-2" />
          Yeni Toplu İndirim
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-600">Toplam İndirim</div>
          <div className="text-2xl font-bold text-gray-900">{bulkDiscounts.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-600">Aktif İndirim</div>
          <div className="text-2xl font-bold text-green-600">
            {bulkDiscounts.filter(d => d.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-600">Planlanmış</div>
          <div className="text-2xl font-bold text-orange-600">
            {bulkDiscounts.filter(d => d.is_scheduled).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-600">Toplam Uygulama</div>
          <div className="text-2xl font-bold text-green-600">
            {Object.values(stats).reduce((sum, s) => sum + s.affected_products_count, 0)}
          </div>
        </div>
      </div>

      {/* Bulk Discounts Listesi */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İndirim Bilgisi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hedef
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İndirim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bulkDiscounts.map((discount) => (
              <tr key={discount.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{discount.name}</div>
                  <div className="text-sm text-gray-500">{discount.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Öncelik: {discount.priority}
                    </Badge>
                    {discount.stackable && (
                      <Badge variant="secondary" className="text-xs">
                        Birleştirilebilir
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {getTargetTypeLabel(discount.target_type)}
                  </div>
                  {discount.target_categories && discount.target_categories.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {discount.target_categories.length} kategori
                    </div>
                  )}
                  {discount.target_brands && discount.target_brands.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {discount.target_brands.length} marka
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-red-600 font-semibold">
                    <Percent className="w-4 h-4" />
                    {formatDiscountValue(discount.discount_value, discount.discount_type, discount.x_value, discount.y_value)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(discount.start_date), 'dd.MM.yyyy')}</span>
                    </div>
                    {discount.end_date && (
                      <div className="text-xs text-gray-500">
                        Son: {format(new Date(discount.end_date), 'dd.MM.yyyy')}
                      </div>
                    )}
                    {discount.is_scheduled && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">Planlı</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleActive(discount.id, discount.is_active)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                        discount.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {discount.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                    
                    {discount.max_usage_limit && (
                      <div className="text-xs text-gray-500">
                        Kullanım: {discount.current_usage_count}/{discount.max_usage_limit}
                      </div>
                    )}
                    
                    {stats[discount.id] && (
                      <div className="text-xs text-green-600">
                        Etkilenen: {stats[discount.id].affected_products_count} ürün
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => previewDiscount(discount)}
                      className="text-green-600 hover:text-green-900 hover:bg-green-50"
                      title="Önizleme"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {discount.is_active ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applyDiscount(discount.id)}
                        className="text-green-600 hover:text-green-900 hover:bg-green-50"
                        title="Uygula"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDiscount(discount.id)}
                        className="text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                        title="Kaldır"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(discount)}
                      className="text-green-600 hover:text-green-900 hover:bg-green-50"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDiscount(discount.id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Wizard Modal - Create/Edit */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setEditingDiscount(null)
          form.reset()
          setCurrentStep(1)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? 'Toplu İndirim Düzenle' : 'Yeni Toplu İndirim Oluştur'}
            </DialogTitle>
            <DialogDescription>
              Adım adım toplu indirim kurallarını belirleyin.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1">1. Temel Bilgiler</TabsTrigger>
              <TabsTrigger value="2">2. İndirim Türü</TabsTrigger>
              <TabsTrigger value="3">3. Hedef Seçimi</TabsTrigger>
              <TabsTrigger value="4">4. Zamanlama</TabsTrigger>
            </TabsList>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Temel Bilgiler */}
              <TabsContent value="1" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İndirim Adı *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Örn: Kasım İndirimleri - Oyuncaklar"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama *</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="İndirim hakkında detaylı bilgi..."
                    rows={3}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Öncelik *</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      {...form.register('priority', { valueAsNumber: true })}
                    />
                    {form.formState.errors.priority && (
                      <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_usage_limit">Maksimum Kullanım</Label>
                    <Input
                      id="max_usage_limit"
                      type="number"
                      min="0"
                      {...form.register('max_usage_limit', { valueAsNumber: true })}
                      placeholder="0 = sınırsız"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stackable"
                    checked={form.watch('stackable')}
                    onCheckedChange={(checked) => form.setValue('stackable', !!checked)}
                  />
                  <Label htmlFor="stackable">Diğer indirimlerle birleştirilebilir</Label>
                </div>
              </TabsContent>

              {/* Step 2: İndirim Türü */}
              <TabsContent value="2" className="space-y-4">
                <div className="space-y-2">
                  <Label>İndirim Türü *</Label>
                  <Select 
                    value={form.watch('discount_type')} 
                    onValueChange={(value) => form.setValue('discount_type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="İndirim türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Yüzde İndirimi</SelectItem>
                      <SelectItem value="fixed">Sabit Tutar İndirimi</SelectItem>
                      <SelectItem value="x_for_y">X Al Y Öde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Yüzde/Sabit Tutar İndirimi */}
                {(watchDiscountType === 'percentage' || watchDiscountType === 'fixed') && (
                  <div className="space-y-2">
                    <Label htmlFor="discount_value">
                      İndirim Değeri * {watchDiscountType === 'percentage' ? '(%)' : '(₺)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      min="0"
                      step={watchDiscountType === 'percentage' ? '1' : '0.01'}
                      {...form.register('discount_value', { valueAsNumber: true })}
                    />
                    {form.formState.errors.discount_value && (
                      <p className="text-sm text-red-600">{form.formState.errors.discount_value.message}</p>
                    )}
                  </div>
                )}

                {/* X Al Y Öde */}
                {watchDiscountType === 'x_for_y' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="x_value">X Değeri (Kaç tane al)</Label>
                      <Input
                        id="x_value"
                        type="number"
                        min="1"
                        {...form.register('x_value', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="y_value">Y Değeri (Kaç tane öde)</Label>
                      <Input
                        id="y_value"
                        type="number"
                        min="1"
                        {...form.register('y_value', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                )}

                {/* Ek ayarlar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_order_amount">Min. Sipariş Tutarı (₺)</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register('min_order_amount', { valueAsNumber: true })}
                    />
                  </div>

                  {watchDiscountType === 'percentage' && (
                    <div className="space-y-2">
                      <Label htmlFor="max_discount_amount">Maksimum İndirim (₺)</Label>
                      <Input
                        id="max_discount_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        {...form.register('max_discount_amount', { valueAsNumber: true })}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Step 3: Hedef Seçimi */}
              <TabsContent value="3" className="space-y-4">
                <div className="space-y-2">
                  <Label>Hedef Türü *</Label>
                  <Select 
                    value={form.watch('target_type')} 
                    onValueChange={(value) => form.setValue('target_type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hedef türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Ürünler</SelectItem>
                      <SelectItem value="category">Kategoriler</SelectItem>
                      <SelectItem value="brand">Markalar</SelectItem>
                      <SelectItem value="products">Seçili Ürünler</SelectItem>
                      <SelectItem value="price_range">Fiyat Aralığı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Kategori seçimi */}
                {watchTargetType === 'category' && (
                  <div className="space-y-2">
                    <Label>Hedef Kategoriler</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={form.watch('target_categories')?.includes(category.id)}
                            onCheckedChange={(checked) => {
                              const current = form.watch('target_categories') || []
                              if (checked) {
                                form.setValue('target_categories', [...current, category.id])
                              } else {
                                form.setValue('target_categories', current.filter(id => id !== category.id))
                              }
                            }}
                          />
                          <Label htmlFor={`category-${category.id}`} className="text-sm">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marka seçimi */}
                {watchTargetType === 'brand' && (
                  <div className="space-y-2">
                    <Label>Hedef Markalar</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                      {brands.map((brand) => (
                        <div key={brand.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand.id}`}
                            checked={form.watch('target_brands')?.includes(brand.id)}
                            onCheckedChange={(checked) => {
                              const current = form.watch('target_brands') || []
                              if (checked) {
                                form.setValue('target_brands', [...current, brand.id])
                              } else {
                                form.setValue('target_brands', current.filter(id => id !== brand.id))
                              }
                            }}
                          />
                          <Label htmlFor={`brand-${brand.id}`} className="text-sm">
                            {brand.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ürün seçimi */}
                {watchTargetType === 'products' && (
                  <div className="space-y-2">
                    <Label>Hedef Ürünler</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={form.watch('target_products')?.includes(product.id)}
                            onCheckedChange={(checked) => {
                              const current = form.watch('target_products') || []
                              if (checked) {
                                form.setValue('target_products', [...current, product.id])
                              } else {
                                form.setValue('target_products', current.filter(id => id !== product.id))
                              }
                            }}
                          />
                          <Label htmlFor={`product-${product.id}`} className="text-sm">
                            {product.name} ({product.product_code}) - ₺{product.price}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fiyat aralığı */}
                {watchTargetType === 'price_range' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_price">Min. Fiyat (₺)</Label>
                      <Input
                        id="min_price"
                        type="number"
                        min="0"
                        step="0.01"
                        {...form.register('min_price', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_price">Maks. Fiyat (₺)</Label>
                      <Input
                        id="max_price"
                        type="number"
                        min="0"
                        step="0.01"
                        {...form.register('max_price', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Step 4: Zamanlama */}
              <TabsContent value="4" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Başlangıç Tarihi *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.watch('start_date') && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('start_date') ? (
                            format(form.watch('start_date'), 'dd MMMM yyyy', { locale: tr })
                          ) : (
                            <span>Tarih seçin</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.watch('start_date')}
                          onSelect={(date) => form.setValue('start_date', date!)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.start_date && (
                      <p className="text-sm text-red-600">{form.formState.errors.start_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Bitiş Tarihi</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.watch('end_date') && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('end_date') ? (
                            format(form.watch('end_date'), 'dd MMMM yyyy', { locale: tr })
                          ) : (
                            <span>İsteğe bağlı</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.watch('end_date')}
                          onSelect={(date) => form.setValue('end_date', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_scheduled"
                    checked={form.watch('is_scheduled')}
                    onCheckedChange={(checked) => form.setValue('is_scheduled', !!checked)}
                  />
                  <Label htmlFor="is_scheduled">Planlı indirim (belirli bir tarihte uygulansın)</Label>
                </div>

                {form.watch('is_scheduled') && (
                  <div className="space-y-2">
                    <Label>Uygulanma Tarihi</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.watch('scheduled_for') && "text-muted-foreground"
                          )}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {form.watch('scheduled_for') ? (
                            format(form.watch('scheduled_for'), 'dd MMMM yyyy HH:mm', { locale: tr })
                          ) : (
                            <span>Uygulanma tarihi seçin</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.watch('scheduled_for')}
                          onSelect={(date) => form.setValue('scheduled_for', date!)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </TabsContent>

              <div className="flex justify-between">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Önceki
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false)
                      setIsEditModalOpen(false)
                      setEditingDiscount(null)
                      form.reset()
                      setCurrentStep(1)
                    }}
                  >
                    İptal
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Sonraki
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Kaydediliyor...' : editingDiscount ? 'Güncelle' : 'Oluştur'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>İndirim Önizlemesi</DialogTitle>
            <DialogDescription>
              {previewingDiscount?.name} indiriminin etkileyeceği ürünleri görüntüleyin.
            </DialogDescription>
          </DialogHeader>

          {previewResults && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Önizleme Sonuçları</span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  {previewResults.affected_products} ürün etkilenecek
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>İndirim Türü:</strong> {getDiscountTypeLabel(previewingDiscount?.discount_type || '')}</p>
                <p><strong>İndirim Değeri:</strong> {formatDiscountValue(
                  previewingDiscount?.discount_value || 0, 
                  previewingDiscount?.discount_type || '', 
                  previewingDiscount?.x_value, 
                  previewingDiscount?.y_value
                )}</p>
                <p><strong>Hedef:</strong> {getTargetTypeLabel(previewingDiscount?.target_type || '')}</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsPreviewModalOpen(false)}>
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
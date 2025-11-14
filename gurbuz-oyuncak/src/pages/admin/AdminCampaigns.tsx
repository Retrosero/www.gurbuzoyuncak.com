import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Calendar, Percent, Tag } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Campaign {
  id: number
  name: string
  description: string
  campaign_type: string
  discount_type: string
  discount_value: number
  start_date: string
  end_date: string
  is_active: boolean
  priority: number
  coupon_code?: string
  usage_limit?: number
  used_count?: number
  target_categories?: number[]
  target_brands?: number[]
  target_products?: number[]
  min_order_amount?: number
  max_discount_amount?: number
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
  is_active: boolean
}

const campaignSchema = z.object({
  name: z.string().min(1, 'Kampanya adı zorunludur'),
  description: z.string().min(1, 'Açıklama zorunludur'),
  campaign_type: z.enum(['seasonal', 'category', 'product', 'cart', 'x_for_y']),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0, 'İndirim değeri 0\'dan büyük olmalıdır'),
  start_date: z.date({ required_error: 'Başlangıç tarihi zorunludur' }),
  end_date: z.date({ required_error: 'Bitiş tarihi zorunludur' }),
  priority: z.number().min(1, 'Öncelik 1\'den büyük olmalıdır'),
  coupon_code: z.string().optional(),
  usage_limit: z.number().min(0, 'Kullanım limiti 0\'dan küçük olamaz').optional(),
  min_order_amount: z.number().min(0, 'Minimum sipariş tutarı 0\'dan küçük olamaz').optional(),
  max_discount_amount: z.number().min(0, 'Maksimum indirim tutarı 0\'dan küçük olamaz').optional(),
  target_categories: z.array(z.number()).optional(),
  target_brands: z.array(z.number()).optional(),
  target_products: z.array(z.number()).optional(),
}).refine((data) => {
  if (data.end_date <= data.start_date) {
    return false;
  }
  return true;
}, {
  message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
  path: ['end_date'],
});

type CampaignFormData = z.infer<typeof campaignSchema>

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      campaign_type: 'seasonal',
      discount_type: 'percentage',
      discount_value: 0,
      priority: 1,
    },
  })

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
        .select('id, name, product_code, is_active')
        .eq('is_active', true)
        .order('name')
        .limit(100)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error)
    }
  }, [])

  const checkCouponCodeExists = useCallback(async (couponCode: string, excludeId?: number) => {
    if (!couponCode) return false
    
    try {
      let query = supabase
        .from('campaigns')
        .select('id')
        .eq('coupon_code', couponCode)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data && data.length > 0)
    } catch (error) {
      console.error('Kupon kodu kontrol edilirken hata:', error)
      return false
    }
  }, [])

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('priority', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Kampanyalar yüklenirken hata:', error)
      toast.error('Kampanyalar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
    fetchCategories()
    fetchBrands()
    fetchProducts()
  }, [fetchCampaigns, fetchCategories, fetchBrands, fetchProducts])

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true)
    
    try {
      if (data.coupon_code) {
        const couponExists = await checkCouponCodeExists(data.coupon_code, editingCampaign?.id)
        if (couponExists) {
          form.setError('coupon_code', {
            type: 'manual',
            message: 'Bu kupon kodu zaten kullanılıyor'
          })
          return
        }
      }

      const campaignData = {
        ...data,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
      }

      if (editingCampaign) {
        const { error } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id)

        if (error) throw error
        
        toast.success('Kampanya başarıyla güncellendi')
        setIsEditModalOpen(false)
        setEditingCampaign(null)
      } else {
        const { error } = await supabase
          .from('campaigns')
          .insert([{
            ...campaignData,
            is_active: true,
            used_count: 0,
          }])

        if (error) throw error
        
        toast.success('Kampanya başarıyla oluşturuldu')
        setIsCreateModalOpen(false)
      }

      form.reset()
      fetchCampaigns()
    } catch (error) {
      console.error('Kampanya kaydedilirken hata:', error)
      toast.error('Kampanya kaydedilirken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    form.reset({
      name: campaign.name,
      description: campaign.description,
      campaign_type: campaign.campaign_type as any,
      discount_type: campaign.discount_type as any,
      discount_value: campaign.discount_value,
      start_date: new Date(campaign.start_date),
      end_date: new Date(campaign.end_date),
      priority: campaign.priority,
      coupon_code: campaign.coupon_code || '',
      usage_limit: campaign.usage_limit || 0,
      min_order_amount: campaign.min_order_amount || 0,
      max_discount_amount: campaign.max_discount_amount || 0,
      target_categories: campaign.target_categories || [],
      target_brands: campaign.target_brands || [],
      target_products: campaign.target_products || [],
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setEditingCampaign(null)
    form.reset({
      campaign_type: 'seasonal',
      discount_type: 'percentage',
      discount_value: 0,
      priority: 1,
    })
    setIsCreateModalOpen(true)
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchCampaigns()
      toast.success(`Kampanya ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi`)
    } catch (error) {
      console.error('Kampanya durumu güncellenirken hata:', error)
      toast.error('Kampanya durumu güncellenirken bir hata oluştu')
    }
  }

  const deleteCampaign = async (id: number) => {
    if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchCampaigns()
      toast.success('Kampanya başarıyla silindi')
    } catch (error) {
      console.error('Kampanya silinirken hata:', error)
      toast.error('Kampanya silinirken bir hata oluştu')
    }
  }

  const getCampaignTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      seasonal: 'Sezonluk',
      category: 'Kategori',
      product: 'Ürün',
      cart: 'Sepet',
      x_for_y: 'X Al Y Öde'
    }
    return labels[type] || type
  }

  const getDiscountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      percentage: 'Yüzde',
      fixed: 'Sabit Tutar'
    }
    return labels[type] || type
  }

  const formatDiscountValue = (value: number, discountType: string) => {
    if (discountType === 'percentage') {
      return `%${value}`
    } else {
      return `₺${value.toFixed(2)}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampanya Yönetimi</h1>
          <p className="text-gray-600">Aktif ve planlanan kampanyaları yönetin</p>
        </div>
        <Button onClick={handleCreate} className="bg-green-700 hover:bg-green-800 transition-all duration-200 hover:shadow-lg hover:scale-105">
          <Plus className="w-5 h-5 mr-2" />
          Yeni Kampanya
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-600">Toplam Kampanya</div>
          <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-600">Aktif Kampanya</div>
          <div className="text-2xl font-bold text-green-600">
            {campaigns.filter(c => c.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-600">Pasif Kampanya</div>
          <div className="text-2xl font-bold text-gray-400">
            {campaigns.filter(c => !c.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-600">Ortalama İndirim</div>
          <div className="text-2xl font-bold text-red-600">
            %{campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + (c.discount_value || 0), 0) / campaigns.length).toFixed(1) : 0}
          </div>
        </div>
      </div>

      {/* Kampanyalar Listesi */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kampanya
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tür
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İndirim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih Aralığı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Öncelik
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
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-500">{campaign.description}</div>
                  {campaign.coupon_code && (
                    <div className="flex items-center gap-1 mt-1">
                      <Tag className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        {campaign.coupon_code}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {getCampaignTypeLabel(campaign.campaign_type)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-red-600 font-semibold">
                    <Percent className="w-4 h-4" />
                    {formatDiscountValue(campaign.discount_value || 0, campaign.discount_type)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div>{format(new Date(campaign.start_date), 'dd.MM.yyyy', { locale: tr })}</div>
                      <div>{format(new Date(campaign.end_date), 'dd.MM.yyyy', { locale: tr })}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{campaign.priority}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleActive(campaign.id, campaign.is_active)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                        campaign.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {campaign.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                    {campaign.usage_limit && (
                      <span className="text-xs text-gray-500">
                        Kullanım: {campaign.used_count || 0}/{campaign.usage_limit}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(campaign)}
                      className="text-green-600 hover:text-green-900 hover:bg-green-50"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCampaign(campaign.id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kampanya Oluşturma/Düzenleme Modalı */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setEditingCampaign(null)
          form.reset()
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Oluştur'}
            </DialogTitle>
            <DialogDescription>
              Kampanya bilgilerini girin ve hedef kitleyi belirleyin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kampanya Adı *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Örn: Bahar İndirimleri"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Kampanya hakkında detaylı bilgi..."
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Kampanya Türü ve İndirim */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_type">Kampanya Türü *</Label>
                <Select 
                  value={form.watch('campaign_type')} 
                  onValueChange={(value) => form.setValue('campaign_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seasonal">Sezonluk</SelectItem>
                    <SelectItem value="category">Kategori</SelectItem>
                    <SelectItem value="product">Ürün</SelectItem>
                    <SelectItem value="cart">Sepet</SelectItem>
                    <SelectItem value="x_for_y">X Al Y Öde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">İndirim Türü *</Label>
                <Select 
                  value={form.watch('discount_type')} 
                  onValueChange={(value) => form.setValue('discount_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="İndirim türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Yüzde</SelectItem>
                    <SelectItem value="fixed">Sabit Tutar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  İndirim Değeri * {form.watch('discount_type') === 'percentage' ? '(%)' : '(₺)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  step={form.watch('discount_type') === 'percentage' ? '1' : '0.01'}
                  {...form.register('discount_value', { valueAsNumber: true })}
                />
                {form.formState.errors.discount_value && (
                  <p className="text-sm text-red-600">{form.formState.errors.discount_value.message}</p>
                )}
              </div>
            </div>

            {/* Tarih Aralığı */}
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
                <Label>Bitiş Tarihi *</Label>
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
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch('end_date')}
                      onSelect={(date) => form.setValue('end_date', date!)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.end_date && (
                  <p className="text-sm text-red-600">{form.formState.errors.end_date.message}</p>
                )}
              </div>
            </div>

            {/* Kupon Kodu ve Limitler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon_code">Kupon Kodu</Label>
                <Input
                  id="coupon_code"
                  {...form.register('coupon_code')}
                  placeholder="Örn: BAHAR2024"
                />
                {form.formState.errors.coupon_code && (
                  <p className="text-sm text-red-600">{form.formState.errors.coupon_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_limit">Kullanım Limiti</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min="0"
                  {...form.register('usage_limit', { valueAsNumber: true })}
                  placeholder="0 = sınırsız"
                />
              </div>

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
            </div>

            {/* Maksimum İndirim */}
            {form.watch('discount_type') === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">Maksimum İndirim Tutarı (₺)</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register('max_discount_amount', { valueAsNumber: true })}
                />
              </div>
            )}

            {/* Hedef Kategoriler */}
            {(form.watch('campaign_type') === 'category') && (
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

            {/* Hedef Markalar */}
            {(form.watch('campaign_type') === 'category') && (
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

            {/* Hedef Ürünler */}
            {(form.watch('campaign_type') === 'product') && (
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
                        {product.name} ({product.product_code})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  setEditingCampaign(null)
                  form.reset()
                }}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : editingCampaign ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Calendar, Percent, Tag, Search, Filter, RefreshCw } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Campaign {
  id: number
  name: string
  description?: string
  campaign_type: string
  discount_type: string
  discount_value: number
  buy_quantity?: number
  pay_quantity?: number
  category_ids?: number[]
  product_ids?: number[]
  brand_ids?: number[]
  min_purchase_amount?: number
  min_item_count?: number
  customer_types?: string[]
  start_date: string
  end_date: string
  is_active: boolean
  priority: number
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

const campaignSchema = z.object({
  name: z.string().min(1, 'Kampanya adı zorunludur').max(100, 'Kampanya adı en fazla 100 karakter olmalıdır'),
  description: z.string().max(500, 'Açıklama en fazla 500 karakter olmalıdır').optional(),
  campaign_type: z.enum(['seasonal', 'category', 'brand', 'product', 'cart', 'x_for_y', 'customer_type']),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0, 'İndirim değeri 0\'dan küçük olamaz'),
  buy_quantity: z.number().min(1, 'Alınacak miktar en az 1 olmalıdır').optional(),
  pay_quantity: z.number().min(1, 'Ödenecek miktar en az 1 olmalıdır').optional(),
  min_purchase_amount: z.number().min(0, 'Minimum alışveriş tutarı 0\'dan küçük olamaz').optional(),
  min_item_count: z.number().min(1, 'Minimum ürün sayısı en az 1 olmalıdır').optional(),
  start_date: z.date({ required_error: 'Başlangıç tarihi zorunludur' }),
  end_date: z.date({ required_error: 'Bitiş tarihi zorunludur' }),
  priority: z.number().min(0, 'Öncelik negatif olamaz').max(999, 'Öncelik en fazla 999 olabilir'),
  category_ids: z.array(z.number()).optional(),
  product_ids: z.array(z.number()).optional(),
  brand_ids: z.array(z.number()).optional(),
  customer_types: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.end_date <= data.start_date) {
    return false;
  }
  return true;
}, {
  message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
  path: ['end_date'],
}).refine((data) => {
  if (data.campaign_type === 'x_for_y') {
    return data.buy_quantity && data.pay_quantity && data.buy_quantity > data.pay_quantity;
  }
  return true;
}, {
  message: 'X Al Y Öde kampanyalarında alınacak miktar, ödenecek miktardan büyük olmalıdır',
  path: ['buy_quantity'],
});

type CampaignFormData = z.infer<typeof campaignSchema>

const CUSTOMER_TYPES = [
  { value: 'new', label: 'Yeni Müşteri' },
  { value: 'loyal', label: 'Sadık Müşteri' },
  { value: 'vip', label: 'VIP Müşteri' },
  { value: 'wholesale', label: 'Toptan Müşteri' },
]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      campaign_type: 'seasonal',
      discount_type: 'percentage',
      discount_value: 0,
      priority: 0,
    },
  })

  // Fetch helpers
  const fetchCampaigns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (error) {
      console.error('Kampanyalar yüklenirken hata:', error)
      toast.error('Kampanyalar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

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
      toast.error('Kategoriler yüklenirken bir hata oluştu')
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
      toast.error('Markalar yüklenirken bir hata oluştu')
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
      toast.error('Ürünler yüklenirken bir hata oluştu')
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchCampaigns(),
        fetchCategories(),
        fetchBrands(),
        fetchProducts()
      ])
    }
    loadData()
  }, [fetchCampaigns, fetchCategories, fetchBrands, fetchProducts])

  // Form submission
  const onSubmit = async (data: CampaignFormData) => {
    setSubmitting(true)
    
    try {
      const campaignData = {
        ...data,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        category_ids: data.category_ids ? data.category_ids : null,
        product_ids: data.product_ids ? data.product_ids : null,
        brand_ids: data.brand_ids ? data.brand_ids : null,
        customer_types: data.customer_types ? data.customer_types : null,
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
      setSubmitting(false)
    }
  }

  // Campaign actions
  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    form.reset({
      name: campaign.name,
      description: campaign.description || '',
      campaign_type: campaign.campaign_type as any,
      discount_type: campaign.discount_type as any,
      discount_value: campaign.discount_value,
      buy_quantity: campaign.buy_quantity || undefined,
      pay_quantity: campaign.pay_quantity || undefined,
      min_purchase_amount: campaign.min_purchase_amount || undefined,
      min_item_count: campaign.min_item_count || undefined,
      start_date: new Date(campaign.start_date),
      end_date: new Date(campaign.end_date),
      priority: campaign.priority,
      category_ids: campaign.category_ids || [],
      product_ids: campaign.product_ids || [],
      brand_ids: campaign.brand_ids || [],
      customer_types: campaign.customer_types || [],
    })
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setEditingCampaign(null)
    form.reset({
      campaign_type: 'seasonal',
      discount_type: 'percentage',
      discount_value: 0,
      priority: 0,
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
    if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return

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

  // Utility functions
  const getCampaignTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      seasonal: 'Sezonluk',
      category: 'Kategori',
      brand: 'Marka',
      product: 'Ürün',
      cart: 'Sepet',
      x_for_y: 'X Al Y Öde',
      customer_type: 'Müşteri Türü'
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

  const formatCustomerTypes = (types?: string[]) => {
    if (!types || types.length === 0) return '-'
    return types.map(type => 
      CUSTOMER_TYPES.find(ct => ct.value === type)?.label || type
    ).join(', ')
  }

  const getTargetInfo = (campaign: Campaign) => {
    switch (campaign.campaign_type) {
      case 'category':
        if (campaign.category_ids && campaign.category_ids.length > 0) {
          const categoryNames = campaign.category_ids
            .map(id => categories.find(c => c.id === id)?.name)
            .filter(Boolean)
            .join(', ')
          return categoryNames || 'Belirtilmemiş'
        }
        return 'Tüm Kategoriler'
      
      case 'product':
        if (campaign.product_ids && campaign.product_ids.length > 0) {
          return `${campaign.product_ids.length} ürün seçili`
        }
        return 'Ürün seçilmemiş'
      
      case 'brand':
        if (campaign.brand_ids && campaign.brand_ids.length > 0) {
          const brandNames = campaign.brand_ids
            .map(id => brands.find(b => b.id === id)?.name)
            .filter(Boolean)
            .join(', ')
          return brandNames || 'Belirtilmemiş'
        }
        return 'Tüm Markalar'
      
      case 'customer_type':
        return formatCustomerTypes(campaign.customer_types)
      
      default:
        return 'Genel'
    }
  }

  // Filtering
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || campaign.campaign_type === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && campaign.is_active) ||
                         (filterStatus === 'inactive' && !campaign.is_active)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const activeCampaignsCount = campaigns.filter(c => c.is_active).length
  const inactiveCampaignsCount = campaigns.filter(c => !c.is_active).length
  const avgDiscount = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.discount_value || 0), 0) / campaigns.length 
    : 0

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kampanya Yönetimi</h1>
          <p className="text-gray-600 mt-1">Kampanyalarınızı oluşturun, düzenleyin ve yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchCampaigns}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Yenile
          </Button>
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            Yeni Kampanya
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-gray-600">Toplam Kampanya</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{campaigns.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-gray-600">Aktif Kampanya</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{activeCampaignsCount}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-gray-600">Pasif Kampanya</div>
          <div className="text-2xl font-bold text-gray-400 mt-1">{inactiveCampaignsCount}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-gray-600">Ortalama İndirim</div>
          <div className="text-2xl font-bold text-green-600 mt-1">%{avgDiscount.toFixed(1)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Kampanya adı veya açıklamada ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Kampanya türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="seasonal">Sezonluk</SelectItem>
              <SelectItem value="category">Kategori</SelectItem>
              <SelectItem value="product">Ürün</SelectItem>
              <SelectItem value="cart">Sepet</SelectItem>
              <SelectItem value="x_for_y">X Al Y Öde</SelectItem>
              <SelectItem value="customer_type">Müşteri Türü</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kampanya bulunamadı</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Arama kriterlerinize uygun kampanya bulunamadı.' 
                : 'Henüz hiç kampanya oluşturmadınız.'}
            </p>
            <Button onClick={handleCreate} variant="outline">
              İlk kampanyanızı oluşturun
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kampanya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür & Hedef
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
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {campaign.description || 'Açıklama yok'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {getCampaignTypeLabel(campaign.campaign_type)}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {getTargetInfo(campaign)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {campaign.campaign_type === 'x_for_y' && campaign.buy_quantity && campaign.pay_quantity ? (
                          <div className="text-sm">
                            <span className="font-semibold text-red-600">
                              {campaign.buy_quantity} Al {campaign.pay_quantity} Öde
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Percent className="w-4 h-4 text-red-500" />
                            <span className="font-semibold text-red-600">
                              {formatDiscountValue(campaign.discount_value || 0, campaign.discount_type)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {format(new Date(campaign.start_date), 'dd MMM', { locale: tr })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <span>
                            {format(new Date(campaign.end_date), 'dd MMM yyyy', { locale: tr })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={campaign.priority > 0 ? "default" : "secondary"}>
                        {campaign.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(campaign.id, campaign.is_active)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                          campaign.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        )}
                      >
                        {campaign.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(campaign)}
                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCampaign(campaign.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setEditingCampaign(null)
          form.reset()
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Oluştur'}
            </DialogTitle>
            <DialogDescription>
              Kampanya detaylarını girin ve hedef kitlenizi belirleyin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Kampanya Adı *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Örn: Bahar İndirimleri 2024"
                    className="w-full"
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
                    min="0"
                    max="999"
                    {...form.register('priority', { valueAsNumber: true })}
                    placeholder="0-999 arası değer"
                  />
                  {form.formState.errors.priority && (
                    <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
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
            </div>

            {/* Campaign Type & Discount */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Kampanya Türü ve İndirim</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <SelectItem value="brand">Marka</SelectItem>
                      <SelectItem value="product">Ürün</SelectItem>
                      <SelectItem value="cart">Sepet</SelectItem>
                      <SelectItem value="x_for_y">X Al Y Öde</SelectItem>
                      <SelectItem value="customer_type">Müşteri Türü</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_type">İndirim Türü *</Label>
                  <Select 
                    value={form.watch('discount_type')} 
                    onValueChange={(value) => form.setValue('discount_type', value as any)}
                    disabled={form.watch('campaign_type') === 'x_for_y'}
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

                {form.watch('campaign_type') !== 'x_for_y' && (
                  <div className="space-y-2">
                    <Label htmlFor="discount_value">
                      İndirim Değeri * {form.watch('discount_type') === 'percentage' ? '(%)' : '(₺)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      min="0"
                      step={form.watch('discount_type') === 'percentage' ? '1' : '0.01'}
                      max={form.watch('discount_type') === 'percentage' ? '100' : undefined}
                      {...form.register('discount_value', { valueAsNumber: true })}
                    />
                    {form.formState.errors.discount_value && (
                      <p className="text-sm text-red-600">{form.formState.errors.discount_value.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* X for Y specific fields */}
              {form.watch('campaign_type') === 'x_for_y' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="buy_quantity">Alınacak Miktar *</Label>
                    <Input
                      id="buy_quantity"
                      type="number"
                      min="1"
                      {...form.register('buy_quantity', { valueAsNumber: true })}
                      placeholder="Kaç tane alacak"
                    />
                    {form.formState.errors.buy_quantity && (
                      <p className="text-sm text-red-600">{form.formState.errors.buy_quantity.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pay_quantity">Ödenecek Miktar *</Label>
                    <Input
                      id="pay_quantity"
                      type="number"
                      min="1"
                      {...form.register('pay_quantity', { valueAsNumber: true })}
                      placeholder="Kaç tane ödeyecek"
                    />
                    {form.formState.errors.pay_quantity && (
                      <p className="text-sm text-red-600">{form.formState.errors.pay_quantity.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Tarih Aralığı</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        disabled={(date) => date < new Date()}
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
                        disabled={(date) => date <= form.watch('start_date')}
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.end_date && (
                    <p className="text-sm text-red-600">{form.formState.errors.end_date.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Conditions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Ek Koşullar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="min_purchase_amount">Min. Sipariş Tutarı (₺)</Label>
                  <Input
                    id="min_purchase_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    {...form.register('min_purchase_amount', { valueAsNumber: true })}
                    placeholder="0 = sınır yok"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_item_count">Min. Ürün Sayısı</Label>
                  <Input
                    id="min_item_count"
                    type="number"
                    min="1"
                    {...form.register('min_item_count', { valueAsNumber: true })}
                    placeholder="1 = en az 1 ürün"
                  />
                </div>
              </div>
            </div>

            {/* Targeting */}
            {(form.watch('campaign_type') === 'category' || 
              form.watch('campaign_type') === 'product' || 
              form.watch('campaign_type') === 'brand' ||
              form.watch('campaign_type') === 'customer_type') && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Hedef Kitle</h3>
                
                {/* Categories */}
                {form.watch('campaign_type') === 'category' && (
                  <div className="space-y-3">
                    <Label>Hedef Kategoriler</Label>
                    <div className="max-h-48 overflow-y-auto border rounded-xl p-4 space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={form.watch('category_ids')?.includes(category.id)}
                            onCheckedChange={(checked) => {
                              const current = form.watch('category_ids') || []
                              if (checked) {
                                form.setValue('category_ids', [...current, category.id])
                              } else {
                                form.setValue('category_ids', current.filter(id => id !== category.id))
                              }
                            }}
                          />
                          <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer flex-1">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {form.watch('campaign_type') === 'brand' && (
                  <div className="space-y-3">
                    <Label>Hedef Markalar</Label>
                    <div className="max-h-48 overflow-y-auto border rounded-xl p-4 space-y-2">
                      {brands.map((brand) => (
                        <div key={brand.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`brand-${brand.id}`}
                            checked={form.watch('brand_ids')?.includes(brand.id)}
                            onCheckedChange={(checked) => {
                              const current = form.watch('brand_ids') || []
                              if (checked) {
                                form.setValue('brand_ids', [...current, brand.id])
                              } else {
                                form.setValue('brand_ids', current.filter(id => id !== brand.id))
                              }
                            }}
                          />
                          <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer flex-1">
                            {brand.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {form.watch('campaign_type') === 'product' && (
                  <div className="space-y-3">
                    <Label>Hedef Ürünler</Label>
                    <div className="max-h-48 overflow-y-auto border rounded-xl p-4 space-y-2">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={form.watch('product_ids')?.includes(product.id)}
                            onCheckedChange={(checked) => {
                              const current = form.watch('product_ids') || []
                              if (checked) {
                                form.setValue('product_ids', [...current, product.id])
                              } else {
                                form.setValue('product_ids', current.filter(id => id !== product.id))
                              }
                            }}
                          />
                          <Label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer flex-1">
                            <div className="flex justify-between items-center">
                              <span>{product.name}</span>
                              <span className="text-xs text-gray-500">({product.product_code})</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Types */}
                {form.watch('campaign_type') === 'customer_type' && (
                  <div className="space-y-3">
                    <Label>Hedef Müşteri Türleri</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {CUSTOMER_TYPES.map((type) => (
                        <div key={type.value} className="flex items-center space-x-3">
                          <Checkbox
                            id={`customer-${type.value}`}
                            checked={form.watch('customer_types')?.includes(type.value)}
                            onCheckedChange={(checked) => {
                              const current = form.watch('customer_types') || []
                              if (checked) {
                                form.setValue('customer_types', [...current, type.value])
                              } else {
                                form.setValue('customer_types', current.filter(t => t !== type.value))
                              }
                            }}
                          />
                          <Label htmlFor={`customer-${type.value}`} className="text-sm cursor-pointer">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex justify-end gap-3 pt-6 border-t">
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
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:shadow-lg hover:scale-105">
                {submitting ? 'Kaydediliyor...' : editingCampaign ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
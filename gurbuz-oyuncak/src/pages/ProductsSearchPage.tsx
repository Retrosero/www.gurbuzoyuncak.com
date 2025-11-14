import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List, SlidersHorizontal, X, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'

interface SearchFilters {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  inStock: boolean
  hasDiscount: boolean
  minRating: number
}

export default function ProductsSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    brands: [],
    priceRange: [0, 10000],
    inStock: false,
    hasDiscount: false,
    minRating: 0
  })
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  useEffect(() => {
    if (searchQuery || Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v)) {
      searchProducts()
    }
  }, [searchQuery, filters, sortBy])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      setCategories(data || [])
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const { data } = await supabase
        .from('brands')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      setBrands(data || [])
    } catch (error) {
      console.error('Markalar yüklenemedi:', error)
    }
  }

  const searchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name),
          brands(name)
        `)
        .eq('is_active', true)

      // Search query
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Category filter
      if (filters.categories.length > 0) {
        query = query.in('category_id', filters.categories)
      }

      // Brand filter
      if (filters.brands.length > 0) {
        query = query.in('brand_id', filters.brands)
      }

      // Price range
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1])

      // In stock
      if (filters.inStock) {
        query = query.gt('stock_quantity', 0)
      }

      // Has discount
      if (filters.hasDiscount) {
        query = query.gt('original_price', 0)
      }

      // Sort
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        default:
          query = query.order('name', { ascending: true })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error

      setProducts(data || [])
    } catch (error) {
      console.error('Ürünler aranamadı:', error)
      toast.error('Ürünler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchQuery) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: [0, 10000],
      inStock: false,
      hasDiscount: false,
      minRating: 0
    })
  }

  const hasActiveFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      filters.brands.length > 0 ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 10000 ||
      filters.inStock ||
      filters.hasDiscount ||
      filters.minRating > 0
    )
  }, [filters])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ürün Arama</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </form>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal size={18} />
              Filtreler
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-1">
                  {Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v).length}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-gray-600">
                <X size={16} className="mr-1" />
                Filtreleri Temizle
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">İsme Göre</SelectItem>
                <SelectItem value="price_low">Fiyat (Artan)</SelectItem>
                <SelectItem value="price_high">Fiyat (Azalan)</SelectItem>
                <SelectItem value="newest">En Yeni</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid size={18} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-4">Filtreler</h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Kategoriler</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.categories.includes(category.id.toString())}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              categories: [...prev.categories, category.id.toString()]
                            }))
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              categories: prev.categories.filter(c => c !== category.id.toString())
                            }))
                          }
                        }}
                      />
                      <label className="text-sm">{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Markalar</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <div key={brand.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.brands.includes(brand.id.toString())}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              brands: [...prev.brands, brand.id.toString()]
                            }))
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              brands: prev.brands.filter(b => b !== brand.id.toString())
                            }))
                          }
                        }}
                      />
                      <label className="text-sm">{brand.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Fiyat Aralığı</h4>
                <div className="space-y-3">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={10000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₺{filters.priceRange[0]}</span>
                    <span>₺{filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Other Filters */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.inStock}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStock: !!checked }))}
                  />
                  <label className="text-sm">Sadece Stokta Olanlar</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.hasDiscount}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasDiscount: !!checked }))}
                  />
                  <label className="text-sm">İndirimli Ürünler</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Ürün bulunamadı</p>
              <p className="text-gray-400 mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {products.map((product) => (
                <div key={product.id} className={
                  viewMode === 'grid'
                    ? 'bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow'
                    : 'bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-4 flex gap-4'
                }>
                  {viewMode === 'grid' ? (
                    <div>
                      <Link to={`/urun/${product.slug}`} className="block">
                        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            <img
                              src={product.image_urls[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              Resim Yok
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/urun/${product.slug}`} className="block">
                          <h3 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500">{product.categories?.name}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{product.brands?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.original_price && product.original_price > product.price ? (
                              <div>
                                <span className="text-lg font-bold text-red-600">
                                  ₺{product.price.toLocaleString('tr-TR')}
                                </span>
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ₺{product.original_price.toLocaleString('tr-TR')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                ₺{product.price.toLocaleString('tr-TR')}
                              </span>
                            )}
                          </div>
                          {product.stock_quantity > 0 ? (
                            <Badge variant="secondary">Stokta</Badge>
                          ) : (
                            <Badge variant="destructive">Tükendi</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link to={`/urun/${product.slug}`} className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image_urls && product.image_urls.length > 0 ? (
                          <img
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Resim Yok
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <Link to={`/urun/${product.slug}`}>
                          <h3 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1 mb-1">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.original_price && product.original_price > product.price ? (
                              <div>
                                <span className="text-lg font-bold text-red-600">
                                  ₺{product.price.toLocaleString('tr-TR')}
                                </span>
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ₺{product.original_price.toLocaleString('tr-TR')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                ₺{product.price.toLocaleString('tr-TR')}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            {product.stock_quantity > 0 ? (
                              <Badge variant="secondary">Stokta</Badge>
                            ) : (
                              <Badge variant="destructive">Tükendi</Badge>
                            )}
                            <p className="text-xs text-gray-500 mt-1">{product.stock_quantity} adet</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/types'
import { 
  ShoppingCart, Star, ChevronRight, ChevronDown, Folder, FolderOpen,
  Filter, X, SlidersHorizontal, Grid, List, ArrowUpDown,
  Package, DollarSign, Hash, CheckCircle, ArrowLeft
} from 'lucide-react'
import ProductCard from '@/components/ProductCard'

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
  product_count?: number
}

interface FilterState {
  brands: string[]
  priceRange: { min: number; max: number }
  inStock: boolean | null
  sortBy: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'popular'
  viewMode: 'grid' | 'list'
}

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [mainCategories, setMainCategories] = useState<Category[]>([])
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null)
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    priceRange: { min: 0, max: 1000 },
    inStock: null,
    sortBy: 'name',
    viewMode: 'grid'
  })

  useEffect(() => {
    loadMainCategories()
    if (slug) {
      loadCategoryData()
    }
  }, [slug])

  useEffect(() => {
    if (selectedMainCategory) {
      loadSubCategories(selectedMainCategory.id)
    }
  }, [selectedMainCategory])

  // Apply filters when products or filters change
  useEffect(() => {
    applyFilters()
  }, [products, filters])

  // Load brands for current category
  useEffect(() => {
    if (products.length > 0) {
      loadAvailableBrands()
      calculatePriceRange()
    }
  }, [products])

  async function loadAvailableBrands() {
    const brands = [...new Set(products.map(p => p.brand_name).filter(Boolean))]
    setAvailableBrands(brands.sort())
  }

  function calculatePriceRange() {
    if (products.length === 0) return
    
    const prices = products.map(p => p.base_price).filter(Boolean)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    
    setPriceRange({ min: Math.floor(min), max: Math.ceil(max) })
    
    // Update filter range if not set
    if (filters.priceRange.min === 0 && filters.priceRange.max === 1000) {
      setFilters(prev => ({
        ...prev,
        priceRange: { min: Math.floor(min), max: Math.ceil(max) }
      }))
    }
  }

  function applyFilters() {
    let filtered = [...products]

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => 
        p.brand_name && filters.brands.includes(p.brand_name)
      )
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.base_price >= filters.priceRange.min && 
      p.base_price <= filters.priceRange.max
    )

    // Stock filter
    if (filters.inStock !== null) {
      filtered = filtered.filter(p => 
        filters.inStock ? p.stock > 0 : p.stock === 0
      )
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.base_price - b.base_price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.base_price - a.base_price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        break
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
        break
    }

    setFilteredProducts(filtered)
  }

  function updateFilter(key: keyof FilterState, value: any) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters({
      brands: [],
      priceRange: priceRange,
      inStock: null,
      sortBy: 'name',
      viewMode: filters.viewMode
    })
  }

  async function loadMainCategories() {
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .eq('level', 0)
        .order('order_index')

      if (categories) {
        setMainCategories(categories)
        
        // İlk kategoriyi otomatik seç
        if (categories.length > 0 && !selectedMainCategory) {
          setSelectedMainCategory(categories[0])
        }
      }
    } catch (error) {
      console.error('Ana kategoriler yüklenemedi:', error)
    }
  }

  async function loadSubCategories(parentId: number) {
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('order_index')

      if (categories) {
        setSubCategories(categories)
      }
    } catch (error) {
      console.error('Alt kategoriler yüklenemedi:', error)
    }
  }

  async function loadCategoryData() {
    try {
      const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (category) {
        setCurrentCategory(category)
        
        // Kategori ve alt kategorilerindeki ürünleri yükle
        const categoryIds = await getAllCategoryIds(category.id)
        
        const { data } = await supabase
          .from('products')
          .select('*')
          .in('category_id', categoryIds)
          .eq('is_active', true)
          .limit(50)

        if (data) setProducts(data)
        
        // Bu kategoriyi ve üst kategorilerini genişlet
        setExpandedCategories([category.id])
      }
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  async function getAllCategoryIds(categoryId: number): Promise<number[]> {
    const ids = [categoryId]
    
    const { data: subCategories } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)
      .eq('is_active', true)

    if (subCategories && subCategories.length > 0) {
      for (const subCat of subCategories) {
        const subIds = await getAllCategoryIds(subCat.id)
        ids.push(...subIds)
      }
    }

    return ids
  }

  const handleMainCategorySelect = (category: Category) => {
    setSelectedMainCategory(category)
    setCurrentCategory(null) // Reset current category when selecting main category
  }

  const handleSubCategorySelect = (category: Category) => {
    setCurrentCategory(category)
    loadCategoryData(category.slug)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0cc0df] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Ana Kategoriler - Horizontal Scroll */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#0cc0df]">Ana Kategoriler</h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleMainCategorySelect(category)}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 relative ${
                    selectedMainCategory?.id === category.id
                      ? 'bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] text-white shadow-lg border-2 border-[#0cc0df]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-[#0cc0df] hover:to-[#00a8cb] hover:text-white hover:border-2 hover:border-[#0cc0df]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{category.name}</span>
                    <span className="text-xs opacity-90">12 ürün</span>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-[#ffde59] text-gray-800 text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    12
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alt Kategoriler - Grid Layout */}
        {selectedMainCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#0cc0df]">{selectedMainCategory.name}</h2>
                {currentCategory && (
                  <span className="text-gray-400">/</span>
                )}
                {currentCategory && (
                  <h3 className="text-xl font-semibold text-[#00a8cb]">{currentCategory.name}</h3>
                )}
              </div>
              {currentCategory && (
                <button
                  onClick={() => setCurrentCategory(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                >
                  <ArrowLeft size={16} />
                  Geri Dön
                </button>
              )}
            </div>

            {!currentCategory ? (
              /* Alt Kategoriler Grid - 6 Sütunlu Mega Menu Tasarımı */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {subCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSubCategorySelect(category)}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-[#0cc0df]/20"
                  >
                    <div className="aspect-square bg-gradient-to-br from-[#0cc0df]/5 to-[#00a8cb]/5 flex items-center justify-center relative overflow-hidden">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#0cc0df] to-[#00a8cb] rounded-xl flex items-center justify-center">
                        <FolderOpen size={32} className="text-white" />
                      </div>
                      <div className="absolute top-2 right-2 bg-[#ffde59] text-gray-800 text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                        8
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#0cc0df] transition-colors duration-300 text-sm leading-tight flex-1">
                          {category.name}
                        </h3>
                        <span className="text-xs text-[#0cc0df] font-medium bg-[#0cc0df]/10 px-2 py-1 rounded-full">
                          8
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Ürün Listesi */
              <div>
                {/* Kontrol Paneli */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-[#0cc0df] mb-2">
                        {currentCategory.name}
                      </h1>
                      {currentCategory.description && (
                        <p className="text-gray-600 mb-2">{currentCategory.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package size={14} />
                          {filteredProducts.length} ürün
                        </span>
                        {filters.brands.length > 0 && (
                          <span className="text-[#0cc0df]">
                            {filters.brands.length} marka seçili
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Kontroller */}
                    <div className="flex items-center gap-3">
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateFilter('viewMode', 'grid')}
                          className={`p-2 rounded transition-all ${
                            filters.viewMode === 'grid' 
                              ? 'bg-white shadow-sm text-[#0cc0df]' 
                              : 'text-gray-600 hover:text-[#0cc0df]'
                          }`}
                        >
                          <Grid size={16} />
                        </button>
                        <button
                          onClick={() => updateFilter('viewMode', 'list')}
                          className={`p-2 rounded transition-all ${
                            filters.viewMode === 'list' 
                              ? 'bg-white shadow-sm text-[#0cc0df]' 
                              : 'text-gray-600 hover:text-[#0cc0df]'
                          }`}
                        >
                          <List size={16} />
                        </button>
                      </div>

                      <select
                        value={filters.sortBy}
                        onChange={(e) => updateFilter('sortBy', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0cc0df] focus:border-transparent bg-white"
                      >
                        <option value="name">İsim (A-Z)</option>
                        <option value="price_asc">Fiyat (Artan)</option>
                        <option value="price_desc">Fiyat (Azalan)</option>
                        <option value="newest">En Yeni</option>
                        <option value="popular">Popüler</option>
                      </select>
                    </div>
                  </div>

                  {/* Aktif Filtreler */}
                  {(filters.brands.length > 0 || filters.inStock !== null) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {filters.brands.map(brand => (
                          <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-[#0cc0df]/10 text-[#0cc0df] rounded-full text-sm">
                            {brand}
                            <button 
                              onClick={() => updateFilter('brands', filters.brands.filter(b => b !== brand))}
                              className="hover:bg-[#0cc0df]/20 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        {filters.inStock !== null && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ffde59]/10 text-[#ffde59] rounded-full text-sm">
                            {filters.inStock ? 'Stokta Var' : 'Stokta Yok'}
                            <button 
                              onClick={() => updateFilter('inStock', null)}
                              className="hover:bg-[#ffde59]/20 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Filtreler */}
                {availableBrands.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-[#0cc0df]">
                      <SlidersHorizontal size={18} />
                      Filtreler
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Markalar */}
                      <div>
                        <h4 className="font-medium mb-3 text-gray-700">Markalar</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {availableBrands.map(brand => (
                            <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={filters.brands.includes(brand)}
                                onChange={(e) => {
                                  const newBrands = e.target.checked 
                                    ? [...filters.brands, brand]
                                    : filters.brands.filter(b => b !== brand)
                                  updateFilter('brands', newBrands)
                                }}
                                className="rounded border-gray-300 text-[#0cc0df] focus:ring-[#0cc0df]"
                              />
                              <span className="text-sm text-gray-700">{brand}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Fiyat Aralığı */}
                      <div>
                        <h4 className="font-medium mb-3 text-gray-700">Fiyat Aralığı</h4>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.priceRange.min}
                              onChange={(e) => updateFilter('priceRange', {
                                ...filters.priceRange,
                                min: Number(e.target.value) || 0
                              })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0cc0df] focus:border-transparent"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.priceRange.max}
                              onChange={(e) => updateFilter('priceRange', {
                                ...filters.priceRange,
                                max: Number(e.target.value) || 1000
                              })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0cc0df] focus:border-transparent"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            ₺{filters.priceRange.min} - ₺{filters.priceRange.max}
                          </p>
                        </div>
                      </div>

                      {/* Stok Durumu */}
                      <div>
                        <h4 className="font-medium mb-3 text-gray-700">Stok Durumu</h4>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="radio"
                              name="stock"
                              checked={filters.inStock === null}
                              onChange={() => updateFilter('inStock', null)}
                              className="text-[#0cc0df] focus:ring-[#0cc0df]"
                            />
                            <span className="text-sm text-gray-700">Tümü</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="radio"
                              name="stock"
                              checked={filters.inStock === true}
                              onChange={() => updateFilter('inStock', true)}
                              className="text-[#0cc0df] focus:ring-[#0cc0df]"
                            />
                            <span className="text-sm text-gray-700">Stokta Var</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="radio"
                              name="stock"
                              checked={filters.inStock === false}
                              onChange={() => updateFilter('inStock', false)}
                              className="text-[#0cc0df] focus:ring-[#0cc0df]"
                            />
                            <span className="text-sm text-gray-700">Stokta Yok</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  </div>
                )}

                {/* Ürün Listesi */}
                {filteredProducts.length > 0 ? (
                  <div className={`grid gap-6 ${
                    filters.viewMode === 'grid' 
                      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        viewMode={filters.viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="max-w-md mx-auto">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {products.length === 0 ? 'Bu kategoride ürün bulunmuyor' : 'Filtreye uygun ürün bulunamadı'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {products.length === 0 
                          ? 'Bu kategori henüz ürünlerle doldurulmamış.'
                          : 'Filtre kriterlerinizi değiştirerek daha fazla ürün bulabilirsiniz.'
                        }
                      </p>
                      {products.length > 0 && (
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0cc0df] text-white rounded-xl hover:bg-[#0cc0df] transition shadow-lg"
                        >
                          <Filter size={16} />
                          Filtreleri Temizle
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

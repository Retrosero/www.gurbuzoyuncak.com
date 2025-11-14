import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Package, Filter, Grid, List } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

interface Brand {
  id: number
  name: string
  description?: string
  logo_url?: string
  is_active: boolean
}

interface BrandProduct {
  id: number
  name: string
  slug: string
  base_price: number
  stock: number
  category_id: number
  brand_id: number
  brands: { name: string }
  product_images: { image_url: string }[]
}

interface Category {
  id: number
  name: string
}

export default function MarkaDetayPage() {
  const { slug } = useParams()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<BrandProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredProducts, setFilteredProducts] = useState<BrandProduct[]>([])

  useEffect(() => {
    if (slug) {
      fetchBrandAndProducts()
      fetchCategories()
    }
  }, [slug])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, selectedCategory, sortBy])

  const fetchBrandAndProducts = async () => {
    try {
      setLoading(true)
      
      // Find brand by slug directly from the brands table
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle()

      if (brandError) throw brandError

      if (!brandData) {
        console.error('Brand not found')
        setLoading(false)
        return
      }

      setBrand(brandData)

      // Fetch products for this brand
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          base_price,
          stock,
          category_id,
          brand_id,
          brands(name),
          product_images(image_url)
        `)
        .eq('brand_id', brandData.id)
        .eq('is_active', true)
        .order('name')

      if (productsError) throw productsError

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching brand and products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category_id.toString() === selectedCategory
      )
    }

    // Sort products
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.base_price - b.base_price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.base_price - a.base_price)
        break
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
        break
    }

    setFilteredProducts(filtered)
  }

  const sortOptions = [
    { value: 'name', label: 'İsim (A-Z)' },
    { value: 'price_asc', label: 'Fiyat (Düşük → Yüksek)' },
    { value: 'price_desc', label: 'Fiyat (Yüksek → Düşük)' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Marka Bulunamadı</h2>
            <p className="text-gray-600 mb-4">Aradığınız marka bulunamadı veya mevcut değil.</p>
            <Link
              to="/markalar"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Markalara Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Link to="/" className="hover:text-blue-600">Ana Sayfa</Link>
            <span className="mx-2">/</span>
            <Link to="/markalar" className="hover:text-blue-600">Markalar</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{brand.name}</span>
          </div>

          {/* Brand Info */}
          <div className="flex items-center space-x-6">
            {brand.logo_url ? (
              <img 
                src={brand.logo_url} 
                alt={brand.name}
                className="w-20 h-20 object-contain rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {brand.name}
              </h1>
              {brand.description && (
                <p className="text-gray-600 text-lg">
                  {brand.description}
                </p>
              )}
              <div className="flex items-center space-x-6 mt-4">
                <span className="text-gray-600">
                  <Package className="w-5 h-5 inline mr-2" />
                  {products.length} ürün
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort and View Options */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedCategory ? 'Bu kategoride ürün yok' : 'Henüz ürün eklenmemiş'}
            </h3>
            <p className="text-gray-600">
              {selectedCategory ? 'Seçili kategoride ürün bulunmuyor.' : 'Bu markanın henüz ürünü bulunmuyor.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredProducts.length} ürün bulundu
                {selectedCategory && ' (filtrelenmiş)'}
              </p>
            </div>

            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    base_price: product.base_price,
                    stock: product.stock,
                    brandName: product.brands?.name,
                    product_images: product.product_images
                  }}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
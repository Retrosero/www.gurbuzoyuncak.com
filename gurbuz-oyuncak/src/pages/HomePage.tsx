import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { HomeSection, Product, Brand } from '@/types'
import { useSEO } from '@/contexts/SEOContext'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import ProductCard from '@/components/ProductCard'
import CampaignBanner from '@/components/CampaignBanner'
import { parseXMLCategories, CategoryHierarchy } from '@/utils/categoryParser'
import { Grid, ChevronRight, Tag, Sparkles, TrendingUp, Star, Zap } from 'lucide-react'

export default function HomePage() {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [sectionProducts, setSectionProducts] = useState<Record<number, Product[]>>({})
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<CategoryHierarchy | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(true)
  
  // Yeni ürün bölümleri için state'ler
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [loadingNewProducts, setLoadingNewProducts] = useState(true)
  
  const { loadSEOData, generateStructuredData } = useSEO()

  useEffect(() => {
    loadHomeContent()
    loadCategories()
    loadBrands()
    loadNewProducts()
    loadFeaturedProducts()
    loadPopularProducts()
    // Load SEO data for home page
    loadSEOData('home')
  }, [])

  async function loadHomeContent() {
    try {
      const { data: sectionsData } = await supabase
        .from('home_sections')
        .select('*')
        .eq('is_active', true)
        .order('order_index')

      if (sectionsData) {
        setSections(sectionsData)
        
        for (const section of sectionsData) {
          const productIds = section.product_ids as number[]
          if (productIds && productIds.length > 0) {
            const { data: products } = await supabase
              .from('products')
              .select('*')
              .in('id', productIds)
              .eq('is_active', true)
              .limit(8)

            if (products) {
              setSectionProducts(prev => ({
                ...prev,
                [section.id]: products
              }))
            }
          }
        }
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      setLoadingCategories(true)
      const categoryData = await parseXMLCategories()
      setCategories(categoryData)
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  async function loadBrands() {
    try {
      setLoadingBrands(true)
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .limit(12)
      
      if (error) throw error
      setBrands(data || [])
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error)
    } finally {
      setLoadingBrands(false)
    }
  }

  async function loadNewProducts() {
    try {
      // Son 30 günde eklenen ürünler
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(8)
      
      if (error) throw error
      setNewProducts(data || [])
    } catch (error) {
      console.error('Yeni ürünler yüklenirken hata:', error)
    } finally {
      setLoadingNewProducts(false)
    }
  }

  async function loadFeaturedProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('view_count', { ascending: false })
        .limit(8)
      
      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Öne çıkan ürünler yüklenirken hata:', error)
    }
  }

  async function loadPopularProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('view_count', { ascending: false })
        .limit(8)
      
      if (error) throw error
      setPopularProducts(data || [])
    } catch (error) {
      console.error('Popüler ürünler yüklenirken hata:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Performance Monitor - shows only in development */}
      <PerformanceMonitor showInsights={false} />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Kampanya Banner */}
        <CampaignBanner />

        {/* Kategoriler Bölümü - Modern Tasarım */}
        {!loadingCategories && categories && categories.mainCategories.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="text-center mb-8">
              <h2 className="mobile-text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] bg-clip-text text-transparent mb-3 flex items-center justify-center gap-3">
                <div className="bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] p-2 rounded-xl">
                  <Grid className="text-white" size={28} />
                </div>
                Kategoriler
              </h2>
              <p className="text-gray-600 text-sm md:text-base">En popüler oyuncak kategorilerimizi keşfedin</p>
            </div>
            
            {/* Ana Kategori Kartları - Modern Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
              {categories.mainCategories.map(mainCategory => {
                const subCategories = categories.categoryMap[mainCategory.name] || []
                
                return (
                  <div 
                    key={mainCategory.id} 
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <Link
                      to={`/kategoriler?kategori=${encodeURIComponent(mainCategory.name)}`}
                      className="block"
                    >
                      {/* Gradient Header */}
                      <div className="bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold mb-1 group-hover:scale-105 transition-transform">
                                {mainCategory.name}
                              </h3>
                              <p className="text-white/80 text-sm">
                                {subCategories.length} alt kategori
                              </p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:scale-110 transition-transform">
                              <ChevronRight size={24} className="text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Alt Kategoriler Listesi */}
                      {subCategories.length > 0 && (
                        <div className="p-6">
                          <div className="space-y-3">
                            {subCategories.slice(0, 5).map(subCategory => {
                              const subSubCategories = categories.subCategoryMap[subCategory.name] || []
                              
                              return (
                                <Link
                                  key={subCategory.id}
                                  to={`/kategoriler?kategori=${encodeURIComponent(mainCategory.name)}&alt_kategori=${encodeURIComponent(subCategory.name)}`}
                                  className="block group/link"
                                >
                                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#0cc0df]/5 transition-colors group-hover/link:bg-[#0cc0df]/10">
                                    <span className="text-gray-700 group-hover/link:text-[#0cc0df] font-medium text-sm transition-colors">
                                      {subCategory.name}
                                    </span>
                                    {subSubCategories.length > 0 && (
                                      <span className="text-xs text-[#0cc0df] bg-[#0cc0df]/10 px-2 py-1 rounded-full font-medium">
                                        {subSubCategories.length}
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              )
                            })}
                            
                            {subCategories.length > 5 && (
                              <Link
                                to={`/kategoriler?kategori=${encodeURIComponent(mainCategory.name)}`}
                                className="block text-center p-3 text-[#0cc0df] hover:text-[#0cc0df]/80 font-medium text-sm border border-[#0cc0df]/20 rounded-lg hover:bg-[#0cc0df]/5 transition-all group-hover:border-[#0cc0df]/40"
                              >
                                +{subCategories.length - 5} kategori daha gör
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
            
            {/* Tüm Kategoriler - Premium CTA */}
            <div className="text-center">
              <Link
                to="/kategoriler"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#0cc0df] to-[#00a8cb] text-white px-8 py-4 rounded-2xl hover:from-[#00a8cb] hover:to-[#0cc0df] transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Grid size={24} />
                </div>
                Tüm Kategorileri Keşfedin
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        )}

        {/* Popüler Markalar Bölümü */}
        {!loadingBrands && brands.length > 0 && (
          <section className="mb-8 md:mb-12">
            <h2 className="mobile-text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-blue-700 pl-4 flex items-center gap-2">
              <Tag size={24} />
              Popüler Markalar
            </h2>
            {/* Horizontal Scroll Container */}
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {brands.map(brand => (
                  <Link
                    key={brand.id}
                    to={`/urunler?marka=${encodeURIComponent(brand.name)}`}
                    className="flex-shrink-0 flex flex-col items-center group"
                  >
                    {/* Story Circle */}
                    <div className="relative mb-2">
                      {/* Gradient Border */}
                      <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 transition-all duration-200">
                        {/* Inner Circle */}
                        <div className="w-full h-full rounded-full bg-white p-1">
                          {brand.logo_url ? (
                            <img 
                              src={brand.logo_url} 
                              alt={brand.name}
                              className="w-full h-full object-contain rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              <Tag size={20} className="text-blue-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Brand Name - Tek Satır */}
                    <h3 className="text-xs font-medium text-gray-800 group-hover:text-blue-700 transition-colors max-w-[80px] truncate">
                      {brand.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Tüm Markalar Linki */}
            <div className="text-center mt-6">
              <Link
                to="/markalar"
                className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition font-medium"
              >
                <Tag size={20} />
                Tüm Markaları Gör
              </Link>
            </div>
          </section>
        )}

        {/* Yeni Eklenen Ürünler Bölümü */}
        {!loadingNewProducts && newProducts.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="mobile-text-2xl md:text-3xl font-bold text-gray-800 border-l-4 border-green-600 pl-4 flex items-center gap-2">
                <Sparkles size={24} className="text-green-600" />
                Son Eklenen Ürünler
              </h2>
              <Link
                to="/urunler?siralama=yeni"
                className="text-blue-700 hover:text-blue-800 font-medium text-sm md:text-base flex items-center gap-1"
              >
                Tümünü Gör
                <ChevronRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Öne Çıkan Ürünler Bölümü */}
        {featuredProducts.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="mobile-text-2xl md:text-3xl font-bold text-gray-800 border-l-4 border-yellow-500 pl-4 flex items-center gap-2">
                <Star size={24} className="text-yellow-500" />
                Öne Çıkan Ürünler
              </h2>
              <Link
                to="/urunler?one_cikan=true"
                className="text-blue-700 hover:text-blue-800 font-medium text-sm md:text-base flex items-center gap-1"
              >
                Tümünü Gör
                <ChevronRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Popüler Ürünler Bölümü */}
        {popularProducts.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="mobile-text-2xl md:text-3xl font-bold text-gray-800 border-l-4 border-purple-600 pl-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-purple-600" />
                Popüler Ürünler
              </h2>
              <Link
                to="/urunler?siralama=populer"
                className="text-blue-700 hover:text-blue-800 font-medium text-sm md:text-base flex items-center gap-1"
              >
                Tümünü Gör
                <ChevronRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {popularProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {sections.map(section => {
          const products = sectionProducts[section.id] || []
          if (products.length === 0) return null

          return (
            <section key={section.id} className="mb-8 md:mb-12">
              <h2 className="mobile-text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 border-l-4 border-blue-700 pl-4">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

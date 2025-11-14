import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Star, Package, Search } from 'lucide-react'

interface Brand {
  id: number
  name: string
  description?: string
  logo_url?: string
  is_active: boolean
  product_count?: number
}

interface BrandProduct {
  id: number
  name: string
  slug: string
  base_price: number
  stock: number
  product_images: { image_url: string }[]
  brand_id: number
}

export default function MarkalarPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandProducts, setBrandProducts] = useState<Record<number, BrandProduct[]>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      
      // Fetch all brands with slug
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id, name, slug, description, logo_url, is_active')
        .eq('is_active', true)
        .order('name')

      if (brandsError) throw brandsError

      // Get product count for each brand
      const brandsWithCounts = await Promise.all(
        (brandsData || []).map(async (brand) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('brand_id', brand.id)
            .eq('is_active', true)

          return {
            ...brand,
            product_count: count || 0
          }
        })
      )

      // Fetch products for each brand (limited to 4 per brand for preview)
      const productsData: Record<number, BrandProduct[]> = {}
      
      await Promise.all(
        (brandsData || []).map(async (brand) => {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
              id,
              name,
              slug,
              base_price,
              stock,
              brand_id,
              product_images (image_url)
            `)
            .eq('brand_id', brand.id)
            .eq('is_active', true)
            .limit(5)
            .order('name')

          if (productsError) {
            console.error(`Error fetching products for brand ${brand.name}:`, productsError)
            productsData[brand.id] = []
          } else {
            productsData[brand.id] = products || []
          }
        })
      )

      setBrands(brandsWithCounts)
      setBrandProducts(productsData)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Markalarımız
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              En kaliteli oyuncak markalarından binlerce ürün
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Marka ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Package className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Marka bulunamadı' : 'Henüz marka eklenmemiş'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? `"${searchTerm}" için sonuç bulunamadı.` : 'Yakında daha fazla marka eklenecek.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredBrands.map((brand) => (
              <div key={brand.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Brand Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name}
                          className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white p-2"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                          <Package className="w-10 h-10 text-blue-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {brand.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {brand.product_count} ürün
                          </span>
                          {brand.product_count > 0 && (
                            <Link
                              to={`/markalar/${brand.slug}`}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                              Tümünü Gör
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {brand.description && (
                    <p className="text-gray-600 text-sm">
                      {brand.description}
                    </p>
                  )}
                </div>

                {/* Products Preview */}
                {brandProducts[brand.id] && brandProducts[brand.id].length > 0 && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Öne Çıkan Ürünler
                      </h4>
                      {brand.product_count > 5 && (
                        <span className="text-xs text-gray-500">
                          +{brand.product_count - 5} ürün daha
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {brandProducts[brand.id].map((product) => (
                        <Link
                          key={product.id}
                          to={`/urun/${product.slug}`}
                          className="group block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className="aspect-square bg-gray-50">
                            {product.product_images[0]?.image_url ? (
                              <img
                                src={product.product_images[0].image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h5 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600">
                              {product.name}
                            </h5>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-semibold text-gray-900">
                                ₺{product.base_price.toLocaleString('tr-TR')}
                              </span>
                              {product.stock > 0 ? (
                                <span className="text-xs text-green-600 font-medium">
                                  Stokta
                                </span>
                              ) : (
                                <span className="text-xs text-red-500 font-medium">
                                  Tükendi
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Products State */}
                {(!brandProducts[brand.id] || brandProducts[brand.id].length === 0) && (
                  <div className="p-6 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Henüz ürün eklenmemiş</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
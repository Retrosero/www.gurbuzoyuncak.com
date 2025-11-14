import React, { useState, useEffect } from 'react';
import { Grid, List, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useSearch } from '../hooks/useSearch';

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Use search hook for better API integration
  const {
    query,
    setQuery,
    results,
    isLoading,
    totalResults,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    categoriesWithProducts,
    updateFilters,
    clearFilters,
    getActiveFilters,
    removeFilter,
    performSearch
  } = useSearch();

  // State for filter UI
  const [showFilters, setShowFilters] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [brandsMap, setBrandsMap] = useState<Record<string, number>>({});
  
  // Filter states (UI only - actual filtering handled by search hook)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableBrands, setAvailableBrands] = useState<any[]>([]);

  // Filter functions for UI state synchronization with search hook
  const updateUIFilters = (newFilters: any) => {
    console.log('Update UI filters:', newFilters);
    
    // Convert UI state to search hook format
    const searchFilters = {};
    if (newFilters.categories) {
      searchFilters.categories = newFilters.categories;
    }
    if (newFilters.brands) {
      searchFilters.brands = newFilters.brands;
    }
    if (newFilters.priceRange) {
      searchFilters.minPrice = newFilters.priceRange[0];
      searchFilters.maxPrice = newFilters.priceRange[1];
    }
    if (newFilters.inStockOnly !== undefined) {
      searchFilters.inStock = newFilters.inStockOnly;
    }
    
    updateFilters(searchFilters);
  };
  
  const clearUIFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 10000]);
    setInStockOnly(false);
    clearFilters();
  };

  const removeUIFilter = (key: string) => {
    removeFilter(key);
  };

  // Fetch brands mapping for name->id conversion and available brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        
        const map: Record<string, number> = {};
        data?.forEach(brand => {
          map[brand.name.toUpperCase()] = brand.id;
        });
        setBrandsMap(map);
        setAvailableBrands(data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, []);

  // Fetch available categories (including subcategories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch all categories (including subcategories)
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('level, name');

        if (error) throw error;
        setAvailableCategories(data || []);
        console.log('Fetched categories:', data?.length);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Simple URL parameter handling
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const categorySlug = params.get('kategori');
    
    console.log('URL params:', { q, kategori: categorySlug });
    console.log('Available categories:', availableCategories.length);
    
    if (q) {
      setQuery(q);
    }
    
    if (categorySlug && availableCategories.length > 0) {
      console.log('Looking for category with slug:', categorySlug);
      const foundCategory = availableCategories.find(cat => cat.slug === categorySlug);
      console.log('Found category:', foundCategory);

      if (foundCategory) {
        // Include selected category and all descendant subcategories
        const descendantIds: number[] = [];
        const queue: number[] = [foundCategory.id];
        const byParent = (pid: number) => availableCategories.filter(c => c.parent_id === pid).map(c => c.id);
        while (queue.length) {
          const current = queue.shift()!;
          descendantIds.push(current);
          const children = byParent(current);
          children.forEach(id => queue.push(id));
        }
        const newCategories = descendantIds.map(id => id.toString());
        setSelectedCategories(newCategories);
        updateFilters({ categories: newCategories });
      } else {
        console.log('Category not found!');
      }
    }
  }, [location.search, availableCategories]);

  // Get active filters
  const activeFilters = getActiveFilters();
  const activeFiltersDisplay = activeFilters.map(f => {
    if (f.key === 'categories') {
      const ids = (f.value as string).split(',').map(s => s.trim()).filter(Boolean);
      const names = ids.map(id => {
        const c = availableCategories.find(cat => cat.id.toString() === id);
        return c ? c.name : id;
      });
      return { ...f, value: names.join(', ') };
    }
    if (f.key === 'brands') {
      const ids = (f.value as string).split(',').map(s => s.trim()).filter(Boolean);
      const names = ids.map(id => {
        const b = availableBrands.find(brand => brand.id.toString() === id);
        return b ? b.name : id;
      });
      return { ...f, value: names.join(', ') };
    }
    return f;
  });

  // Fetch recently viewed products
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('recently_viewed_products')
          .select(`
            product_id,
            products (
              id,
              name,
              slug,
              base_price,
              stock,
              product_images (image_url)
            )
          `)
          .eq('user_id', user.id)
          .order('last_viewed_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentlyViewed(data || []);
      } catch (error) {
        console.error('Error fetching recently viewed:', error);
      }
    };

    fetchRecentlyViewed();
  }, [user]);

  // Simple search handler using search hook
  const handleSearch = (searchQuery: string) => {
    console.log('Simple search:', searchQuery);
    setQuery(searchQuery);
    // Search hook will handle the actual search automatically
  };

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'İlgili' },
    { value: 'popularity', label: 'Popüler' },
    { value: 'price_asc', label: 'Fiyat (Düşük → Yüksek)' },
    { value: 'price_desc', label: 'Fiyat (Yüksek → Düşük)' },
    { value: 'name', label: 'İsim (A-Z)' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Ürün, kategori veya marka ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filtreler</h3>
                <button
                  onClick={clearUIFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Temizle
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Kategoriler</h4>
                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-2">
                  <div className="space-y-2">
                    {availableCategories
                      .filter(category => categoriesWithProducts.has(category.id))
                      .map(category => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newCategories = [...selectedCategories, category.id.toString()];
                              setSelectedCategories(newCategories);
                              updateUIFilters({ categories: newCategories });
                            } else {
                              const newCategories = selectedCategories.filter(id => id !== category.id.toString());
                              setSelectedCategories(newCategories);
                              updateUIFilters({ categories: newCategories });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-accent"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Markalar</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableBrands.map(brand => (
                    <label key={brand.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newBrands = [...selectedBrands, brand.id.toString()];
                            setSelectedBrands(newBrands);
                            updateUIFilters({ brands: newBrands });
                          } else {
                            const newBrands = selectedBrands.filter(id => id !== brand.id.toString());
                            setSelectedBrands(newBrands);
                            updateUIFilters({ brands: newBrands });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-accent"
                      />
                      <span className="ml-2 text-sm text-gray-700">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Fiyat Aralığı</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const newPriceRange: [number, number] = [parseInt(e.target.value) || 0, priceRange[1]];
                        setPriceRange(newPriceRange);
                        updateUIFilters({ priceRange: newPriceRange });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const newPriceRange: [number, number] = [priceRange[0], parseInt(e.target.value) || 10000];
                        setPriceRange(newPriceRange);
                        updateUIFilters({ priceRange: newPriceRange });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {priceRange[0]}₺ - {priceRange[1]}₺
                  </div>
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      updateUIFilters({ inStockOnly: e.target.checked });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-accent"
                  />
                  <span className="ml-2 text-sm text-gray-700">Sadece stokta olanlar</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {query ? (
                    <h1 className="text-2xl font-bold text-gray-900">
                      "{query}" için sonuçlar
                    </h1>
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">
                      Tüm Ürünler
                    </h1>
                  )}
                  <p className="text-gray-600 mt-1">
                    {totalResults} ürün bulundu
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtreler
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {query && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      Arama: {query}
                      <button onClick={() => handleSearch('')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {activeFiltersDisplay.map(filter => (
                    <span key={filter.key} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {filter.label}: {filter.value}
                      <button onClick={() => removeUIFilter(filter.key)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Products Count Display */}
            {!isLoading && results.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-blue-800 font-bold mb-2">📦 Toplam {results.length} Ürün Bulundu</h3>
                <p className="text-blue-700">Tüm aktif ürünler listelenmiştir</p>
              </div>
            )}

            {/* Results */}
            {!isLoading && results.length > 0 && (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {results.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Load More Button (for future pagination) */}
                {results.length < totalResults && (
                  <div className="text-center mt-8">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Daha Fazla Ürün Yükle
                    </button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!isLoading && query && results.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sonuç bulunamadı
                  </h3>
                  <p className="text-gray-600 mb-4">
                    "{query}" için hiçbir ürün bulunamadı. 
                    Farklı anahtar kelimeler deneyin.
                  </p>
                  <button
                    onClick={() => handleSearch('')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tüm Ürünleri Görüntüle
                  </button>
                </div>
              </div>
            )}

            {/* Recently Viewed */}
            {!query && recentlyViewed.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Son Görüntüledikleriniz
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {recentlyViewed.map(item => (
                    <ProductCard
                      key={item.product_id}
                      product={item.products}
                      viewMode="grid"
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
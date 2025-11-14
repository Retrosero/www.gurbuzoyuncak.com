import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, ArrowUpDown, Search } from 'lucide-react';
import SearchInput from '../components/SearchInput';
import SearchFilter from '../components/SearchFilter';
import ActiveFilters from '../components/ActiveFilters';
import ProductCard from '../components/ProductCard';
import { useSearch } from '../hooks/useSearch';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    query,
    setQuery,
    results,
    filters,
    isLoading,
    totalResults,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    updateFilters,
    clearFilters,
    getActiveFilters,
    removeFilter,
    performSearch
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);

  // Get active filters
  const activeFilters = getActiveFilters();

  // Initialize search from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlCategory = searchParams.get('category');
    const urlBrand = searchParams.get('brand');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    const urlInStock = searchParams.get('inStock');
    const urlFeatured = searchParams.get('featured');
    const urlSort = searchParams.get('sort');
    const urlView = searchParams.get('view');

    // Set query
    if (urlQuery) {
      setQuery(urlQuery);
    }

    // Set filters
    const newFilters: any = {};
    if (urlCategory) newFilters.category = urlCategory;
    if (urlBrand) newFilters.brand = urlBrand;
    if (urlMinPrice) newFilters.minPrice = parseInt(urlMinPrice);
    if (urlMaxPrice) newFilters.maxPrice = parseInt(urlMaxPrice);
    if (urlInStock === 'true') newFilters.inStock = true;
    if (urlFeatured === 'true') newFilters.featured = true;
    
    if (Object.keys(newFilters).length > 0) {
      updateFilters(newFilters);
    }

    // Set sort and view mode
    if (urlSort && ['relevance', 'price_asc', 'price_desc', 'name', 'popularity'].includes(urlSort)) {
      setSortBy(urlSort as any);
    }
    if (urlView && ['grid', 'list'].includes(urlView)) {
      setViewMode(urlView as any);
    }
  }, [searchParams, setQuery, updateFilters, setSortBy, setViewMode]);

  // Handle search from SearchInput
  const handleSearch = (searchQuery: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery);
    } else {
      newParams.delete('q');
    }
    
    setSearchParams(newParams);
    performSearch(searchQuery, filters);
  };

  // Update URL when filters change
  const handleFiltersChange = (newFilters: any) => {
    updateFilters(newFilters);
    
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false && value !== '') {
        newParams.set(key, String(value));
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    clearFilters();
    
    const newParams = new URLSearchParams(searchParams);
    ['category', 'brand', 'minPrice', 'maxPrice', 'inStock', 'featured'].forEach(param => {
      newParams.delete(param);
    });
    setSearchParams(newParams);
  };

  // Remove specific filter
  const handleRemoveFilter = (filterKey: string) => {
    removeFilter(filterKey);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterKey);
    setSearchParams(newParams);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as any);
    
    const newParams = new URLSearchParams(searchParams);
    if (newSortBy !== 'relevance') {
      newParams.set('sort', newSortBy);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };

  // Handle view mode change
  const handleViewModeChange = (newViewMode: string) => {
    setViewMode(newViewMode as any);
    
    const newParams = new URLSearchParams(searchParams);
    if (newViewMode !== 'grid') {
      newParams.set('view', newViewMode);
    } else {
      newParams.delete('view');
    }
    setSearchParams(newParams);
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/urunler')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Ürünlere Dön
            </button>
          </div>
          <SearchInput
            onSearch={handleSearch}
            placeholder="Ürün, kategori veya marka ara..."
            className="max-w-2xl mx-auto"
            autoFocus={!query}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <SearchFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              className="sticky top-8"
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {query ? (
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Search className="w-6 h-6 mr-2 text-gray-600" />
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
                      onClick={() => handleViewModeChange('grid')}
                      className={`p-3 rounded-lg transition-all duration-200 ease-in-out hover:shadow-md active:scale-95 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleViewModeChange('list')}
                      className={`p-3 rounded-lg transition-all duration-200 ease-in-out hover:shadow-md active:scale-95 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ease-in-out hover:shadow-md hover:border-accent/50 focus:shadow-lg"
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
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all duration-200 ease-in-out hover:shadow-md active:scale-95"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtreler
                    {activeFilters.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ActiveFilters
                    filters={activeFilters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearAllFilters}
                  />
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

                {/* Pagination (for future implementation) */}
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
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sonuç bulunamadı
                  </h3>
                  <p className="text-gray-600 mb-4">
                    "{query}" için hiçbir ürün bulunamadı. 
                    Farklı anahtar kelimeler deneyin.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSearch('')}
                      className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Tüm Ürünleri Görüntüle
                    </button>
                    <button
                      onClick={() => navigate('/urunler')}
                      className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Ürünlere Dön
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* No Query State */}
            {!isLoading && !query && results.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Arama yapın
                  </h3>
                  <p className="text-gray-600">
                    Yukarıdaki arama kutusunu kullanarak ürün, kategori veya marka arayın.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
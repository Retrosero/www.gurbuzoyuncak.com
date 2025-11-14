import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Filter, RotateCcw } from 'lucide-react';
import { SearchFilters } from '../hooks/useSearch';
import { supabase } from '../lib/supabase';

interface SearchFilterProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  className?: string;
  showBrandNameFilter?: boolean;
}

interface Category {
  id: number;
  name: string;
  parent_id?: number;
}

interface Brand {
  id: number;
  name: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = "",
  showBrandNameFilter = true
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
    availability: true
  });

  // Fetch categories and brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, parent_id')
          .eq('is_active', true)
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch brands
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        if (brandsError) throw brandsError;
        setBrands(brandsData || []);

        // Get price range from products
        const { data: priceData } = await supabase
          .from('products')
          .select('base_price')
          .eq('is_active', true);

        if (priceData && priceData.length > 0) {
          const prices = priceData.map(p => p.base_price);
          setPriceRange({
            min: Math.min(...prices),
            max: Math.max(...prices)
          });
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchData();
  }, []);

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle category filter (multiple selection)
  const handleCategoryChange = (categoryId: string) => {
    const currentCategories = filters.categories || []
    if (currentCategories.includes(categoryId)) {
      // Remove category
      const newCategories = currentCategories.filter(id => id !== categoryId)
      onFiltersChange({ categories: newCategories.length > 0 ? newCategories : undefined })
    } else {
      // Add category
      const newCategories = [...currentCategories, categoryId]
      onFiltersChange({ categories: newCategories })
    }
  };

  // Handle brand filter (multiple selection)
  const handleBrandChange = (brandId: string, brandName: string) => {
    const currentBrands = filters.brands || []
    
    let newFilters: Partial<SearchFilters> = {};
    
    // Handle brand ID filter
    if (currentBrands.includes(brandId)) {
      // Remove brand ID
      const newBrands = currentBrands.filter(id => id !== brandId)
      if (newBrands.length > 0) {
        newFilters.brands = newBrands;
      }
    } else {
      // Add brand ID
      newFilters.brands = [...currentBrands, brandId];
    }
    
    onFiltersChange(newFilters);
  };

  // Handle price range change
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    onFiltersChange({
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue
    });
  };

  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    onFiltersChange({ inStock: !filters.inStock });
  };

  // Handle featured toggle
  const handleFeaturedToggle = () => {
    onFiltersChange({ featured: !filters.featured });
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.brands && filters.brands.length > 0) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.inStock) count++;
    if (filters.featured) count++;
    return count;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Filtreler</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Kategori</span>
          {expandedSections.category ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.category && (
          <div className="px-4 pb-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {categories.map(category => {
              const isSelected = (filters.categories || []).includes(category.id.toString())
              return (
                <label key={category.id} className="flex items-center py-1 hover:bg-gray-50 rounded px-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryChange(category.id.toString())}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">{category.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Marka</span>
          {expandedSections.brand ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.brand && (
          <div className="px-4 pb-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {brands.map(brand => {
              const isSelected = (filters.brands || []).includes(brand.id.toString())
              
              return (
                <label key={brand.id} className="flex items-center py-1 hover:bg-gray-50 rounded px-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleBrandChange(brand.id.toString(), brand.name)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">{brand.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Fiyat Aralığı</span>
          {expandedSections.price ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.price && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder={`${priceRange.min}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Maksimum
                </label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder={`${priceRange.max}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <div className="text-sm text-gray-600">
                {filters.minPrice && filters.maxPrice 
                  ? `₺${filters.minPrice} - ₺${filters.maxPrice}`
                  : filters.minPrice 
                  ? `₺${filters.minPrice} ve üzeri`
                  : `₺${filters.maxPrice} ve altı`
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* Availability */}
      <div>
        <button
          onClick={() => toggleSection('availability')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <span className="font-medium text-gray-900">Stok Durumu</span>
          {expandedSections.availability ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.availability && (
          <div className="px-4 pb-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock || false}
                onChange={handleAvailabilityToggle}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">Sadece stokta olan ürünler</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured || false}
                onChange={handleFeaturedToggle}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">Öne çıkan ürünler</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
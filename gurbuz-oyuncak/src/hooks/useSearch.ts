import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface SearchFilters {
  categories?: string[];
  brands?: string[];
  brandNames?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  stock: number;
  brand?: string;
  category?: string;
  image_url?: string;
  is_active: boolean;
}

export interface SearchSuggestion {
  term: string;
  search_count: number;
  category?: string;
}

export const useSearch = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name' | 'popularity'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<Set<number>>(new Set());

  // Simple debounce without useCallback to avoid dependency issues
  const debounceTimeout = useRef<NodeJS.Timeout>();

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    setIsLoading(true);
    
    console.log('🔍 performSearch called:', { searchQuery, searchFilters });

    try {
      let queryBuilder = supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          base_price,
          stock,
          is_active,
          category_id,
          brand_id,
          brands(name)
        `)
        .eq('is_active', true);
      
      console.log('📦 QueryBuilder created:', { searchQuery, searchFilters });

      // Text search
      if (searchQuery.trim()) {
        queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`);
      }

      // Filters
      if (searchFilters.categories && searchFilters.categories.length > 0) {
        queryBuilder = queryBuilder.in('category_id', searchFilters.categories);
      }

      if (searchFilters.brands && searchFilters.brands.length > 0) {
        queryBuilder = queryBuilder.in('brand_id', searchFilters.brands);
      }

      // Note: brandNames filter is handled in ProductsPage.tsx by converting names to IDs

      if (searchFilters.minPrice !== undefined) {
        queryBuilder = queryBuilder.gte('base_price', searchFilters.minPrice);
      }

      if (searchFilters.maxPrice !== undefined) {
        queryBuilder = queryBuilder.lte('base_price', searchFilters.maxPrice);
      }

      if (searchFilters.inStock) {
        queryBuilder = queryBuilder.gt('stock', 0);
      }

      if (searchFilters.featured) {
        queryBuilder = queryBuilder.eq('is_featured', true);
      }

      // Sorting
      switch (sortBy) {
        case 'price_asc':
          queryBuilder = queryBuilder.order('base_price', { ascending: true });
          break;
        case 'price_desc':
          queryBuilder = queryBuilder.order('base_price', { ascending: false });
          break;
        case 'name':
          queryBuilder = queryBuilder.order('name', { ascending: true });
          break;
        case 'popularity':
          queryBuilder = queryBuilder.order('view_count', { ascending: false });
          break;
        default:
          // Relevance search - already handled by textSearch
          break;
      }

      console.log('🔄 Executing query...');
      const { data, error, count } = await queryBuilder;
      console.log('📊 Query result:', { dataCount: data?.length, error, count });

      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }

      const processedResults: SearchResult[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        base_price: item.base_price,
        stock: item.stock,
        is_active: item.is_active,
        category: item.category_id,
        brand: item.brands?.name || item.brand_id
      })) || [];
      
      console.log('✅ Setting results:', { processedCount: processedResults.length, results: processedResults.slice(0, 3) });
      setResults(processedResults);
      setTotalResults(count || 0);

      // Extract category IDs that have products
      const categoryIds = new Set<number>();
      data?.forEach(product => {
        if (product.category_id) {
          categoryIds.add(product.category_id);
        }
      });
      setCategoriesWithProducts(categoryIds);
      console.log('Categories with products:', categoryIds);

      // Save search query if user is logged in
      if (user && searchQuery.trim()) {
        await saveSearchQuery(searchQuery, processedResults.length, searchFilters);
      }

    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearchQuery = async (searchQuery: string, resultsCount: number, searchFilters: SearchFilters) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('save_search_query', {
        p_user_id: user.id,
        p_query_text: searchQuery,
        p_results_count: resultsCount,
        p_search_type: 'general',
        p_filters_applied: searchFilters
      });

      if (error) {
        console.error('Error saving search query:', error);
      }
    } catch (error) {
      console.error('Error saving search query:', error);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('term, search_count, category')
        .ilike('term', `%${searchQuery}%`)
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(8);

      if (error) throw error;

      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const getPopularSearches = useCallback(async () => {
    try {
      // For now, return mock data to prevent errors
      // In production, this should fetch from database
      return [
        { term: 'oyuncak', search_count: 100 },
        { term: 'bebek', search_count: 85 },
        { term: 'lego', search_count: 75 },
        { term: 'araba', search_count: 60 },
        { term: 'top', search_count: 45 }
      ];
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      return [];
    }
  }, []);

  // Effect to perform search when query or filters change
  useEffect(() => {
    console.log('🔄 Main search effect triggered:', { query, filters, sortBy });
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      console.log('⏰ Executing search...');
      performSearch(query, filters);
    }, 300);
  }, [query, filters, sortBy]); // Only depend on actual values, not the function

  // Initial search on mount to show all products
  useEffect(() => {
    console.log('🚀 Initial search effect triggered');
    performSearch('', {});
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get active filters as array
  const getActiveFilters = useCallback(() => {
    const activeFilters = [];
    
    if (filters.categories && filters.categories.length > 0) {
      activeFilters.push({ 
        key: 'categories', 
        label: 'Kategoriler', 
        value: filters.categories.join(', ') 
      });
    }
    if (filters.brands && filters.brands.length > 0) {
      activeFilters.push({ 
        key: 'brands', 
        label: 'Markalar', 
        value: filters.brands.join(', ') 
      });
    }
    if (filters.brandNames && filters.brandNames.length > 0) {
      activeFilters.push({ 
        key: 'brandNames', 
        label: 'Markalar', 
        value: filters.brandNames.join(', ') 
      });
    }
    if (filters.minPrice !== undefined) activeFilters.push({ key: 'minPrice', label: 'Min Fiyat', value: filters.minPrice });
    if (filters.maxPrice !== undefined) activeFilters.push({ key: 'maxPrice', label: 'Max Fiyat', value: filters.maxPrice });
    if (filters.inStock) activeFilters.push({ key: 'inStock', label: 'Stokta Var', value: 'true' });
    if (filters.featured) activeFilters.push({ key: 'featured', label: 'Öne Çıkan', value: 'true' });
    
    return activeFilters;
  }, [filters]);

  // Remove specific filter
  const removeFilter = useCallback((filterKey: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey as keyof SearchFilters];
      return newFilters;
    });
  }, []);

  return {
    query,
    setQuery,
    results,
    suggestions,
    filters,
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
    performSearch, // Direct call without debounce for simple searches
    fetchSuggestions,
    getPopularSearches
  };
};

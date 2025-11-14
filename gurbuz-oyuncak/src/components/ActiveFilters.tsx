import React from 'react';
import { X } from 'lucide-react';

interface ActiveFilter {
  key: string;
  label: string;
  value: string | number | boolean;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onRemoveFilter: (filterKey: string) => void;
  onClearAll: () => void;
  className?: string;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  className = ""
}) => {
  if (filters.length === 0) return null;

  const formatFilterValue = (value: string | number | boolean): string => {
    if (typeof value === 'boolean') {
      return value ? 'Evet' : 'Hayır';
    }
    return String(value);
  };

  const getFilterColor = (key: string): string => {
    switch (key) {
      case 'category':
        return 'bg-[#40E0D0] text-white';
      case 'brand':
        return 'bg-green-100 text-green-800';
      case 'minPrice':
        return 'bg-purple-100 text-purple-800';
      case 'maxPrice':
        return 'bg-purple-100 text-purple-800';
      case 'inStock':
        return 'bg-orange-100 text-orange-800';
      case 'featured':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Aktif Filtreler</h4>
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Tümünü Temizle
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <div
            key={filter.key}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getFilterColor(filter.key)}`}
          >
            <span className="font-medium">{filter.label}:</span>
            <span>{formatFilterValue(filter.value)}</span>
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveFilters;
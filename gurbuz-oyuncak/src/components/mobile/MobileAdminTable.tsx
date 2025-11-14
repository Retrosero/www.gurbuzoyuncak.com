import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useTouchGestures, useDeviceDetection } from '@/hooks/use-mobile-utils';

interface MobileTableColumn {
  key: string;
  title: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface MobileTableProps {
  columns: MobileTableColumn[];
  data: any[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onRowAction?: (action: string, row: any) => void;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: {
    current: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  mobileCardView?: boolean;
  swipeActions?: {
    left?: Array<{
      label: string;
      icon: React.ReactNode;
      action: string;
      variant?: 'default' | 'destructive';
    }>;
    right?: Array<{
      label: string;
      icon: React.ReactNode;
      action: string;
      variant?: 'default' | 'destructive';
    }>;
  };
}

export const MobileAdminTable: React.FC<MobileTableProps> = ({
  columns,
  data,
  loading = false,
  error,
  onRefresh,
  onRowAction,
  searchable = true,
  filterable = false,
  pagination,
  mobileCardView = true,
  swipeActions = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeSwipe, setActiveSwipe] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  
  const { isMobile, isTablet } = useDeviceDetection();
  const { isSwipeLeft, isSwipeRight, swipeHandlers } = useTouchGestures(tableRef);

  const filteredData = data.filter(row => {
    const matchesSearch = !searchTerm || 
      columns.some(col => 
        String(row[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
      if (!value) return true;
      return String(row[key] || '').toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });

  const handleRowSwipe = (rowId: string, direction: 'left' | 'right') => {
    setActiveSwipe(rowId);
    
    if (direction === 'left' && swipeActions.left?.[0]) {
      onRowAction?.(swipeActions.left[0].action, data.find(d => d.id === rowId));
    } else if (direction === 'right' && swipeActions.right?.[0]) {
      onRowAction?.(swipeActions.right[0].action, data.find(d => d.id === rowId));
    }
  };

  const renderMobileCard = (row: any) => (
    <Card 
      key={row.id} 
      className={`mb-3 transition-all duration-200 ${
        activeSwipe === row.id ? 'transform translate-x-8' : ''
      }`}
      {...swipeHandlers}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {columns.slice(0, 2).map(col => (
              <div key={col.key} className="mb-1">
                <span className="text-sm font-medium text-gray-600">
                  {col.title}:
                </span>
                <div className="text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRowAction?.('view', row)}
            className="p-2"
          >
            <MoreHorizontal size={16} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          {swipeActions.left?.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={() => onRowAction?.(action.action, row)}
              className="flex-1 text-xs"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map(col => (
              <th 
                key={col.key} 
                className="text-left p-3 font-medium text-gray-700"
                style={{ width: col.width }}
              >
                {col.title}
                {col.sortable && <span className="ml-1">↕</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map(row => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              {columns.map(col => (
                <td key={col.key} className="p-3">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onRefresh} variant="outline">
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {searchable && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        <div className="flex gap-2">
          {filterable && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filtrele
            </Button>
          )}
          
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && filterable && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns.filter(col => col.filterable).map(col => (
                <div key={col.key}>
                  <label className="block text-sm font-medium mb-1">
                    {col.title}
                  </label>
                  <Input
                    placeholder={`${col.title} filtrele`}
                    value={activeFilters[col.key] || ''}
                    onChange={(e) => 
                      setActiveFilters(prev => ({
                        ...prev,
                        [col.key]: e.target.value
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Card View */}
      {isMobile && mobileCardView && (
        <div className="md:hidden">
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Kayıt bulunamadı
              </CardContent>
            </Card>
          ) : (
            filteredData.map(renderMobileCard)
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {renderDesktopTable()}

      {/* Pagination */}
      {pagination && filteredData.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">
            Toplam {filteredData.length} kayıt
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current <= 1}
              onClick={() => pagination.onPageChange(pagination.current - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            
            <span className="px-3 py-1 text-sm">
              {pagination.current} / {pagination.total}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current >= pagination.total}
              onClick={() => pagination.onPageChange(pagination.current + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Kayıt bulunamadı</p>
            {onRowAction && (
              <Button onClick={() => onRowAction('create', null)}>
                <Plus size={16} className="mr-2" />
                Yeni Ekle
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileAdminTable;
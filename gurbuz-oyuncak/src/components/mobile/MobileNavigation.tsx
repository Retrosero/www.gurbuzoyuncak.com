import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X,
  Bell,
  Search,
  Settings,
  LogOut,
  ChevronRight,
  Grid3X3,
  BarChart3,
  Users,
  Tag,
  Warehouse,
  Truck,
  MessageSquare
} from 'lucide-react';
import { useDeviceDetection } from '@/hooks/use-mobile-utils';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: NavigationItem[];
  adminOnly?: boolean;
}

interface MobileNavigationProps {
  userRole?: 'admin' | 'dealer' | 'customer';
  notificationCount?: number;
  onLogout?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  userRole = 'customer',
  notificationCount = 0,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const { isMobile } = useDeviceDetection();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      icon: <Home size={24} />,
      path: '/'
    },
    {
      id: 'products',
      label: 'Ürünler',
      icon: <Package size={24} />,
      path: '/products'
    },
    {
      id: 'categories',
      label: 'Kategoriler',
      icon: <Grid3X3 size={24} />,
      path: '/categories',
      children: [
        { id: 'toys', label: 'Oyuncaklar', icon: <Package size={20} />, path: '/categories/toys' },
        { id: 'games', label: 'Oyunlar', icon: <Package size={20} />, path: '/categories/games' },
        { id: 'books', label: 'Kitaplar', icon: <Package size={20} />, path: '/categories/books' }
      ]
    },
    {
      id: 'cart',
      label: 'Sepet',
      icon: <ShoppingCart size={24} />,
      path: '/cart',
      badge: 3 // Example badge count
    },
    {
      id: 'favorites',
      label: 'Favoriler',
      icon: <Heart size={24} />,
      path: '/favorites'
    },
    {
      id: 'dealer',
      label: 'Bayi Paneli',
      icon: <BarChart3 size={24} />,
      path: '/dealer',
      adminOnly: true,
      children: [
        { id: 'dealer-products', label: 'Ürünler', icon: <Package size={20} />, path: '/dealer/products' },
        { id: 'dealer-orders', label: 'Siparişler', icon: <Truck size={20} />, path: '/dealer/orders' },
        { id: 'dealer-pricing', label: 'Fiyatlandırma', icon: <Tag size={20} />, path: '/dealer/pricing' }
      ]
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <Settings size={24} />,
      path: '/admin',
      adminOnly: true,
      children: [
        { id: 'admin-products', label: 'Ürün Yönetimi', icon: <Package size={20} />, path: '/admin/products' },
        { id: 'admin-users', label: 'Kullanıcılar', icon: <Users size={20} />, path: '/admin/users' },
        { id: 'admin-orders', label: 'Siparişler', icon: <Truck size={20} />, path: '/admin/orders' },
        { id: 'admin-categories', label: 'Kategoriler', icon: <Grid3X3 size={20} />, path: '/admin/categories' },
        { id: 'admin-inventory', label: 'Stok', icon: <Warehouse size={20} />, path: '/admin/inventory' },
        { id: 'admin-reports', label: 'Raporlar', icon: <BarChart3 size={20} />, path: '/admin/reports' },
        { id: 'admin-messages', label: 'Mesajlar', icon: <MessageSquare size={20} />, path: '/admin/messages' }
      ]
    }
  ];

  const customerNavigation = navigationItems.filter(item => !item.adminOnly);
  const adminNavigation = userRole === 'admin' ? navigationItems : customerNavigation;

  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = adminNavigation.find(item => 
      item.path === currentPath || 
      item.children?.some(child => child.path === currentPath)
    );
    
    if (currentItem) {
      setActiveTab(currentItem.id);
    }
  }, [location.pathname, adminNavigation]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const renderNavItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = location.pathname === item.path || 
      (item.children?.some(child => child.path === location.pathname));

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={`w-full justify-start h-12 ${level > 0 ? 'text-sm' : ''} transition-all duration-200`}
          style={{ 
            backgroundColor: isActive ? '#00a8cb' : 'transparent',
            color: isActive ? 'white' : level > 0 ? '#4b5563' : '#1f2937',
            borderRadius: '12px'
          }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
        >
          <div className="flex items-center flex-1">
            {item.icon}
            <span className="ml-3 flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant="destructive" className="ml-2">
                {item.badge}
              </Badge>
            )}
          </div>
          {hasChildren && (
            <ChevronRight 
              size={16} 
              className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          )}
        </Button>

        {/* Submenu */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isMobile) {
    return null; // Desktop navigation handled by other components
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t z-40" style={{ backgroundColor: '#0cc0df', borderColor: '#00a8cb' }}>
        <div className="grid grid-cols-5 h-16">
          {customerNavigation.slice(0, 5).map(item => (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 ${
                activeTab === item.id ? 'text-white' : 'text-cyan-50 hover:text-white'
              }`}
              style={{ 
                backgroundColor: activeTab === item.id ? '#00a8cb' : 'transparent',
                borderRadius: '12px',
                margin: '4px'
              }}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Floating Action Button for Menu */}
      <Button
        className="fixed bottom-20 right-4 z-50 h-14 w-14 shadow-lg text-white hover:opacity-90 transition-all duration-200"
        style={{ backgroundColor: '#ff66c4', borderRadius: '12px' }}
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </Button>

      {/* Full Screen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#00a8cb', backgroundColor: '#0cc0df' }}>
            <h2 className="text-xl font-semibold text-white">Menü</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-lg">
              <X size={24} />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0cc0df' }}>
                <User size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Gürbüz Oyuncak</p>
                <p className="text-sm text-gray-600">
                  {userRole === 'admin' ? 'Yönetici' : 
                   userRole === 'dealer' ? 'Bayi' : 'Müşteri'}
                </p>
              </div>
              {notificationCount > 0 && (
                <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-100">
                  <Bell size={20} />
                  <Badge variant="destructive" className="ml-1">
                    {notificationCount}
                  </Badge>
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {adminNavigation.map(item => renderNavItem(item))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t space-y-2" style={{ borderColor: '#e5e7eb' }}>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl hover:bg-gray-50 transition-all duration-200"
              onClick={() => handleNavigation('/profile')}
            >
              <User size={20} className="mr-3" />
              Profil
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl hover:bg-gray-50 transition-all duration-200"
              onClick={() => handleNavigation('/settings')}
            >
              <Settings size={20} className="mr-3" />
              Ayarlar
            </Button>
            {onLogout && (
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                onClick={onLogout}
              >
                <LogOut size={20} className="mr-3" />
                Çıkış Yap
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Push content up when menu is open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default MobileNavigation;
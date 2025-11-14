import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  FolderTree, 
  Tag, 
  Users, 
  Gift, 
  Percent,
  Award,
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  AlertTriangle,
  ShoppingCart,
  BarChart3,
  Mail,
  Bell,
  TrendingDown,
  Shield,
  Activity,
  Database,
  UserCheck,
  Heart,
  User,
  TrendingUp,
  Eye,
  MousePointer,
  Target,
  PieChart,
  ShoppingBag as CartIcon,
  Image as ImageIcon
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function AdminLayout({ children, showSidebar = true }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Ürünler', path: '/admin/urunler' },
    { icon: ShoppingBag, label: 'Siparişler', path: '/admin/siparisler' },
    { icon: FolderTree, label: 'Kategoriler', path: '/admin/kategoriler' },
    { icon: Tag, label: 'Markalar', path: '/admin/markalar' },
    { icon: AlertTriangle, label: 'Stok Uyarıları', path: '/admin/stok-uyarilari' },
    { icon: Users, label: 'Müşteriler', path: '/admin/musteriler' },
    { icon: Gift, label: 'Kuponlar', path: '/admin/kuponlar' },
    { icon: Percent, label: 'Kampanyalar', path: '/admin/kampanyalar' },
    { icon: ImageIcon, label: 'Banner Yönetimi', path: '/admin/bannerlar' },
    { icon: CartIcon, label: 'Toplu İndirimler', path: '/admin/toplu-indirim' },
    { icon: Award, label: 'Sadakat & Puan', path: '/admin/sadakat' },
    { icon: BarChart3, label: 'Raporlar', path: '/admin/reports' },
    { icon: Mail, label: 'Email Şablonları', path: '/admin/email-templates' },
    { icon: Bell, label: 'Bildirim Merkezi', path: '/admin/notification-center' },
    { icon: TrendingDown, label: 'Fiyat Uyarıları', path: '/admin/price-alerts' },
    { icon: FileText, label: 'XML Senkronizasyon', path: '/admin/xml/yukle' },
    // ADMİN KULLANICI TAKİBİ SİSTEMİ
    { icon: User, label: 'Kullanıcı Analytics', path: '/admin/user-analytics' },
    { icon: Heart, label: 'Favori Raporları', path: '/admin/favorites-report' },
    { icon: ShoppingCart, label: 'Sepet Analizi', path: '/admin/cart-analysis' },
    { icon: MousePointer, label: 'Davranış Analizi', path: '/admin/user-behavior' },
    { icon: TrendingUp, label: 'Engagement Metrikleri', path: '/admin/engagement-metrics' },
    // Kullanıcı Yönetimi ve Güvenlik
    { icon: UserCheck, label: 'Kullanıcılar', path: '/admin/kullanicilar' },
    { icon: Shield, label: 'Rol Yönetimi', path: '/admin/roller' },
    { icon: Activity, label: 'Aktivite Logları', path: '/admin/aktivite-loglari' },
    { icon: Shield, label: 'Güvenlik Logları', path: '/admin/guvenlik-loglari' },
    { icon: Database, label: 'Yedekleme', path: '/admin/yedekleme' },
    { icon: Settings, label: 'Ayarlar', path: '/admin/ayarlar' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'lg:w-20 w-64'}
          bg-[#0cc0df] text-white transition-all duration-200 flex flex-col
        `}>
        <div className="p-3 lg:p-4 flex items-center justify-between border-b border-[#00a8cb]">
          {sidebarOpen && (
            <div>
              <h2 className="font-bold text-base lg:text-lg">Gürbüz Oyuncak</h2>
              <p className="text-xs text-cyan-200">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#00a8cb] rounded-lg transition-all duration-200"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-2 lg:py-4 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Mobilde menü tıklandığında sidebar'ı kapat
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
                className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 mx-2 rounded-lg transition-all duration-200 text-sm lg:text-base ${
                  isActive 
                    ? 'bg-[#00a8cb] text-white' 
                    : 'text-white hover:bg-[#00a8cb]'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 lg:p-4 border-t border-[#00a8cb]">
          {sidebarOpen && user && (
            <div className="mb-3">
              <p className="text-xs lg:text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-cyan-200">Administrator</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 lg:gap-3 w-full px-3 lg:px-4 py-2 text-white hover:bg-[#00a8cb] rounded-lg transition-all duration-200 text-sm lg:text-base"
            title={!sidebarOpen ? 'Çıkış' : ''}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-3 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={24} />
            </button>
            
            <h1 className="text-lg lg:text-2xl font-bold text-gray-800 truncate">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
            </h1>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-xs lg:text-sm text-gray-600">
                {new Date().toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

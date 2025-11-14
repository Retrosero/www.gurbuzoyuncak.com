import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { 
  LayoutDashboard, 
  Wallet, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Menu,
  X,
  Store,
  Award,
  Package
} from 'lucide-react'

interface BayiLayoutProps {
  children: React.ReactNode
}

const vipLevelNames = ['BRONZ', 'GÜMÜŞ', 'ALTIN', 'PLATİN', 'ELMAS']

export default function BayiLayout({ children }: BayiLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, signOut } = useAuth()
  const { profile, isApprovedBayi } = useProfile()
  const navigate = useNavigate()
  const location = useLocation()

  // useProfile hook'unu kullanıyoruz, ayrı fetch yapmaya gerek yok

  const handleLogout = async () => {
    await signOut()
    navigate('/bayi')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/bayi/dashboard' },
    { icon: Package, label: 'Ürünler', path: '/bayi/urunler' },
    { icon: Wallet, label: 'Bakiye Yönetimi', path: '/bayi/bakiye' },
    { icon: ShoppingBag, label: 'Siparişlerim', path: '/bayi/siparisler' },
    { icon: Settings, label: 'Ayarlar', path: '/bayi/ayarlar' },
  ]

  const getVIPLevelName = (level: number) => {
    return vipLevelNames[level - 1] || 'BRONZ'
  }

  const getVIPColor = (level: number) => {
    const colors = [
      'text-orange-400', // BRONZ
      'text-gray-300',   // GÜMÜŞ
      'text-yellow-400', // ALTIN
      'text-blue-300',   // PLATİN
      'text-cyan-300'    // ELMAS
    ]
    return colors[level - 1] || 'text-orange-400'
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-800 text-white transition-all duration-200 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          {sidebarOpen && (
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Store size={24} />
                Bayi Paneli
              </h2>
              <p className="text-xs text-blue-200">B2B Yönetim Sistemi</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Bayi Bilgileri */}
        {sidebarOpen && profile && (
          <div className="p-4 bg-blue-900/50 border-b border-blue-700">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-blue-300">Firma</p>
                <p className="font-semibold text-sm">{profile.dealer_company_name || profile.company_name || profile.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-blue-300">Bakiye</p>
                <p className="font-bold text-lg text-green-400">
                  ₺{profile.balance?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className={getVIPColor(profile.vip_level)} />
                <span className={`text-sm font-semibold ${getVIPColor(profile.vip_level)}`}>
                  {getVIPLevelName(profile.vip_level)} ÜYE
                </span>
              </div>
              {profile.bayi_discount_percentage > 0 && (
                <div>
                  <p className="text-xs text-blue-300">İndirim Oranı</p>
                  <p className="text-sm font-semibold text-yellow-400">
                    %{profile.bayi_discount_percentage}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-blue-700">
          {sidebarOpen && user && (
            <div className="mb-3">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-blue-300">Bayi Hesabı</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-blue-100 hover:bg-blue-700 rounded-lg transition"
            title={!sidebarOpen ? 'Çıkış' : ''}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Bayi Paneli'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
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
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

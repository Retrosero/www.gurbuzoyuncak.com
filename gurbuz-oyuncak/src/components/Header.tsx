import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, Search, X, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types'
import SearchInput from './SearchInput'
import WhatsAppWidget from './WhatsAppWidget'

interface CategoryWithChildren extends Category {
  children?: Category[]
}

export default function Header() {
  const { user } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMobileCategories, setShowMobileCategories] = useState(false)
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<number[]>([])
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    // Tüm aktif kategorileri yükle
    const { data: allCats } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index')

    if (allCats && allCats.length > 0) {
      const mainCategories = allCats.filter((c: any) => c.level === 0)
      const childrenMap = new Map<number, any[]>()
      const parentMap = new Map<number, number | null>()
      allCats.forEach((c: any) => {
        parentMap.set(c.id, c.parent_id ?? null)
        const list = childrenMap.get(c.parent_id ?? -1) || []
        list.push(c)
        childrenMap.set(c.parent_id ?? -1, list)
      })

      const categoriesWithChildren = mainCategories.map((mainCat: any) => ({
        ...mainCat,
        children: (childrenMap.get(mainCat.id) || []).filter(ch => ch.is_active)
      }))
      setCategories(categoriesWithChildren)

      // Ürünleri olan kategorileri hesapla ve üst kategorilere propagate et
      const { data: prodCats } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_active', true)

      const set = new Set<number>()
      ;(prodCats || []).forEach((row: any) => {
        let cur: number | null = row.category_id
        while (cur) {
          if (set.has(cur)) break
          set.add(cur)
          cur = parentMap.get(cur) ?? null
        }
      })
      setCategoriesWithProducts(set)
    }
  }

  const onCategoryMouseEnter = (id: number) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
    setHoveredCategoryId(id)
  }

  const onCategoryMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredCategoryId(null)
    }, 200)
    setDropdownTimeout(timeout)
  }

  return (
    <header className="bg-gray-50 shadow-md sticky top-0 z-50">
      {/* Top Bar - Desktop */}
      <div className="bg-blue-700 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between text-xs md:text-sm">
          <span>Gürbüz Oyuncak - Türkiye'nin Oyuncak Merkezi</span>
          <div className="flex gap-2 md:gap-4">
            <span className="text-xs md:text-sm">Müşteri Hizmetleri: 0850 123 45 67</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-3 text-blue-700 hover:bg-gray-100 rounded-xl transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="mobile-text-lg md:text-3xl font-bold text-blue-700 flex-shrink-0">
            <span className="hidden sm:inline">Gürbüz Oyuncak</span>
            <span className="sm:hidden">G.O.</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <SearchInput
              onSearch={(query) => navigate(`/arama?q=${encodeURIComponent(query)}`)}
              placeholder="Ürün ara..."
              className="w-full"
              showSuggestions={true}
            />
          </div>

          {/* User Actions - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link to={user ? "/profil" : "/giris"} className="flex items-center gap-2 hover:text-blue-700 transition">
              <User size={20} />
              <span className="text-sm">{user ? 'Hesabım' : 'Giriş'}</span>
            </Link>
            <Link to="/sepet" className="flex items-center gap-2 hover:text-blue-700 relative transition">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
              <span className="text-sm">Sepet</span>
            </Link>
          </div>

          {/* Mobile User & Cart Icons */}
          <div className="md:hidden flex items-center gap-2">
            <Link to={user ? "/profil" : "/giris"} className="p-3 text-blue-700 hover:bg-gray-100 rounded-xl transition-all duration-300 ease-in-out hover:shadow-md active:scale-95">
              <User size={24} />
            </Link>
            <Link to="/sepet" className="relative p-3 text-blue-700 hover:bg-gray-100 rounded-xl transition-all duration-300 ease-in-out hover:shadow-md active:scale-95">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Ürün ara..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <nav className="text-white hidden md:block relative" style={{ backgroundColor: '#0cc0df' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 py-3">
            {categories.filter(cat => categoriesWithProducts.has(cat.id)).map(cat => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => onCategoryMouseEnter(cat.id)}
                onMouseLeave={onCategoryMouseLeave}
              >
                <Link to={`/urunler?kategori=${cat.slug}`} className="hover:text-blue-200 transition duration-200 font-medium">
                  {cat.name}
                </Link>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-6">
              <Link to="/cok-satanlar" className="hover:text-blue-200 transition duration-200 font-medium">Çok Satanlar</Link>
              <Link to="/kampanyalar" className="hover:text-blue-200 transition duration-200 font-medium">Kampanyalar</Link>
              <Link to="/iletisim" className="hover:text-blue-200 transition duration-200 font-medium">İletişim</Link>
            </div>
          </div>
          {hoveredCategoryId !== null && (function() {
            const cat = categories.find(c => c.id === hoveredCategoryId)
            if (!cat || !cat.children || cat.children.length === 0) return null
            const filteredChildren = cat.children.filter(sub => categoriesWithProducts.has(sub.id))
            return (
              <div
                onMouseEnter={() => onCategoryMouseEnter(cat.id)}
                onMouseLeave={onCategoryMouseLeave}
                className="absolute left-0 right-0 bg-white text-gray-800 shadow-xl border-t border-gray-200 z-50"
                style={{ maxHeight: '70vh' }}
              >
                <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #0cc0df, #00a8cb)' }}>
                  <div className="container mx-auto px-4 flex items-center justify-between">
                    <h3 className="text-white text-lg font-bold">{cat.name}</h3>
                    <div className="text-blue-100 text-sm">{filteredChildren.length} Alt Kategori</div>
                  </div>
                </div>
                <div className="container mx-auto px-6 py-6">
                  <div
                    className="grid gap-6 overflow-y-auto"
                    style={{
                      gridAutoFlow: 'column',
                      gridTemplateRows: 'repeat(3, min-content)'
                    }}
                  >
                    {filteredChildren.map(sub => (
                      <Link
                        key={sub.id}
                        to={`/urunler?kategori=${sub.slug}`}
                        className="font-medium text-gray-800 hover:text-blue-700"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden text-white" style={{ backgroundColor: '#0cc0df' }}>
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: '#00a8cb' }}>
              <Link to={user ? "/profil" : "/giris"} className="flex items-center gap-3 hover:text-blue-200 transition duration-200" onClick={() => setMobileMenuOpen(false)}>
                <User size={24} />
                <span>{user ? 'Hesabım' : 'Giriş Yap'}</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setShowMobileCategories(!showMobileCategories)}
                  className="flex items-center gap-2 w-full text-left hover:text-blue-200 transition duration-200"
                >
                  <Menu size={20} />
                  <span>Kategoriler</span>
                  <ChevronDown className={`ml-auto transform transition-transform ${showMobileCategories ? 'rotate-180' : ''}`} size={20} />
                </button>
                
                {showMobileCategories && (
                  <div className="mt-2 rounded-xl p-3" style={{ backgroundColor: '#00a8cb' }}>
                    {/* Horizontal scrollable categories */}
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                      {categories.filter(cat => categoriesWithProducts.has(cat.id)).map(cat => (
                        <Link
                          key={cat.id}
                          to={`/urunler?kategori=${cat.slug}`}
                          className="px-4 py-2 rounded-lg whitespace-nowrap font-semibold text-sm transition flex-shrink-0 hover:opacity-90"
                          style={{ backgroundColor: '#0cc0df' }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                    {/* Expandable sub-categories */}
                    <div className="mt-3 space-y-2">
                      {categories.filter(cat => categoriesWithProducts.has(cat.id)).map(cat => (
                        <div key={cat.id}>
                          {cat.children && cat.children.length > 0 && (
                            <div>
                              <button
                                onClick={() => {
                                  setExpandedMobileCategories(prev => 
                                    prev.includes(cat.id) 
                                      ? prev.filter(id => id !== cat.id)
                                      : [...prev, cat.id]
                                  )
                                }}
                                className="flex items-center justify-between w-full py-2 hover:text-blue-200 transition font-semibold text-sm duration-200"
                              >
                                <span>{cat.name} Alt Kategorileri</span>
                                <ChevronDown 
                                  size={16} 
                                  className={`transform transition-transform ${expandedMobileCategories.includes(cat.id) ? 'rotate-180' : ''}`}
                                />
                              </button>
                              {expandedMobileCategories.includes(cat.id) && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 pl-3" style={{ borderColor: '#0cc0df' }}>
                                  {cat.children.filter(sub => categoriesWithProducts.has(sub.id)).map(subCat => (
                                    <Link
                                      key={subCat.id}
                                      to={`/urunler?kategori=${subCat.slug}`}
                                      className="block py-1.5 text-sm hover:text-blue-200 transition duration-200"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {subCat.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link 
                to="/yeni-urunler" 
                className="block hover:text-blue-200 transition duration-200" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Yeni Ürünler
              </Link>
              <Link 
                to="/kampanyalar" 
                className="block hover:text-blue-200 transition duration-200" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Kampanyalar
              </Link>
              <Link 
                to="/cok-satanlar" 
                className="block hover:text-blue-200 transition duration-200" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Çok Satanlar
              </Link>
              <Link 
                to="/markalar" 
                className="block hover:text-blue-200 transition duration-200" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Markalar
              </Link>
              <Link 
                to="/iletisim" 
                className="block hover:text-blue-200 transition duration-200" 
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* WhatsApp Widget */}
      <WhatsAppWidget />
    </header>
  )
}

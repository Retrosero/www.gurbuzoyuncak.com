import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAnalytics } from './lib/analytics'

// Public Pages
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentFailPage from './pages/PaymentFailPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import FavoritesTestPage from './pages/FavoritesTestPage'
import SearchPage from './pages/SearchPage'
import ProductsPage from './pages/ProductsPage'
import MarkalarPage from './pages/MarkalarPage'
import MarkaDetayPage from './pages/MarkaDetayPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import CareersPage from './pages/CareersPage'
import ReturnsPage from './pages/ReturnsPage'
import FAQPage from './pages/FAQPage'
import OrdersPage from './pages/OrdersPage'
import ButtonTestPage from './pages/ButtonTestPage'

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductAdd from './pages/admin/AdminProductAdd'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'
import AdminBrands from './pages/admin/BrandsPage'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminBanners from './pages/admin/AdminBanners'
import CampaignsPage from './pages/admin/CampaignsPage'
import AdminBulkDiscounts from './pages/admin/AdminBulkDiscounts'
import AdminLoyalty from './pages/admin/AdminLoyalty'
import AdminXMLUpload from './pages/admin/AdminXMLUpload'
import AdminXMLSyncHistory from './pages/admin/AdminXMLSyncHistory'
import AdminXMLSettings from './pages/admin/AdminXMLSettings'
import AdminSettings from './pages/admin/AdminSettings'
import StockAlertsPage from './pages/admin/StockAlertsPage'
import AdminReports from './pages/admin/AdminReports'
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates'
import AdminNotificationCenter from './pages/admin/AdminNotificationCenter'
import AdminPriceAlerts from './pages/admin/AdminPriceAlerts'
// ADMİN KULLANICI TAKİBİ SİSTEMİ
import AdminUserAnalytics from './pages/admin/AdminUserAnalytics'
import AdminFavoritesReport from './pages/admin/AdminFavoritesReport'
import AdminCartAnalysis from './pages/admin/AdminCartAnalysis'
import AdminUserBehavior from './pages/admin/AdminUserBehavior'
import AdminEngagementMetrics from './pages/admin/AdminEngagementMetrics'
// Kullanıcı Yönetimi ve Güvenlik
import AdminUsers from './pages/admin/AdminUsers'
import AdminRoles from './pages/admin/AdminRoles'
import AdminActivityLogs from './pages/admin/AdminActivityLogs'
import AdminSecurityLogs from './pages/admin/AdminSecurityLogs'
import AdminBackups from './pages/admin/AdminBackups'
import AdminBayiler from './pages/admin/AdminBayiler'
import AdminContactMessages from './pages/admin/AdminContactMessages'

// Bayi Pages
import BayiDashboard from './pages/bayi/BayiDashboard'
import BayiBakiye from './pages/bayi/BayiBakiye'
import BayiSiparisler from './pages/bayi/BayiSiparisler'
import BayiAyarlar from './pages/bayi/BayiAyarlar'
import BayiUrunler from './pages/bayi/BayiUrunler'

// Layouts & Components
import Header from './components/Header'
import Footer from './components/Footer'
import AdminLayout from './components/AdminLayout'
import BayiLayout from './components/BayiLayout'
import ProtectedRoute from './components/ProtectedRoute'

import './index.css'

const queryClient = new QueryClient()

function App() {
  // Initialize Google Analytics
  useAnalytics()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <Toaster 
                position="top-right"
                expand={false}
                richColors
              />
            <Routes>
              {/* Public Routes - Normal Site */}
              <Route path="/" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <HomePage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/button-test" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <ButtonTestPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/urun/:slug" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <ProductDetailPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/kategori/:slug" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <CategoryPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/urunler" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <ProductsPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/markalar" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <MarkalarPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/markalar/:slug" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <MarkaDetayPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/arama" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <SearchPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/sepet" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <CartPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/odeme" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <CheckoutPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/giris" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <LoginPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/kayit" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <RegisterPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/odeme-basarili" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <PaymentSuccessPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/odeme-basarisiz" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <PaymentFailPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/profil" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <ProfilePage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/favoriler" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <FavoritesPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/favoriler-test" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <FavoritesTestPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/iletisim" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <ContactPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/hakkimizda" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <AboutPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/kariyer" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <CareersPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/iade" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <ReturnsPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/sss" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <FAQPage />
                  </main>
                  <Footer />
                </div>
              } />
              <Route path="/siparislerim" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <OrdersPage />
                  </main>
                  <Footer />
                </div>
              } />

              {/* Admin Login - Ayrı Sayfa */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin Routes - Protected & Ayrı Layout */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/urunler" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminProducts />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/urunler/yeni" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminProductAdd />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/siparisler" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/kategoriler" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminCategories />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/markalar" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminBrands />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/musteriler" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminCustomers />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/kuponlar" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminCoupons />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/bannerlar" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminBanners />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/kampanyalar" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <CampaignsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/toplu-indirim" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminBulkDiscounts />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/sadakat" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminLoyalty />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/xml/yukle" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminXMLUpload />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/xml/gecmis" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminXMLSyncHistory />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/xml/ayarlar" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminXMLSettings />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              {/* Legacy route - redirect to new */}
              <Route path="/admin/xml-yukle" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminXMLUpload />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/stok-uyarilari" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <StockAlertsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminReports />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/email-templates" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminEmailTemplates />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/notification-center" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminNotificationCenter />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/price-alerts" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminPriceAlerts />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/ayarlar" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* ADMİN KULLANICI TAKİBİ SİSTEMİ */}
              <Route path="/admin/user-analytics" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminUserAnalytics />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/favorites-report" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminFavoritesReport />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/cart-analysis" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminCartAnalysis />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/user-behavior" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminUserBehavior />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/engagement-metrics" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminEngagementMetrics />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* Kullanıcı Yönetimi ve Güvenlik */}
              <Route path="/admin/kullanicilar" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/roller" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminRoles />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/aktivite-loglari" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminActivityLogs />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/guvenlik-loglari" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminSecurityLogs />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/yedekleme" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminBackups />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/iletisim-mesajlari" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminContactMessages />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* Bayi Login - Normal giriş sayfasına yönlendir */}
              <Route path="/bayi" element={
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-grow">
                    <LoginPage />
                  </main>
                  <Footer />
                </div>
              } />

              {/* Bayi Routes - Protected & Ayrı Layout */}
              <Route path="/bayi/dashboard" element={
                <ProtectedRoute approvedBayiOnly>
                  <BayiLayout>
                    <BayiDashboard />
                  </BayiLayout>
                </ProtectedRoute>
              } />
              <Route path="/bayi/urunler" element={
                <ProtectedRoute approvedBayiOnly>
                  <BayiLayout>
                    <BayiUrunler />
                  </BayiLayout>
                </ProtectedRoute>
              } />
              <Route path="/bayi/bakiye" element={
                <ProtectedRoute approvedBayiOnly>
                  <BayiLayout>
                    <BayiBakiye />
                  </BayiLayout>
                </ProtectedRoute>
              } />
              <Route path="/bayi/siparisler" element={
                <ProtectedRoute approvedBayiOnly>
                  <BayiLayout>
                    <BayiSiparisler />
                  </BayiLayout>
                </ProtectedRoute>
              } />
              <Route path="/bayi/ayarlar" element={
                <ProtectedRoute approvedBayiOnly>
                  <BayiLayout>
                    <BayiAyarlar />
                  </BayiLayout>
                </ProtectedRoute>
              } />
            </Routes>
            </BrowserRouter>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

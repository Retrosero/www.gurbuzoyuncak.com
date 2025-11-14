import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'bayi' | 'approved-bayi'
  adminOnly?: boolean
  bayiOnly?: boolean
  approvedBayiOnly?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  adminOnly = false,
  bayiOnly = false,
  approvedBayiOnly = false
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, isAdmin, isApprovedBayi, isBayi } = useProfile()

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Kullanıcı giriş yapmamış
  if (!user) {
    // Bayi sayfaları için bayi login'e yönlendir
    if (bayiOnly || approvedBayiOnly) {
      return <Navigate to="/bayi" replace />
    }
    // Admin sayfaları için admin login'e yönlendir
    return <Navigate to="/admin/login" replace />
  }

  // Profile bilgisi yok
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profil bilgileri yüklenemedi</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    )
  }

  // Admin kontrolü
  if (adminOnly || requiredRole === 'admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Erişim Reddedildi</h2>
              <p className="text-gray-600 mb-4">Bu sayfaya erişim için admin yetkisine sahip olmalısınız.</p>
              <p className="text-sm text-gray-500 mb-6">
                Eğer admin yetkiniz olduğunu düşünüyorsanız, lütfen sistem yöneticisi ile iletişime geçin.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // Bayi kontrolü
  if (bayiOnly || requiredRole === 'bayi') {
    if (!isBayi) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-red-600 mb-4">Bu sayfaya erişim için bayi yetkisine sahip olmalısınız.</p>
            <Navigate to="/bayi" replace />
          </div>
        </div>
      )
    }
  }

  // Onaylı bayi kontrolü
  if (approvedBayiOnly || requiredRole === 'approved-bayi') {
    if (!isApprovedBayi) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-red-600 mb-4">Bu sayfaya erişim için onaylı bayi yetkisine sahip olmalısınız.</p>
            <Navigate to="/bayi" replace />
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

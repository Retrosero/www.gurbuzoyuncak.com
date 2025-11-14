import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

type UserType = 'customer' | 'dealer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<UserType>('customer')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signInWithGoogle, signInWithFacebook, authSettings } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // Giriş yap
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Kullanıcı profilini kontrol et
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('customer_type, is_admin, dealer_approved')
        .eq('user_id', authData.user?.id)
        .single()

      if (profileError) throw profileError

      // Kullanıcı tipi doğrulaması ve yönlendirme
      if (userType === 'dealer') {
        if (!['B2B', 'Toptan', 'Kurumsal'].includes(profile.customer_type)) {
          await supabase.auth.signOut()
          throw new Error('Bu hesap bayi hesabı değil. Lütfen müşteri girişi seçin.')
        }
        if (!profile.dealer_approved) {
          await supabase.auth.signOut()
          throw new Error('Bayi hesabınız henüz onaylanmamış. Lütfen yönetici ile iletişime geçin.')
        }
        toast.success('Bayi paneline yönlendiriliyorsunuz...')
        navigate('/bayi/dashboard')
      } else {
        // Müşteri girişi - onaysız bayi değilse ana sayfaya yönlendir
        if (['B2B', 'Toptan', 'Kurumsal'].includes(profile.customer_type) && !profile.dealer_approved) {
          await supabase.auth.signOut()
          throw new Error('Bayi hesabınız henüz onaylanmamış.')
        } else {
          toast.success('Başarıyla giriş yaptınız!')
          navigate('/')
        }
      }
    } catch (err: any) {
      setError(err.message)
      toast.error('Giriş başarısız: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      toast.info('Google ile giriş yapılıyor...')
    } catch (err: any) {
      toast.error('Google ile giriş başarısız: ' + err.message)
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithFacebook()
      toast.info('Facebook ile giriş yapılıyor...')
    } catch (err: any) {
      toast.error('Facebook ile giriş başarısız: ' + err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Giriş Yap</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Kullanıcı Tipi Seçimi */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-gray-700">Giriş Tipi</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUserType('customer')}
              className={`px-4 py-3 rounded-lg border-2 transition text-sm font-medium ${
                userType === 'customer'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              Müşteri
            </button>
            <button
              type="button"
              onClick={() => setUserType('dealer')}
              className={`px-4 py-3 rounded-lg border-2 transition text-sm font-medium ${
                userType === 'dealer'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              Bayi
            </button>
          </div>
        </div>

        {/* Sosyal Medya Login - Sadece aktif olanlar gösterilir */}
        {(authSettings.googleAuthEnabled || authSettings.facebookAuthEnabled) && (
          <div className="space-y-3 mb-6">
            {authSettings.googleAuthEnabled && (
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full flex items-center justify-center gap-3 border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google ile Devam Et
              </Button>
            )}

            {authSettings.facebookAuthEnabled && (
              <Button
                onClick={handleFacebookLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full flex items-center justify-center gap-3 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook ile Devam Et
              </Button>
            )}
          </div>
        )}

        {/* Ayırıcı - sadece sosyal medya login varsa gösterilir */}
        {(authSettings.googleAuthEnabled || authSettings.facebookAuthEnabled) && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">veya</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ease-in-out hover:shadow-md hover:border-accent/50 focus:shadow-lg"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 ease-in-out hover:shadow-md hover:border-accent/50 focus:shadow-lg"
              required
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            variant="accent"
            className="w-full py-3" 
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Hesabınız yok mu?{' '}
          <Link to="/kayit" className="text-blue-700 hover:underline font-medium">
            Kayıt olun
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link to="/sifremi-unuttum" className="text-sm text-blue-600 hover:underline">
            Şifremi unuttum
          </Link>
        </div>
      </div>
    </div>
  )
}

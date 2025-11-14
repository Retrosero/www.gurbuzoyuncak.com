import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Store, Lock, Mail } from 'lucide-react'

export default function BayiLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Supabase authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Kullanıcının bayi olup olmadığını kontrol et
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('customer_type, dealer_approved, dealer_company_name')
        .eq('user_id', data.user?.id)
        .single()

      if (profileError) throw profileError

      // Bayi kontrolü
      if (!['B2B', 'Toptan', 'Kurumsal'].includes(profile.customer_type)) {
        await supabase.auth.signOut()
        throw new Error('Bu alan sadece bayiler içindir. Lütfen normal giriş sayfasını kullanın.')
      }

      if (!profile.dealer_approved) {
        await supabase.auth.signOut()
        throw new Error('Bayi hesabınız henüz onaylanmamış. Lütfen yönetici ile iletişime geçin.')
      }

      // Başarılı giriş - dashboard'a yönlendir
      navigate('/bayi/dashboard')
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız oldu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-full mb-4">
            <Store className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bayi Paneli</h1>
          <p className="text-gray-600">Gürbüz Oyuncak B2B Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="bayi@firma.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Bayi olmak ister misiniz?{' '}
              <a href="mailto:info@gurbuzoyuncak.com" className="text-blue-700 hover:underline">
                Başvuru yapın
              </a>
            </p>
          </div>
        </div>

        {/* Demo Bilgisi */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Demo Bayi Girişi:</p>
          <p>Email: abc@oyuncak.com</p>
          <p>Şifre: DemoB@yi123</p>
        </div>
      </div>
    </div>
  )
}

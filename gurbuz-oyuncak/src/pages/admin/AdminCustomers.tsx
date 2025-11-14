import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, Search, Mail, Phone } from 'lucide-react'

interface Customer {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  customer_type: string
  created_at: string
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Müşteriler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCustomerTypeLabel = (type: string) => {
    const types: any = {
      'B2C': 'Bireysel',
      'B2B': 'Bayi',
      'Wholesale': 'Toptan',
      'Corporate': 'Kurumsal'
    }
    return types[type] || type
  }

  const getCustomerTypeColor = (type: string) => {
    const colors: any = {
      'B2C': 'bg-green-100 text-green-700',
      'B2B': 'bg-green-100 text-green-700',
      'Wholesale': 'bg-purple-100 text-purple-700',
      'Corporate': 'bg-orange-100 text-orange-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Müşteri Yönetimi</h2>
        <p className="text-gray-600 mt-1">Tüm müşterileri görüntüle ve yönet</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Toplam Müşteri</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Bireysel</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {customers.filter(c => c.customer_type === 'B2C').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Bayi</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {customers.filter(c => c.customer_type === 'B2B').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <p className="text-gray-600 text-sm">Kurumsal</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {customers.filter(c => c.customer_type === 'Corporate').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Users className="text-green-700" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {customer.full_name || 'İsimsiz Müşteri'}
                        </p>
                        <p className="text-sm text-gray-500">{customer.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getCustomerTypeColor(customer.customer_type)}`}>
                      {getCustomerTypeLabel(customer.customer_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">Müşteri bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  )
}
